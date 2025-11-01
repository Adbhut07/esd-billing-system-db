"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectricityController = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Zod validation schemas
const uploadElectricityReadingSchema = zod_1.z.object({
    houseId: zod_1.z.number().int().positive(),
    month: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/)),
    importReading: zod_1.z.number().min(0),
    exportReading: zod_1.z.number().min(0),
    maxDemand: zod_1.z.number().min(0).optional(),
});
const bulkUploadReadingsSchema = zod_1.z.object({
    month: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/)),
    readings: zod_1.z.array(zod_1.z.object({
        houseNumber: zod_1.z.string(),
        mohallaNumber: zod_1.z.string(),
        importReading: zod_1.z.number().min(0).nullable().optional(),
        exportReading: zod_1.z.number().min(0).nullable().optional(),
        maxDemand: zod_1.z.number().min(0).nullable().optional(),
    })).min(1),
});
const updateElectricityReadingSchema = zod_1.z.object({
    importReading: zod_1.z.number().min(0).optional(),
    exportReading: zod_1.z.number().min(0).optional(),
    maxDemand: zod_1.z.number().min(0).optional(),
});
const getReadingsQuerySchema = zod_1.z.object({
    houseId: zod_1.z.string().optional(),
    mohallaId: zod_1.z.string().optional(),
    month: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('50'),
});
const getReadingByHouseAndMonthSchema = zod_1.z.object({
    houseId: zod_1.z.string(),
    month: zod_1.z.string(),
});
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
class ElectricityController {
    // Helper method to calculate consumption (matching old formula)
    static async calculateConsumption(houseId, currentImport, currentExport, monthDate) {
        // Get previous month's reading
        const previousReading = await prisma.reading.findFirst({
            where: {
                houseId,
                month: {
                    lt: monthDate,
                },
            },
            orderBy: {
                month: 'desc',
            },
        });
        let consumption = 0;
        let billedEnergy = 0;
        let carryForward = 0;
        if (previousReading) {
            // Calculate import and export differences
            const importDifference = currentImport - previousReading.electricityImportReading;
            const exportDifference = currentExport - previousReading.electricityExportReading;
            // Consumption = Import difference - Export difference
            consumption = importDifference - exportDifference;
            // Get the month number (1-12)
            const currentMonth = monthDate.getMonth() + 1;
            // Get previous carry forward
            const prevCarryForward = previousReading.electricityExportCarryForward || 0;
            // Calculate billed energy
            // Special case: April (month 4) resets the carry forward (fiscal year reset)
            if (currentMonth === 4) {
                billedEnergy = consumption;
            }
            else {
                billedEnergy = consumption - prevCarryForward;
            }
            // If billed energy is negative, set it to 0 and carry forward the excess
            if (billedEnergy < 0) {
                if (currentMonth === 4) {
                    carryForward = -billedEnergy;
                }
                else {
                    carryForward = -billedEnergy + prevCarryForward;
                }
                billedEnergy = 0;
            }
            else {
                carryForward = 0;
            }
        }
        else {
            // First reading - no previous data
            consumption = 0;
            billedEnergy = 0;
            carryForward = 0;
        }
        return {
            consumption,
            billedEnergy,
            carryForward,
        };
    }
    // Helper method to calculate charges from rates
    static async calculateCharges(billedEnergy) {
        // Get charge rates from database
        const chargeRates = await prisma.charges.findMany();
        const rates = {};
        chargeRates.forEach(charge => {
            rates[charge.name.toLowerCase()] = charge.amount;
        });
        const fixedCharge = (rates['fixed_charge_rate'] || 0) * billedEnergy;
        const electricityCharge = (rates['electricity_charge_rate'] || 0) * billedEnergy;
        const electricityDuty = (rates['electricity_duty_rate'] || 0) * billedEnergy;
        const maintenanceCharge = (rates['maintenance_charge_rate'] || 0) * billedEnergy;
        return {
            fixedCharge,
            electricityCharge,
            electricityDuty,
            maintenanceCharge,
        };
    }
    // Get all electricity readings with filters
    static async getElectricityReadings(req, res) {
        try {
            // Validate query parameters
            const validationResult = getReadingsQuerySchema.safeParse(req.query);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid query parameters',
                    errors: validationResult.error.issues,
                });
            }
            const { houseId, mohallaId, month, startDate, endDate, page, limit, } = validationResult.data;
            const where = {};
            if (houseId) {
                where.houseId = Number(houseId);
            }
            if (mohallaId) {
                where.house = {
                    mohallaId: Number(mohallaId),
                };
            }
            if (month) {
                const monthDate = new Date(month);
                monthDate.setDate(1);
                where.month = monthDate;
            }
            if (startDate && endDate) {
                where.month = {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                };
            }
            else if (startDate) {
                where.month = {
                    gte: new Date(startDate),
                };
            }
            else if (endDate) {
                where.month = {
                    lte: new Date(endDate),
                };
            }
            const pageNum = Number(page);
            const limitNum = Number(limit);
            const [readings, total] = await Promise.all([
                prisma.reading.findMany({
                    where,
                    include: {
                        house: {
                            include: {
                                mohalla: true,
                            },
                        },
                    },
                    orderBy: {
                        month: 'desc',
                    },
                    skip: (pageNum - 1) * limitNum,
                    take: limitNum,
                }),
                prisma.reading.count({ where }),
            ]);
            return res.status(200).json({
                success: true,
                message: 'Electricity readings fetched successfully',
                data: readings,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch electricity readings',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Get single reading by ID
    static async getReadingById(req, res) {
        try {
            // Validate params
            const validationResult = idParamSchema.safeParse(req.params);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reading ID',
                    errors: validationResult.error.issues,
                });
            }
            const { id } = validationResult.data;
            const reading = await prisma.reading.findUnique({
                where: { id: Number(id) },
                include: {
                    house: {
                        include: {
                            mohalla: true,
                        },
                    },
                },
            });
            if (!reading) {
                return res.status(404).json({
                    success: false,
                    message: 'Reading not found',
                });
            }
            return res.status(200).json({
                success: true,
                data: reading,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch reading',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Get reading by house and month
    static async getReadingByHouseAndMonth(req, res) {
        try {
            // Validate query parameters
            const validationResult = getReadingByHouseAndMonthSchema.safeParse(req.query);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'houseId and month are required',
                    errors: validationResult.error.issues,
                });
            }
            const { houseId, month } = validationResult.data;
            const monthDate = new Date(month);
            monthDate.setDate(1);
            const reading = await prisma.reading.findUnique({
                where: {
                    houseId_month: {
                        houseId: Number(houseId),
                        month: monthDate,
                    },
                },
                include: {
                    house: {
                        include: {
                            mohalla: true,
                        },
                    },
                },
            });
            if (!reading) {
                return res.status(404).json({
                    success: false,
                    message: 'Reading not found for this house and month',
                });
            }
            return res.status(200).json({
                success: true,
                data: reading,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch reading',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Upload new electricity reading
    static async uploadElectricityReading(req, res) {
        try {
            // Validate request body
            const validationResult = uploadElectricityReadingSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data',
                    errors: validationResult.error.issues,
                });
            }
            const { houseId, month, importReading, exportReading, maxDemand } = validationResult.data;
            // Parse month to Date
            const monthDate = new Date(month);
            monthDate.setDate(1);
            // Check if house exists
            const house = await prisma.house.findUnique({
                where: { id: houseId },
                include: { mohalla: true },
            });
            if (!house) {
                return res.status(404).json({
                    success: false,
                    message: 'House not found',
                });
            }
            // Check if reading already exists for this month
            const existingReading = await prisma.reading.findUnique({
                where: {
                    houseId_month: {
                        houseId,
                        month: monthDate,
                    },
                },
            });
            if (existingReading && existingReading.electricityImportReading !== 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Electricity reading already exists for this month',
                });
            }
            // Calculate consumption
            const { consumption, billedEnergy, carryForward } = await ElectricityController.calculateConsumption(houseId, importReading, exportReading, monthDate);
            // Calculate charges
            const { fixedCharge, electricityCharge, electricityDuty, maintenanceCharge } = await ElectricityController.calculateCharges(billedEnergy);
            let reading;
            if (existingReading) {
                // Update existing reading with electricity data
                reading = await prisma.reading.update({
                    where: { id: existingReading.id },
                    data: {
                        electricityImportReading: importReading,
                        electricityExportReading: exportReading,
                        electricityConsumption: consumption,
                        electricityBilledEnergy: billedEnergy,
                        electricityExportCarryForward: carryForward,
                        maxDemand: maxDemand ?? 0,
                        electricityReadingUploadDate: new Date(),
                        fixedCharge,
                        electricityCharge,
                        electricityDuty,
                        maintenanceCharge,
                    },
                    include: {
                        house: {
                            include: {
                                mohalla: true,
                            },
                        },
                    },
                });
                return res.status(200).json({
                    success: true,
                    message: 'Electricity reading updated successfully',
                    data: reading,
                });
            }
            else {
                // Create new reading
                reading = await prisma.reading.create({
                    data: {
                        houseId,
                        month: monthDate,
                        electricityImportReading: importReading,
                        electricityExportReading: exportReading,
                        electricityConsumption: consumption,
                        electricityBilledEnergy: billedEnergy,
                        electricityExportCarryForward: carryForward,
                        maxDemand: maxDemand ?? 0,
                        electricityReadingUploadDate: new Date(),
                        fixedCharge,
                        electricityCharge,
                        electricityDuty,
                        maintenanceCharge,
                    },
                    include: {
                        house: {
                            include: {
                                mohalla: true,
                            },
                        },
                    },
                });
                return res.status(201).json({
                    success: true,
                    message: 'Electricity reading uploaded successfully',
                    data: reading,
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload reading',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Bulk upload electricity readings
    static async bulkUploadReadings(req, res) {
        try {
            // Validate request body
            const validationResult = bulkUploadReadingsSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data',
                    errors: validationResult.error.issues,
                });
            }
            const { month, readings } = validationResult.data;
            const monthDate = new Date(month);
            monthDate.setDate(1);
            const results = {
                success: 0,
                failed: 0,
                errors: [],
                uploaded: [],
            };
            // Process each reading
            for (const readingData of readings) {
                try {
                    // Skip if all values are null
                    if (readingData.importReading === null &&
                        readingData.exportReading === null &&
                        readingData.maxDemand === null) {
                        continue;
                    }
                    // Find house by house number and mohalla number
                    const house = await prisma.house.findFirst({
                        where: {
                            houseNumber: readingData.houseNumber,
                            mohalla: {
                                number: readingData.mohallaNumber,
                            },
                        },
                        include: {
                            mohalla: true,
                        },
                    });
                    if (!house) {
                        results.failed++;
                        results.errors.push({
                            houseNumber: readingData.houseNumber,
                            mohallaNumber: readingData.mohallaNumber,
                            error: `House not found: ${readingData.mohallaNumber}/${readingData.houseNumber}`,
                        });
                        continue;
                    }
                    // Set default values for null readings
                    const importReading = readingData.importReading ?? 0;
                    const exportReading = readingData.exportReading ?? 0;
                    const maxDemand = readingData.maxDemand ?? 0;
                    // Calculate consumption
                    const { consumption, billedEnergy, carryForward } = await ElectricityController.calculateConsumption(house.id, importReading, exportReading, monthDate);
                    // Calculate charges
                    const { fixedCharge, electricityCharge, electricityDuty, maintenanceCharge } = await ElectricityController.calculateCharges(billedEnergy);
                    // Check if reading already exists
                    const existingReading = await prisma.reading.findUnique({
                        where: {
                            houseId_month: {
                                houseId: house.id,
                                month: monthDate,
                            },
                        },
                    });
                    let reading;
                    if (existingReading) {
                        // Update existing reading
                        reading = await prisma.reading.update({
                            where: { id: existingReading.id },
                            data: {
                                electricityImportReading: importReading,
                                electricityExportReading: exportReading,
                                electricityConsumption: consumption,
                                electricityBilledEnergy: billedEnergy,
                                electricityExportCarryForward: carryForward,
                                maxDemand,
                                electricityReadingUploadDate: new Date(),
                                fixedCharge,
                                electricityCharge,
                                electricityDuty,
                                maintenanceCharge,
                            },
                        });
                    }
                    else {
                        // Create new reading
                        reading = await prisma.reading.create({
                            data: {
                                houseId: house.id,
                                month: monthDate,
                                electricityImportReading: importReading,
                                electricityExportReading: exportReading,
                                electricityConsumption: consumption,
                                electricityBilledEnergy: billedEnergy,
                                electricityExportCarryForward: carryForward,
                                maxDemand,
                                electricityReadingUploadDate: new Date(),
                                fixedCharge,
                                electricityCharge,
                                electricityDuty,
                                maintenanceCharge,
                            },
                        });
                    }
                    results.success++;
                    results.uploaded.push({
                        houseNumber: readingData.houseNumber,
                        mohallaNumber: readingData.mohallaNumber,
                        readingId: reading.id,
                    });
                }
                catch (error) {
                    results.failed++;
                    results.errors.push({
                        houseNumber: readingData.houseNumber,
                        mohallaNumber: readingData.mohallaNumber,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
            return res.status(200).json({
                success: true,
                message: `Bulk upload completed. Success: ${results.success}, Failed: ${results.failed}`,
                data: results,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Bulk upload failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Update electricity reading
    static async updateElectricityReading(req, res) {
        try {
            // Validate params
            const paramValidation = idParamSchema.safeParse(req.params);
            if (!paramValidation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reading ID',
                    errors: paramValidation.error.issues,
                });
            }
            // Validate body
            const bodyValidation = updateElectricityReadingSchema.safeParse(req.body);
            if (!bodyValidation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data',
                    errors: bodyValidation.error.issues,
                });
            }
            const { id } = paramValidation.data;
            const { importReading, exportReading, maxDemand } = bodyValidation.data;
            const reading = await prisma.reading.findUnique({
                where: { id: Number(id) },
            });
            if (!reading) {
                return res.status(404).json({
                    success: false,
                    message: 'Reading not found',
                });
            }
            const newImportReading = importReading ?? reading.electricityImportReading;
            const newExportReading = exportReading ?? reading.electricityExportReading;
            const newMaxDemand = maxDemand ?? reading.maxDemand;
            // Recalculate consumption
            const { consumption, billedEnergy, carryForward } = await ElectricityController.calculateConsumption(reading.houseId, newImportReading, newExportReading, reading.month);
            // Recalculate charges
            const { fixedCharge, electricityCharge, electricityDuty, maintenanceCharge } = await ElectricityController.calculateCharges(billedEnergy);
            // Update reading
            const updatedReading = await prisma.reading.update({
                where: { id: Number(id) },
                data: {
                    electricityImportReading: newImportReading,
                    electricityExportReading: newExportReading,
                    electricityConsumption: consumption,
                    electricityBilledEnergy: billedEnergy,
                    electricityExportCarryForward: carryForward,
                    maxDemand: newMaxDemand,
                    electricityReadingUploadDate: new Date(),
                    fixedCharge,
                    electricityCharge,
                    electricityDuty,
                    maintenanceCharge,
                },
                include: {
                    house: {
                        include: {
                            mohalla: true,
                        },
                    },
                },
            });
            return res.status(200).json({
                success: true,
                message: 'Electricity reading updated successfully',
                data: updatedReading,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update reading',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Delete electricity reading
    static async deleteElectricityReading(req, res) {
        try {
            // Validate params
            const validationResult = idParamSchema.safeParse(req.params);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reading ID',
                    errors: validationResult.error.issues,
                });
            }
            const { id } = validationResult.data;
            const reading = await prisma.reading.findUnique({
                where: { id: Number(id) },
            });
            if (!reading) {
                return res.status(404).json({
                    success: false,
                    message: 'Reading not found',
                });
            }
            // Check if there are future readings
            const futureReadings = await prisma.reading.findMany({
                where: {
                    houseId: reading.houseId,
                    month: {
                        gt: reading.month,
                    },
                },
            });
            if (futureReadings.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete reading. Future readings exist and would be affected.',
                });
            }
            await prisma.reading.delete({
                where: { id: Number(id) },
            });
            return res.status(200).json({
                success: true,
                message: 'Reading deleted successfully',
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete reading',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Recalculate consumption for a reading
    static async recalculateConsumption(req, res) {
        try {
            // Validate params
            const validationResult = idParamSchema.safeParse(req.params);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reading ID',
                    errors: validationResult.error.issues,
                });
            }
            const { id } = validationResult.data;
            const reading = await prisma.reading.findUnique({
                where: { id: Number(id) },
            });
            if (!reading) {
                return res.status(404).json({
                    success: false,
                    message: 'Reading not found',
                });
            }
            const { consumption, billedEnergy, carryForward } = await ElectricityController.calculateConsumption(reading.houseId, reading.electricityImportReading, reading.electricityExportReading, reading.month);
            const { fixedCharge, electricityCharge, electricityDuty, maintenanceCharge } = await ElectricityController.calculateCharges(billedEnergy);
            const updatedReading = await prisma.reading.update({
                where: { id: Number(id) },
                data: {
                    electricityConsumption: consumption,
                    electricityBilledEnergy: billedEnergy,
                    electricityExportCarryForward: carryForward,
                    fixedCharge,
                    electricityCharge,
                    electricityDuty,
                    maintenanceCharge,
                },
                include: {
                    house: {
                        include: {
                            mohalla: true,
                        },
                    },
                },
            });
            return res.status(200).json({
                success: true,
                message: 'Consumption recalculated successfully',
                data: updatedReading,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to recalculate consumption',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.ElectricityController = ElectricityController;
//# sourceMappingURL=electricity.controller.js.map