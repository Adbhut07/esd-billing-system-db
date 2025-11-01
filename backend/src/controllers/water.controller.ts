import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../types/auth.types';

const prisma = new PrismaClient();

// Zod validation schemas
const uploadWaterReadingSchema = z.object({
  houseId: z.number().int().positive(),
  month: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/)),
  waterReading: z.number().min(0),
});

const bulkUploadWaterReadingsSchema = z.object({
  month: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/)),
  readings: z.array(
    z.object({
      houseNumber: z.string(),
      mohallaNumber: z.string(),
      waterReading: z.number().min(0).nullable().optional(),
    })
  ).min(1),
});

const updateWaterReadingSchema = z.object({
  waterReading: z.number().min(0),
});

const getReadingsQuerySchema = z.object({
  houseId: z.string().optional(),
  mohallaId: z.string().optional(),
  month: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
});

const getReadingByHouseAndMonthSchema = z.object({
  houseId: z.string(),
  month: z.string(),
});

const idParamSchema = z.object({
  id: z.string(),
});

export class WaterController {
  // Helper method to calculate water consumption
  private static async calculateWaterConsumption(
    houseId: number,
    currentReading: number,
    monthDate: Date
  ) {
    // Get previous month's reading
    const previousReading = await prisma.reading.findFirst({
      where: {
        houseId,
        month: {
          lt: monthDate,
        },
        waterReading: {
          gt: 0, // Only consider readings with water data
        },
      },
      orderBy: {
        month: 'desc',
      },
    });

    let consumption = 0;

    if (previousReading && previousReading.waterReading > 0) {
      // Calculate consumption
      consumption = currentReading - previousReading.waterReading;
      
      // Validate consumption (negative consumption might indicate meter reset or error)
      if (consumption < 0) {
        consumption = 0; // Handle meter reset or error case
      }
    } else {
      // First reading - no previous data
      consumption = 0;
    }

    return consumption;
  }

