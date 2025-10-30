// ============================================
// src/controllers/house.controller.ts
// ============================================
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../types/auth.types';

const prisma = new PrismaClient();

// Zod validation schemas
const createHouseSchema = z.object({
  mohallaId: z.number().int().positive(),
  houseNumber: z.string().min(1),
  consumerCode: z.string().min(1),
  department: z.string().optional(),
  licenseeName: z.string().min(1),
  electricityMeterNumber: z.string().optional(),
  waterMeterNumber: z.string().optional(),
  mobileNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  licenseFee: z.number().min(0).optional(),
  residenceFee: z.number().min(0).optional(),
});

const updateHouseSchema = z.object({
  mohallaId: z.number().int().positive().optional(),
  houseNumber: z.string().min(1).optional(),
  consumerCode: z.string().min(1).optional(),
  department: z.string().optional(),
  licenseeName: z.string().min(1).optional(),
  electricityMeterNumber: z.string().optional(),
  waterMeterNumber: z.string().optional(),
  mobileNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  licenseFee: z.number().min(0).optional(),
  residenceFee: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

const updateLicenseFeeSchema = z.object({
  mohallaNumber: z.string().min(1),
  houseNumber: z.string().min(1),
  licenseFee: z.number().min(0),
});

const updateResidenceFeeSchema = z.object({
  mohallaNumber: z.string().min(1),
  houseNumber: z.string().min(1),
  residenceFee: z.number().min(0),
});

const getHousesQuerySchema = z.object({
  mohallaId: z.string().optional(),
  mohallaNumber: z.string().optional(),
  houseNumber: z.string().optional(),
  consumerCode: z.string().optional(),
  isActive: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
});

const idParamSchema = z.object({
  id: z.string(),
});

const houseIdentifierSchema = z.object({
  mohallaNumber: z.string(),
  houseNumber: z.string(),
});

export class HouseController {
  // Get all houses with filters
  static async getAllHouses(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validationResult = getHousesQuerySchema.safeParse(req.query);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: validationResult.error.issues,
        });
      }

      const {
        mohallaId,
        mohallaNumber,
        houseNumber,
        consumerCode,
        isActive,
        page,
        limit,
      } = validationResult.data;

      const where: any = {};

      if (mohallaId) {
        where.mohallaId = Number(mohallaId);
      }

      if (mohallaNumber) {
        where.mohalla = {
          number: mohallaNumber,
        };
      }

      if (houseNumber) {
        where.houseNumber = {
          contains: houseNumber,
        };
      }

      if (consumerCode) {
        where.consumerCode = {
          contains: consumerCode,
        };
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const [houses, total] = await Promise.all([
        prisma.house.findMany({
          where,
          include: {
            mohalla: true,
          },
          orderBy: [
            { mohalla: { number: 'asc' } },
            { houseNumber: 'asc' },
          ],
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.house.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        message: 'Houses fetched successfully',
        data: houses,
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
        message: 'Failed to fetch houses',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get house by ID
  static async getHouseById(req: Request, res: Response) {
    try {
      // Validate params
      const validationResult = idParamSchema.safeParse(req.params);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid house ID',
          errors: validationResult.error.issues,
        });
      }

      const { id } = validationResult.data;

      const house = await prisma.house.findUnique({
        where: { id: Number(id) },
        include: {
          mohalla: true,
          readings: {
            orderBy: {
              month: 'desc',
            },
            take: 5, // Get last 5 readings
          },
        },
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: 'House not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: house,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch house',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get house by mohalla number and house number
  static async getHouseByMohallaAndHouseNumber(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validationResult = houseIdentifierSchema.safeParse(req.query);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'mohallaNumber and houseNumber are required',
          errors: validationResult.error.issues,
        });
      }

      const { mohallaNumber, houseNumber } = validationResult.data;

      const house = await prisma.house.findFirst({
        where: {
          houseNumber: houseNumber,
          mohalla: {
            number: mohallaNumber,
          },
        },
        include: {
          mohalla: true,
          readings: {
            orderBy: {
              month: 'desc',
            },
            take: 5,
          },
        },
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: `House not found: ${mohallaNumber}/${houseNumber}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: house,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch house',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create new house
  static async createHouse(req: AuthRequest, res: Response) {
    try {
      // Validate request body
      const validationResult = createHouseSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.issues,
        });
      }

      const data = validationResult.data;

      // Check if mohalla exists
      const mohalla = await prisma.mohalla.findUnique({
        where: { id: data.mohallaId },
      });

      if (!mohalla) {
        return res.status(404).json({
          success: false,
          message: 'Mohalla not found',
        });
      }

      // Check if consumer code already exists
      const existingHouse = await prisma.house.findUnique({
        where: { consumerCode: data.consumerCode },
      });

      if (existingHouse) {
        return res.status(409).json({
          success: false,
          message: 'Consumer code already exists',
        });
      }

      // Check if electricity meter number already exists (if provided)
      if (data.electricityMeterNumber) {
        const existingElectricityMeter = await prisma.house.findUnique({
          where: { electricityMeterNumber: data.electricityMeterNumber },
        });

        if (existingElectricityMeter) {
          return res.status(409).json({
            success: false,
            message: 'Electricity meter number already exists',
          });
        }
      }

      // Check if water meter number already exists (if provided)
      if (data.waterMeterNumber) {
        const existingWaterMeter = await prisma.house.findUnique({
          where: { waterMeterNumber: data.waterMeterNumber },
        });

        if (existingWaterMeter) {
          return res.status(409).json({
            success: false,
            message: 'Water meter number already exists',
          });
        }
      }

      // Create house
      const house = await prisma.house.create({
        data: {
          mohallaId: data.mohallaId,
          houseNumber: data.houseNumber,
          consumerCode: data.consumerCode,
          department: data.department || null,
          licenseeName: data.licenseeName,
          electricityMeterNumber: data.electricityMeterNumber || null,
          waterMeterNumber: data.waterMeterNumber || null,
          mobileNumber: data.mobileNumber || null,
          email: data.email || null,
          licenseFee: data.licenseFee || 0,
          residenceFee: data.residenceFee || 0,
        },
        include: {
          mohalla: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'House created successfully',
        data: house,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create house',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update house
  static async updateHouse(req: AuthRequest, res: Response) {
    try {
      // Validate params
      const paramsValidation = idParamSchema.safeParse(req.params);

      if (!paramsValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid house ID',
          errors: paramsValidation.error.issues,
        });
      }

      const { id } = paramsValidation.data;

      // Validate request body
      const bodyValidation = updateHouseSchema.safeParse(req.body);

      if (!bodyValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: bodyValidation.error.issues,
        });
      }

      const data = bodyValidation.data;

      // Check if house exists
      const existingHouse = await prisma.house.findUnique({
        where: { id: Number(id) },
      });

      if (!existingHouse) {
        return res.status(404).json({
          success: false,
          message: 'House not found',
        });
      }

      // Check if mohalla exists (if updating)
      if (data.mohallaId) {
        const mohalla = await prisma.mohalla.findUnique({
          where: { id: data.mohallaId },
        });

        if (!mohalla) {
          return res.status(404).json({
            success: false,
            message: 'Mohalla not found',
          });
        }
      }

      // Check if consumer code already exists (if updating)
      if (data.consumerCode && data.consumerCode !== existingHouse.consumerCode) {
        const duplicateConsumerCode = await prisma.house.findUnique({
          where: { consumerCode: data.consumerCode },
        });

        if (duplicateConsumerCode) {
          return res.status(409).json({
            success: false,
            message: 'Consumer code already exists',
          });
        }
      }

      // Check if electricity meter number already exists (if updating)
      if (data.electricityMeterNumber && data.electricityMeterNumber !== existingHouse.electricityMeterNumber) {
        const duplicateElectricityMeter = await prisma.house.findUnique({
          where: { electricityMeterNumber: data.electricityMeterNumber },
        });

        if (duplicateElectricityMeter) {
          return res.status(409).json({
            success: false,
            message: 'Electricity meter number already exists',
          });
        }
      }

      // Check if water meter number already exists (if updating)
      if (data.waterMeterNumber && data.waterMeterNumber !== existingHouse.waterMeterNumber) {
        const duplicateWaterMeter = await prisma.house.findUnique({
          where: { waterMeterNumber: data.waterMeterNumber },
        });

        if (duplicateWaterMeter) {
          return res.status(409).json({
            success: false,
            message: 'Water meter number already exists',
          });
        }
      }

      // Update house
      const updatedHouse = await prisma.house.update({
        where: { id: Number(id) },
        data: {
          ...(data.mohallaId && { mohallaId: data.mohallaId }),
          ...(data.houseNumber && { houseNumber: data.houseNumber }),
          ...(data.consumerCode && { consumerCode: data.consumerCode }),
          ...(data.department !== undefined && { department: data.department || null }),
          ...(data.licenseeName && { licenseeName: data.licenseeName }),
          ...(data.electricityMeterNumber !== undefined && { electricityMeterNumber: data.electricityMeterNumber || null }),
          ...(data.waterMeterNumber !== undefined && { waterMeterNumber: data.waterMeterNumber || null }),
          ...(data.mobileNumber !== undefined && { mobileNumber: data.mobileNumber || null }),
          ...(data.email !== undefined && { email: data.email || null }),
          ...(data.licenseFee !== undefined && { licenseFee: data.licenseFee }),
          ...(data.residenceFee !== undefined && { residenceFee: data.residenceFee }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: {
          mohalla: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'House updated successfully',
        data: updatedHouse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update house',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update license fee (by mohalla number and house number)
  static async updateLicenseFee(req: AuthRequest, res: Response) {
    try {
      // Validate request body
      const validationResult = updateLicenseFeeSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'mohallaNumber, houseNumber, and licenseFee are required',
          errors: validationResult.error.issues,
        });
      }

      const { mohallaNumber, houseNumber, licenseFee } = validationResult.data;

      // Find house
      const house = await prisma.house.findFirst({
        where: {
          houseNumber: houseNumber,
          mohalla: {
            number: mohallaNumber,
          },
        },
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: `House not found: ${mohallaNumber}/${houseNumber}`,
        });
      }

      // Update license fee
      const updatedHouse = await prisma.house.update({
        where: { id: house.id },
        data: {
          licenseFee: licenseFee,
        },
        include: {
          mohalla: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'License fee updated successfully',
        data: updatedHouse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update license fee',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update residence fee (by mohalla number and house number)
  static async updateResidenceFee(req: AuthRequest, res: Response) {
    try {
      // Validate request body
      const validationResult = updateResidenceFeeSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'mohallaNumber, houseNumber, and residenceFee are required',
          errors: validationResult.error.issues,
        });
      }

      const { mohallaNumber, houseNumber, residenceFee } = validationResult.data;

      // Find house
      const house = await prisma.house.findFirst({
        where: {
          houseNumber: houseNumber,
          mohalla: {
            number: mohallaNumber,
          },
        },
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: `House not found: ${mohallaNumber}/${houseNumber}`,
        });
      }

      // Update residence fee
      const updatedHouse = await prisma.house.update({
        where: { id: house.id },
        data: {
          residenceFee: residenceFee,
        },
        include: {
          mohalla: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Residence fee updated successfully',
        data: updatedHouse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update residence fee',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete house (soft delete - set isActive to false)
  static async deleteHouse(req: AuthRequest, res: Response) {
    try {
      // Validate params
      const validationResult = idParamSchema.safeParse(req.params);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid house ID',
          errors: validationResult.error.issues,
        });
      }

      const { id } = validationResult.data;

      // Check if house exists
      const house = await prisma.house.findUnique({
        where: { id: Number(id) },
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: 'House not found',
        });
      }

      // Soft delete - set isActive to false
      const deletedHouse = await prisma.house.update({
        where: { id: Number(id) },
        data: {
          isActive: false,
        },
        include: {
          mohalla: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'House deleted successfully (soft delete)',
        data: deletedHouse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete house',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Permanently delete house
  static async permanentlyDeleteHouse(req: AuthRequest, res: Response) {
    try {
      // Validate params
      const validationResult = idParamSchema.safeParse(req.params);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid house ID',
          errors: validationResult.error.issues,
        });
      }

      const { id } = validationResult.data;

      // Check if house exists
      const house = await prisma.house.findUnique({
        where: { id: Number(id) },
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: 'House not found',
        });
      }

      // Check if house has readings
      const readingsCount = await prisma.reading.count({
        where: { houseId: Number(id) },
      });

      if (readingsCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete house. It has ${readingsCount} reading(s). Delete readings first or use soft delete.`,
        });
      }

      // Permanently delete
      await prisma.house.delete({
        where: { id: Number(id) },
      });

      return res.status(200).json({
        success: true,
        message: 'House permanently deleted',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to permanently delete house',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Restore deleted house (set isActive to true)
  static async restoreHouse(req: AuthRequest, res: Response) {
    try {
      // Validate params
      const validationResult = idParamSchema.safeParse(req.params);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid house ID',
          errors: validationResult.error.issues,
        });
      }

      const { id } = validationResult.data;

      // Check if house exists
      const house = await prisma.house.findUnique({
        where: { id: Number(id) },
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: 'House not found',
        });
      }

      if (house.isActive) {
        return res.status(400).json({
          success: false,
          message: 'House is already active',
        });
      }

      // Restore house
      const restoredHouse = await prisma.house.update({
        where: { id: Number(id) },
        data: {
          isActive: true,
        },
        include: {
          mohalla: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'House restored successfully',
        data: restoredHouse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to restore house',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}