// ============================================
// src/controllers/bill.controller.ts
// ============================================
import { Request, Response } from 'express';
import { PrismaClient, BillStatus } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../types/auth.types';

const prisma = new PrismaClient();

// Zod validation schemas
const updateOtherChargesSchema = z.object({
  houseId: z.number().int().positive(),
  month: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  otherCharges: z.number().min(0),
});

const generateBillSchema = z.object({
  houseId: z.number().int().positive(),
  month: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

const updatePaidAmountSchema = z.object({
  readingId: z.number().int().positive(),
  amount: z.number().positive(),
  paidOn: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

const getBillsQuerySchema = z.object({
  houseId: z.string().optional(),
  mohallaId: z.string().optional(),
  month: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  billStatus: z.enum(['PENDING', 'GENERATED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE']).optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
});

const idParamSchema = z.object({
  id: z.string(),
});

export class BillController {
  // Helper method to calculate water charge
  private static async calculateWaterCharge(waterConsumption: number) {
    const waterChargeRate = await prisma.charges.findUnique({
      where: { name: 'water_charge_rate' },
    });

    return (waterChargeRate?.amount || 0) * waterConsumption;
  }

  // Get all bills with filters
  static async getBills(req: Request, res: Response) {
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

      const {
        houseId,
        mohallaId,
        month,
        startDate,
        endDate,
        billStatus,
        page,
        limit,
      } = validationResult.data;

      const where: any = {};

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
      } else if (startDate) {
        where.month = {
          gte: new Date(startDate),
        };
      } else if (endDate) {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bills',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get single bill by ID
  static async getBillById(req: Request, res: Response) {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bill',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update other charges for a reading
  static async updateOtherCharges(req: AuthRequest, res: Response) {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update other charges',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Generate bill for a reading (matching old formula exactly)
static async generateBill(req: AuthRequest, res: Response) {
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

    // Validate charges are not zero
    if (
      Number(currentReading.fixedCharge) === 0 &&
      Number(currentReading.electricityCharge) === 0 &&
      Number(currentReading.electricityDuty) === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'The values of fixed charge, electricity charge and electricity duty are not updated and are 0',
      });
    }

    if (
      Number(house.licenseFee) === 0 &&
      Number(house.residenceFee) === 0 &&
      Number(currentReading.maintenanceCharge) === 0 &&
      Number(currentReading.waterCharge) === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'The values of license fee, residence fee, maintenance charges and water charges are not updated and are 0',
      });
    }

    // Calculate Bill 1 (Electricity Bill)
    // If no previous reading exists (first month), arrears will be 0
    let previousBill1Arrear = 0;
    
    if (previousReading) {
      previousBill1Arrear =
        previousReading.paidAmount === null
          ? Number(previousReading.bill1After15)
          : previousReading.bill1Arrear !== null
          ? Number(previousReading.bill1Arrear)
          : 0;
    }

    const bill1Upto15 =
      Number(currentReading.fixedCharge) +
      Number(currentReading.electricityCharge) +
      Number(currentReading.electricityDuty) +
      previousBill1Arrear;

    // Add 1.5% penalty after 15th
    const bill1After15 = bill1Upto15 + bill1Upto15 * 0.015;

    // Calculate Bill 2 (Water + Other Charges)
    // If no previous reading exists (first month), arrears will be 0
    let previousBill2Arrear = 0;
    
    if (previousReading) {
      previousBill2Arrear =
        previousReading.paidAmount === null
          ? Number(previousReading.bill2After15)
          : previousReading.bill2Arrear !== null
          ? Number(previousReading.bill2Arrear)
          : 0;
    }

    let bill2Upto15 = 0;

    if (
      currentReading.otherCharges &&
      !isNaN(Number(currentReading.otherCharges)) &&
      currentReading.otherCharges !== null
    ) {
      bill2Upto15 =
        Number(house.licenseFee) +
        Number(house.residenceFee) +
        Number(currentReading.maintenanceCharge) +
        Number(currentReading.otherCharges) +
        Number(currentReading.waterCharge) +
        previousBill2Arrear;
    } else {
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
        billStatus: BillStatus.GENERATED,
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
      message: previousReading 
        ? 'Bill generated successfully'
        : 'Bill generated successfully (first month - no previous arrears)',
      data: {
        reading: updatedReading,
        isFirstMonth: !previousReading,
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate bill',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

  // Update paid amount for a bill
  static async updatePaidAmount(req: AuthRequest, res: Response) {
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

      if (reading.billStatus === BillStatus.PENDING) {
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
        newBillStatus = BillStatus.PAID;
        bill1Arrear = 0;
        bill2Arrear = 0;
      } else if (paidAmount > 0) {
        // Partially paid
        newBillStatus = BillStatus.PARTIALLY_PAID;

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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update paid amount',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Bulk generate bills for all houses in a mohalla for a specific month
  static async bulkGenerateBills(req: AuthRequest, res: Response) {
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

    if (houses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active houses found in this mohalla',
      });
    }

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      firstMonthBills: 0, // Track bills generated without previous month data
      errors: [] as Array<{
        houseNumber: string;
        error: string;
      }>,
      generated: [] as Array<{
        houseNumber: string;
        readingId: number;
        totalBill: number;
        isFirstMonth: boolean;
      }>,
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

        // Check if bill is already generated
        if (reading.billStatus === BillStatus.GENERATED || 
            reading.billStatus === BillStatus.PAID || 
            reading.billStatus === BillStatus.PARTIALLY_PAID) {
          results.skipped++;
          results.errors.push({
            houseNumber: house.houseNumber,
            error: `Bill already ${reading.billStatus.toLowerCase()}`,
          });
          continue;
        }

        // Validate electricity reading is entered
        if (reading.electricityImportReading === 0) {
          results.failed++;
          results.errors.push({
            houseNumber: house.houseNumber,
            error: 'Electricity reading has not been entered',
          });
          continue;
        }

        // Validate water reading is entered
        if (reading.waterReading === 0) {
          results.failed++;
          results.errors.push({
            houseNumber: house.houseNumber,
            error: 'Water reading has not been entered',
          });
          continue;
        }

        // Get previous month's reading (optional - may not exist for first month)
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

        const isFirstMonth = !previousReading;

        // Validate charges are calculated
        if (
          Number(reading.fixedCharge) === 0 &&
          Number(reading.electricityCharge) === 0 &&
          Number(reading.electricityDuty) === 0
        ) {
          results.failed++;
          results.errors.push({
            houseNumber: house.houseNumber,
            error: 'Electricity charges not calculated (all charges are 0)',
          });
          continue;
        }

        if (
          Number(house.licenseFee) === 0 &&
          Number(house.residenceFee) === 0 &&
          Number(reading.maintenanceCharge) === 0 &&
          Number(reading.waterCharge) === 0
        ) {
          results.failed++;
          results.errors.push({
            houseNumber: house.houseNumber,
            error: 'Water and other charges not configured (all are 0)',
          });
          continue;
        }

        // Calculate Bill 1 (Electricity Bill)
        // If no previous reading exists, arrears will be 0
        let previousBill1Arrear = 0;
        
        if (previousReading) {
          previousBill1Arrear =
            previousReading.paidAmount === null
              ? Number(previousReading.bill1After15)
              : previousReading.bill1Arrear !== null
              ? Number(previousReading.bill1Arrear)
              : 0;
        }

        const bill1Upto15 =
          Number(reading.fixedCharge) +
          Number(reading.electricityCharge) +
          Number(reading.electricityDuty) +
          previousBill1Arrear;

        const bill1After15 = bill1Upto15 + bill1Upto15 * 0.015;

        // Calculate Bill 2 (Water + Other Charges)
        // If no previous reading exists, arrears will be 0
        let previousBill2Arrear = 0;
        
        if (previousReading) {
          previousBill2Arrear =
            previousReading.paidAmount === null
              ? Number(previousReading.bill2After15)
              : previousReading.bill2Arrear !== null
              ? Number(previousReading.bill2Arrear)
              : 0;
        }

        let bill2Upto15 = 0;

        if (
          reading.otherCharges &&
          !isNaN(Number(reading.otherCharges)) &&
          reading.otherCharges !== null
        ) {
          bill2Upto15 =
            Number(house.licenseFee) +
            Number(house.residenceFee) +
            Number(reading.maintenanceCharge) +
            Number(reading.otherCharges) +
            Number(reading.waterCharge) +
            previousBill2Arrear;
        } else {
          bill2Upto15 =
            Number(house.licenseFee) +
            Number(house.residenceFee) +
            Number(reading.maintenanceCharge) +
            Number(reading.waterCharge) +
            previousBill2Arrear;
        }

        const bill2After15 = bill2Upto15 + bill2Upto15 * 0.015;

        // Calculate total bills
        const totalBillUpto15 = bill1Upto15 + bill2Upto15;
        const totalBillAfter15 = bill1After15 + bill2After15;

        // Update the reading with bill amounts
        await prisma.reading.update({
          where: { id: reading.id },
          data: {
            bill1Upto15,
            bill1After15,
            bill2Upto15,
            bill2After15,
            totalBillUpto15,
            totalBillAfter15,
            billStatus: BillStatus.GENERATED,
            billGeneratedAt: new Date(),
          },
        });

        results.success++;
        if (isFirstMonth) {
          results.firstMonthBills++;
        }
        
        results.generated.push({
          houseNumber: house.houseNumber,
          readingId: reading.id,
          totalBill: totalBillAfter15,
          isFirstMonth,
        });
      } catch (error) {
        results.failed++;
        results.errors.push({
          houseNumber: house.houseNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const message = results.firstMonthBills > 0
      ? `Bulk bill generation completed. Success: ${results.success} (${results.firstMonthBills} first month bills), Failed: ${results.failed}, Skipped: ${results.skipped}`
      : `Bulk bill generation completed. Success: ${results.success}, Failed: ${results.failed}, Skipped: ${results.skipped}`;

    return res.status(200).json({
      success: true,
      message,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Bulk bill generation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

  // Get bill summary for a house
  static async getBillSummary(req: Request, res: Response) {
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
        if (reading.billStatus === BillStatus.PAID) {
          totalPaid += Number(reading.paidAmount || 0);
        } else if (reading.billStatus === BillStatus.GENERATED) {
          const dueDate = new Date(reading.month);
          dueDate.setDate(15);
          
          if (new Date() > dueDate) {
            totalOverdue += Number(reading.totalBillAfter15);
          } else {
            totalPending += Number(reading.totalBillUpto15);
          }
        } else if (reading.billStatus === BillStatus.PARTIALLY_PAID) {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get bill summary',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}