  // Get all water readings with filters
  static async getWaterReadings(req: Request, res: Response) {
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

      const {
        houseId,
        mohallaId,
        month,
        startDate,
        endDate,
        page,
        limit,
      } = validationResult.data;

      const where: any = {
        waterReading: {
          gt: 0, // Only fetch readings with water data
        },
      };

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
        message: 'Water readings fetched successfully',
        data: readings,
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
        message: 'Failed to fetch water readings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get single reading by ID
  static async getReadingById(req: Request, res: Response) {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reading',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get reading by house and month
  static async getReadingByHouseAndMonth(req: Request, res: Response) {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reading',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Upload new water reading
  static async uploadWaterReading(req: AuthRequest, res: Response) {
    try {
      // Validate request body
      const validationResult = uploadWaterReadingSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.issues,
        });
      }

      const { houseId, month, waterReading } = validationResult.data;

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

      // Calculate consumption
      const consumption = await WaterController.calculateWaterConsumption(
        houseId,
        waterReading,
        monthDate
      );

      let reading;

      if (existingReading) {
        // Update existing reading with water data
        reading = await prisma.reading.update({
          where: { id: existingReading.id },
          data: {
            waterReading,
            waterConsumption: consumption,
            waterReadingUploadDate: new Date(),
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
          message: 'Water reading updated successfully',
          data: reading,
        });
      } else {
        // Create new reading with water data
        reading = await prisma.reading.create({
          data: {
            houseId,
            month: monthDate,
            waterReading,
            waterConsumption: consumption,
            waterReadingUploadDate: new Date(),
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
          message: 'Water reading uploaded successfully',
          data: reading,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload reading',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Bulk upload water readings
  static async bulkUploadWaterReadings(req: AuthRequest, res: Response) {
    try {
      // Validate request body
      const validationResult = bulkUploadWaterReadingsSchema.safeParse(req.body);
      
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
        errors: [] as Array<{
          houseNumber: string;
          mohallaNumber: string;
          error: string;
        }>,
        uploaded: [] as Array<{
          houseNumber: string;
          mohallaNumber: string;
          readingId: number;
        }>,
      };

      // Process each reading
      for (const readingData of readings) {
        try {
          // Skip if water reading is null
          if (readingData.waterReading === null || readingData.waterReading === undefined) {
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

          const waterReading = readingData.waterReading;

          // Calculate consumption
          const consumption = await WaterController.calculateWaterConsumption(
            house.id,
            waterReading,
            monthDate
          );

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
                waterReading,
                waterConsumption: consumption,
                waterReadingUploadDate: new Date(),
              },
            });
          } else {
            // Create new reading
            reading = await prisma.reading.create({
              data: {
                houseId: house.id,
                month: monthDate,
                waterReading,
                waterConsumption: consumption,
                waterReadingUploadDate: new Date(),
              },
            });
          }

          results.success++;
          results.uploaded.push({
            houseNumber: readingData.houseNumber,
            mohallaNumber: readingData.mohallaNumber,
            readingId: reading.id,
          });
        } catch (error) {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Bulk upload failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update water reading
  static async updateWaterReading(req: AuthRequest, res: Response) {
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
      const bodyValidation = updateWaterReadingSchema.safeParse(req.body);
      
      if (!bodyValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: bodyValidation.error.issues,
        });
      }

      const { id } = paramValidation.data;
      const { waterReading } = bodyValidation.data;

      const reading = await prisma.reading.findUnique({
        where: { id: Number(id) },
      });

      if (!reading) {
        return res.status(404).json({
          success: false,
          message: 'Reading not found',
        });
      }

      // Recalculate consumption
      const consumption = await WaterController.calculateWaterConsumption(
        reading.houseId,
        waterReading,
        reading.month
      );

      // Update reading
      const updatedReading = await prisma.reading.update({
        where: { id: Number(id) },
        data: {
          waterReading,
          waterConsumption: consumption,
          waterReadingUploadDate: new Date(),
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
        message: 'Water reading updated successfully',
        data: updatedReading,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update reading',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete water reading (only water data, not the entire reading)
  static async deleteWaterReading(req: AuthRequest, res: Response) {
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

      // Check if there are future readings with water data
      const futureReadings = await prisma.reading.findMany({
        where: {
          houseId: reading.houseId,
          month: {
            gt: reading.month,
          },
          waterReading: {
            gt: 0,
          },
        },
      });

      if (futureReadings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete water reading. Future water readings exist and would be affected.',
        });
      }

      // Reset water reading data to 0 instead of deleting the entire reading
      await prisma.reading.update({
        where: { id: Number(id) },
        data: {
          waterReading: 0,
          waterConsumption: 0,
          waterReadingUploadDate: null,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Water reading deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete reading',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Recalculate water consumption for a reading
  static async recalculateWaterConsumption(req: AuthRequest, res: Response) {
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

      if (reading.waterReading === 0) {
        return res.status(400).json({
          success: false,
          message: 'No water reading data to recalculate',
        });
      }

      const consumption = await WaterController.calculateWaterConsumption(
        reading.houseId,
        reading.waterReading,
        reading.month
      );

      const updatedReading = await prisma.reading.update({
        where: { id: Number(id) },
        data: {
          waterConsumption: consumption,
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
        message: 'Water consumption recalculated successfully',
        data: updatedReading,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to recalculate consumption',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Recalculate all water consumption for a house
  static async recalculateAllWaterConsumption(req: AuthRequest, res: Response) {
    try {
      const { houseId } = req.params;

      if (!houseId) {
        return res.status(400).json({
          success: false,
          message: 'House ID is required',
        });
      }

      // Check if house exists
      const house = await prisma.house.findUnique({
        where: { id: Number(houseId) },
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: 'House not found',
        });
      }

      // Get all readings with water data for this house, ordered by month
      const readings = await prisma.reading.findMany({
        where: {
          houseId: Number(houseId),
          waterReading: {
            gt: 0,
          },
        },
        orderBy: {
          month: 'asc',
        },
      });

      let updatedCount = 0;

      // Recalculate consumption for each reading
      for (const reading of readings) {
        const consumption = await WaterController.calculateWaterConsumption(
          reading.houseId,
          reading.waterReading,
          reading.month
        );

        await prisma.reading.update({
          where: { id: reading.id },
          data: {
            waterConsumption: consumption,
          },
        });

        updatedCount++;
      }

      return res.status(200).json({
        success: true,
        message: `Water consumption recalculated for ${updatedCount} readings`,
        data: {
          houseId: Number(houseId),
          updatedCount,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to recalculate consumption',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}