"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillController = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Zod validation schemas
const updateOtherChargesSchema = zod_1.z.object({
    houseId: zod_1.z.number().int().positive(),
    month: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    otherCharges: zod_1.z.number().min(0),
});
const generateBillSchema = zod_1.z.object({
    houseId: zod_1.z.number().int().positive(),
    month: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});
const updatePaidAmountSchema = zod_1.z.object({
    readingId: zod_1.z.number().int().positive(),
    amount: zod_1.z.number().positive(),
    paidOn: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});
const getBillsQuerySchema = zod_1.z.object({
    houseId: zod_1.z.string().optional(),
    mohallaId: zod_1.z.string().optional(),
    month: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    billStatus: zod_1.z.enum(['PENDING', 'GENERATED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE']).optional(),
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('50'),
});
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
class BillController {
    // Helper method to calculate water charge
    static async calculateWaterCharge(waterConsumption) {
        const waterChargeRate = await prisma.charges.findUnique({
            where: { name: 'water_charge_rate' },
        });
        return (waterChargeRate?.amount || 0) * waterConsumption;
    }
    // Get all bills with filters
    static async getBills(req, res) {
        try {
            // Validate query parameters
            const validationResult = getBillsQuerySchema.safeParse(req.query);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid query parameters',
                    errors: validationResult.error.issues,
                });
            }
            const { houseId, mohallaId, month, startDate, endDate, billStatus, page, limit, } = validationResult.data;
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
            if (billStatus) {
                where.billStatus = billStatus;
            }
            const pageNum = Number(page);
            const limitNum = Number(limit);
            const [bills, total] = await Promise.all([
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
                message: 'Bills fetched successfully',
                data: bills,
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
                message: 'Failed to fetch bills',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Get single bill by ID
    static async getBillById(req, res) {
        try {
            // Validate params
            const validationResult = idParamSchema.safeParse(req.params);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid bill ID',
                    errors: validationResult.error.issues,
                });
            }
            const { id } = validationResult.data;
            const bill = await prisma.reading.findUnique({
                where: { id: Number(id) },
                include: {
                    house: {
                        include: {
                            mohalla: true,
                        },
                    },
                },
            });
            if (!bill) {
                return res.status(404).json({
                    success: false,
                    message: 'Bill not found',
                });
            }
            return res.status(200).json({
                success: true,
                data: bill,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch bill',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Update other charges for a reading
    static async updateOtherCharges(req, res) {
        try {
            // Validate request body
            const validationResult = updateOtherChargesSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data',
                    errors: validationResult.error.issues,
                });
            }
            const { houseId, month, otherCharges } = validationResult.data;
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
            // Check if reading exists for this month
            const reading = await prisma.reading.findUnique({
                where: {
                    houseId_month: {
                        houseId,
                        month: monthDate,
                    },
                },
            });
            if (!reading) {
                return res.status(404).json({
                    success: false,
                    message: 'Reading not found for this month',
                });
            }
            // Update other charges
            const updatedReading = await prisma.reading.update({
                where: { id: reading.id },
                data: {
                    otherCharges,
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
                message: 'Other charges updated successfully',
                data: updatedReading,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update other charges',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Generate bill for a reading (matching old formula exactly)
    static async generateBill(req, res) {
        try {
            // Validate request body
            const validationResult = generateBillSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data',
                    errors: validationResult.error.issues,
                });
            }
            const { houseId, month } = validationResult.data;
            // Parse month to Date
            const monthDate = new Date(month);
            monthDate.setDate(1);
            // Get house details
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
            // Get current reading
            const currentReading = await prisma.reading.findUnique({
                where: {
                    houseId_month: {
                        houseId,
                        month: monthDate,
                    },
                },
            });
            if (!currentReading) {
                return res.status(404).json({
                    success: false,
                    message: 'Reading not found for this month',
                });
            }
            // Validate that both electricity and water readings are entered
            if (currentReading.electricityImportReading === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Electricity reading has not been entered',
                });
            }
            if (currentReading.waterReading === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Water reading has not been entered',
                });
            }
            // Get previous month's reading
            const previousMonthDate = new Date(monthDate);
            previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
            const previousReading = await prisma.reading.findUnique({
                where: {
                    houseId_month: {
                        houseId,
                        month: previousMonthDate,
                    },
                },
            });
            if (!previousReading) {
                return res.status(400).json({
                    success: false,
                    message: 'Could not generate bill because the previous reading is not available',
                });
            }
            // Validate charges are not zero
            if (Number(currentReading.fixedCharge) === 0 &&
                Number(currentReading.electricityCharge) === 0 &&
                Number(currentReading.electricityDuty) === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'The values of fixed charge, electricity charge and electricity duty are not updated and are 0',
                });
            }
            if (Number(house.licenseFee) === 0 &&
                Number(house.residenceFee) === 0 &&
                Number(currentReading.maintenanceCharge) === 0 &&
                Number(currentReading.waterCharge) === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'The values of license fee, residence fee, maintenance charges and water charges are not updated and are 0',
                });
            }
            // Calculate Bill 1 (Electricity Bill)
            // Bill 1 = fixed_charge + electricity_charge + electricity_duty + arrears from last month
            const previousBill1Arrear = previousReading.paidAmount === null
                ? Number(previousReading.bill1After15)
                : previousReading.bill1Arrear !== null
                    ? Number(previousReading.bill1Arrear)
                    : 0;
            const bill1Upto15 = Number(currentReading.fixedCharge) +
                Number(currentReading.electricityCharge) +
                Number(currentReading.electricityDuty) +
                previousBill1Arrear;
            // Add 1.5% penalty after 15th
            const bill1After15 = bill1Upto15 + bill1Upto15 * 0.015;
            // Calculate Bill 2 (Water + Other Charges)
            // Bill 2 = license_fee + residence_fee + maintenance_charge + water_charge + other_charges + arrears from last month
            const previousBill2Arrear = previousReading.paidAmount === null
                ? Number(previousReading.bill2After15)
                : previousReading.bill2Arrear !== null
                    ? Number(previousReading.bill2Arrear)
                    : 0;
            let bill2Upto15 = 0;
            if (currentReading.otherCharges &&
                !isNaN(Number(currentReading.otherCharges)) &&
                currentReading.otherCharges !== null) {
                bill2Upto15 =
                    Number(house.licenseFee) +
                        Number(house.residenceFee) +
                        Number(currentReading.maintenanceCharge) +
                        Number(currentReading.otherCharges) +
                        Number(currentReading.waterCharge) +
                        previousBill2Arrear;
            }
            else {
                bill2Upto15 =
                    Number(house.licenseFee) +
                        Number(house.residenceFee) +
                        Number(currentReading.maintenanceCharge) +
                        Number(currentReading.waterCharge) +
                        previousBill2Arrear;
            }
            // Add 1.5% penalty after 15th
            const bill2After15 = bill2Upto15 + bill2Upto15 * 0.015;
            // Calculate total bills
            const totalBillUpto15 = bill1Upto15 + bill2Upto15;
            const totalBillAfter15 = bill1After15 + bill2After15;
            // Update the reading with bill amounts
            const updatedReading = await prisma.reading.update({
                where: { id: currentReading.id },
                data: {
                    bill1Upto15,
                    bill1After15,
                    bill2Upto15,
                    bill2After15,
                    totalBillUpto15,
                    totalBillAfter15,
                    billStatus: client_1.BillStatus.GENERATED,
                    billGeneratedAt: new Date(),
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
                message: 'Bill generated successfully',
                data: {
                    reading: updatedReading,
                    billBreakdown: {
                        bill1: {
                            upto15: bill1Upto15,
                            after15: bill1After15,
                            components: {
                                fixedCharge: Number(currentReading.fixedCharge),
                                electricityCharge: Number(currentReading.electricityCharge),
                                electricityDuty: Number(currentReading.electricityDuty),
                                arrears: previousBill1Arrear,
                            },
                        },
                        bill2: {
                            upto15: bill2Upto15,
                            after15: bill2After15,
                            components: {
                                licenseFee: Number(house.licenseFee),
                                residenceFee: Number(house.residenceFee),
                                maintenanceCharge: Number(currentReading.maintenanceCharge),
                                waterCharge: Number(currentReading.waterCharge),
                                otherCharges: Number(currentReading.otherCharges || 0),
                                arrears: previousBill2Arrear,
                            },
                        },
                        total: {
                            upto15: totalBillUpto15,
                            after15: totalBillAfter15,
                        },
                    },
                },
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate bill',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Update paid amount for a bill
    static async updatePaidAmount(req, res) {
        try {
            // Validate request body
            const validationResult = updatePaidAmountSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data',
                    errors: validationResult.error.issues,
                });
            }
            const { readingId, amount, paidOn } = validationResult.data;
            // Parse paid date
            const paidDate = new Date(paidOn);
            // Get the reading
            const reading = await prisma.reading.findUnique({
                where: { id: readingId },
            });
            if (!reading) {
                return res.status(404).json({
                    success: false,
                    message: 'Reading not found',
                });
            }
            if (reading.billStatus === client_1.BillStatus.PENDING) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill has not been generated yet',
                });
            }
            // Determine bill status based on amount paid
            let newBillStatus = reading.billStatus;
            let bill1Arrear = 0;
            let bill2Arrear = 0;
            const totalBill = Number(reading.totalBillAfter15);
            const paidAmount = Number(amount);
            if (paidAmount >= totalBill) {
                // Fully paid
                newBillStatus = client_1.BillStatus.PAID;
                bill1Arrear = 0;
                bill2Arrear = 0;
            }
            else if (paidAmount > 0) {
                // Partially paid
                newBillStatus = client_1.BillStatus.PARTIALLY_PAID;
                // Calculate arrears
                const remainingAmount = totalBill - paidAmount;
                const bill1Total = Number(reading.bill1After15);
                const bill2Total = Number(reading.bill2After15);
                // Distribute arrears proportionally
                const bill1Ratio = bill1Total / totalBill;
                const bill2Ratio = bill2Total / totalBill;
                bill1Arrear = remainingAmount * bill1Ratio;
                bill2Arrear = remainingAmount * bill2Ratio;
            }
            // Update the reading
            const updatedReading = await prisma.reading.update({
                where: { id: readingId },
                data: {
                    paidAmount,
                    paidOn: paidDate,
                    billStatus: newBillStatus,
                    bill1Arrear,
                    bill2Arrear,
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
                message: 'Payment recorded successfully',
                data: updatedReading,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update paid amount',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Bulk generate bills for all houses in a mohalla for a specific month
    static async bulkGenerateBills(req, res) {
        try {
            const { mohallaId, month } = req.body;
            if (!mohallaId || !month) {
                return res.status(400).json({
                    success: false,
                    message: 'mohallaId and month are required',
                });
            }
            const monthDate = new Date(month);
            monthDate.setDate(1);
            // Get all houses in the mohalla
            const houses = await prisma.house.findMany({
                where: {
                    mohallaId: Number(mohallaId),
                    isActive: true,
                },
            });
            const results = {
                success: 0,
                failed: 0,
                errors: [],
                generated: [],
            };
            // Generate bill for each house
            for (const house of houses) {
                try {
                    // Check if reading exists
                    const reading = await prisma.reading.findUnique({
                        where: {
                            houseId_month: {
                                houseId: house.id,
                                month: monthDate,
                            },
                        },
                    });
                    if (!reading) {
                        results.failed++;
                        results.errors.push({
                            houseNumber: house.houseNumber,
                            error: 'Reading not found for this month',
                        });
                        continue;
                    }
                    if (reading.billStatus === client_1.BillStatus.GENERATED || reading.billStatus === client_1.BillStatus.PAID) {
                        results.failed++;
                        results.errors.push({
                            houseNumber: house.houseNumber,
                            error: 'Bill already generated',
                        });
                        continue;
                    }
                    // Generate bill using the same logic
                    // This is a simplified version - you might want to call the generateBill method
                    // or extract the logic into a helper function
                    const previousMonthDate = new Date(monthDate);
                    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
                    const previousReading = await prisma.reading.findUnique({
                        where: {
                            houseId_month: {
                                houseId: house.id,
                                month: previousMonthDate,
                            },
                        },
                    });
                    if (!previousReading) {
                        results.failed++;
                        results.errors.push({
                            houseNumber: house.houseNumber,
                            error: 'Previous reading not found',
                        });
                        continue;
                    }
                    // Calculate bills (same formula as generateBill)
                    const previousBill1Arrear = previousReading.paidAmount === null
                        ? Number(previousReading.bill1After15)
                        : previousReading.bill1Arrear !== null
                            ? Number(previousReading.bill1Arrear)
                            : 0;
                    const bill1Upto15 = Number(reading.fixedCharge) +
                        Number(reading.electricityCharge) +
                        Number(reading.electricityDuty) +
                        previousBill1Arrear;
                    const bill1After15 = bill1Upto15 + bill1Upto15 * 0.015;
                    const previousBill2Arrear = previousReading.paidAmount === null
                        ? Number(previousReading.bill2After15)
                        : previousReading.bill2Arrear !== null
                            ? Number(previousReading.bill2Arrear)
                            : 0;
                    let bill2Upto15 = 0;
                    if (reading.otherCharges && !isNaN(Number(reading.otherCharges))) {
                        bill2Upto15 =
                            Number(house.licenseFee) +
                                Number(house.residenceFee) +
                                Number(reading.maintenanceCharge) +
                                Number(reading.otherCharges) +
                                Number(reading.waterCharge) +
                                previousBill2Arrear;
                    }
                    else {
                        bill2Upto15 =
                            Number(house.licenseFee) +
                                Number(house.residenceFee) +
                                Number(reading.maintenanceCharge) +
                                Number(reading.waterCharge) +
                                previousBill2Arrear;
                    }
                    const bill2After15 = bill2Upto15 + bill2Upto15 * 0.015;
                    const totalBillUpto15 = bill1Upto15 + bill2Upto15;
                    const totalBillAfter15 = bill1After15 + bill2After15;
                    await prisma.reading.update({
                        where: { id: reading.id },
                        data: {
                            bill1Upto15,
                            bill1After15,
                            bill2Upto15,
                            bill2After15,
                            totalBillUpto15,
                            totalBillAfter15,
                            billStatus: client_1.BillStatus.GENERATED,
                            billGeneratedAt: new Date(),
                        },
                    });
                    results.success++;
                    results.generated.push({
                        houseNumber: house.houseNumber,
                        readingId: reading.id,
                    });
                }
                catch (error) {
                    results.failed++;
                    results.errors.push({
                        houseNumber: house.houseNumber,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
            return res.status(200).json({
                success: true,
                message: `Bulk bill generation completed. Success: ${results.success}, Failed: ${results.failed}`,
                data: results,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Bulk bill generation failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Get bill summary for a house
    static async getBillSummary(req, res) {
        try {
            const { houseId } = req.params;
            if (!houseId) {
                return res.status(400).json({
                    success: false,
                    message: 'House ID is required',
                });
            }
            const house = await prisma.house.findUnique({
                where: { id: Number(houseId) },
            });
            if (!house) {
                return res.status(404).json({
                    success: false,
                    message: 'House not found',
                });
            }
            // Get all readings for this house
            const readings = await prisma.reading.findMany({
                where: { houseId: Number(houseId) },
                orderBy: { month: 'desc' },
            });
            // Calculate totals
            let totalPaid = 0;
            let totalPending = 0;
            let totalOverdue = 0;
            readings.forEach((reading) => {
                if (reading.billStatus === client_1.BillStatus.PAID) {
                    totalPaid += Number(reading.paidAmount || 0);
                }
                else if (reading.billStatus === client_1.BillStatus.GENERATED) {
                    const dueDate = new Date(reading.month);
                    dueDate.setDate(15);
                    if (new Date() > dueDate) {
                        totalOverdue += Number(reading.totalBillAfter15);
                    }
                    else {
                        totalPending += Number(reading.totalBillUpto15);
                    }
                }
                else if (reading.billStatus === client_1.BillStatus.PARTIALLY_PAID) {
                    totalPending += Number(reading.totalBillAfter15) - Number(reading.paidAmount || 0);
                }
            });
            return res.status(200).json({
                success: true,
                data: {
                    houseId: Number(houseId),
                    totalBills: readings.length,
                    totalPaid,
                    totalPending,
                    totalOverdue,
                    recentBills: readings.slice(0, 5),
                },
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to get bill summary',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.BillController = BillController;
//# sourceMappingURL=bill.controller.js.map