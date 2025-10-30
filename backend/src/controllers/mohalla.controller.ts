// ============================================
// src/controllers/mohalla.controller.ts
// ============================================
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../types/auth.types';

const prisma = new PrismaClient();

// Zod validation schemas
const createMohallaSchema = z.object({
  name: z.string().min(1).max(100),
  number: z.string().min(1).max(20),
});

const updateMohallaSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  number: z.string().min(1).max(20).optional(),
});

const getMohallasQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
});

const idParamSchema = z.object({
  id: z.string(),
});

const numberParamSchema = z.object({
  number: z.string(),
});

export class MohallaController {
  // Get all mohallas with optional search and pagination
  static async getMohallas(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validationResult = getMohallasQuerySchema.safeParse(req.query);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: validationResult.error.issues,
        });
      }

      const { search, page, limit } = validationResult.data;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { number: { contains: search } },
        ];
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const [mohallas, total] = await Promise.all([
        prisma.mohalla.findMany({
          where,
          include: {
            _count: {
              select: {
                houses: true,
              },
            },
          },
          orderBy: [
            { number: 'asc' },
          ],
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.mohalla.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        message: 'Mohallas fetched successfully',
        data: mohallas,
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
        message: 'Failed to fetch mohallas',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get all mohallas without pagination (for dropdowns)
  static async getAllMohallas(req: Request, res: Response) {
    try {
      const mohallas = await prisma.mohalla.findMany({
        orderBy: [
          { number: 'asc' },
        ],
        select: {
          id: true,
          name: true,
          number: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Mohallas fetched successfully',
        data: mohallas,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch mohallas',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get single mohalla by ID
  static async getMohallaById(req: Request, res: Response) {
    try {
      // Validate params
      const validationResult = idParamSchema.safeParse(req.params);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mohalla ID',
          errors: validationResult.error.issues,
        });
      }

      const { id } = validationResult.data;

      const mohalla = await prisma.mohalla.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              houses: true,
            },
          },
        },
      });

      if (!mohalla) {
        return res.status(404).json({
          success: false,
          message: 'Mohalla not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: mohalla,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch mohalla',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get mohalla by number
  static async getMohallaByNumber(req: Request, res: Response) {
    try {
      // Validate params
      const validationResult = numberParamSchema.safeParse(req.params);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mohalla number',
          errors: validationResult.error.issues,
        });
      }

      const { number } = validationResult.data;

      const mohalla = await prisma.mohalla.findUnique({
        where: { number },
        include: {
          _count: {
            select: {
              houses: true,
            },
          },
        },
      });

      if (!mohalla) {
        return res.status(404).json({
          success: false,
          message: 'Mohalla not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: mohalla,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch mohalla',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get houses in a mohalla
  static async getHousesInMohalla(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { page = '1', limit = '50', isActive } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Mohalla ID is required',
        });
      }

      const mohalla = await prisma.mohalla.findUnique({
        where: { id: Number(id) },
      });

      if (!mohalla) {
        return res.status(404).json({
          success: false,
          message: 'Mohalla not found',
        });
      }

      const where: any = {
        mohallaId: Number(id),
      };

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const [houses, total] = await Promise.all([
        prisma.house.findMany({
          where,
          orderBy: {
            houseNumber: 'asc',
          },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.house.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        message: 'Houses fetched successfully',
        data: {
          mohalla,
          houses,
        },
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

  // Create new mohalla
  static async createMohalla(req: AuthRequest, res: Response) {
    try {
      // Validate request body
      const validationResult = createMohallaSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.issues,
        });
      }

      const { name, number } = validationResult.data;

      // Check if mohalla with same number already exists
      const existingMohalla = await prisma.mohalla.findUnique({
        where: { number },
      });

      if (existingMohalla) {
        return res.status(409).json({
          success: false,
          message: 'Mohalla with this number already exists',
        });
      }

      // Create mohalla
      const mohalla = await prisma.mohalla.create({
        data: {
          name,
          number,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Mohalla created successfully',
        data: mohalla,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create mohalla',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update mohalla
  static async updateMohalla(req: AuthRequest, res: Response) {
    try {
      // Validate params
      const paramValidation = idParamSchema.safeParse(req.params);
      
      if (!paramValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mohalla ID',
          errors: paramValidation.error.issues,
        });
      }

      // Validate body
      const bodyValidation = updateMohallaSchema.safeParse(req.body);
      
      if (!bodyValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: bodyValidation.error.issues,
        });
      }

      const { id } = paramValidation.data;
      const { name, number } = bodyValidation.data;

      // Check if mohalla exists
      const mohalla = await prisma.mohalla.findUnique({
        where: { id: Number(id) },
      });

      if (!mohalla) {
        return res.status(404).json({
          success: false,
          message: 'Mohalla not found',
        });
      }

      // If number is being updated, check if new number already exists
      if (number && number !== mohalla.number) {
        const existingMohalla = await prisma.mohalla.findUnique({
          where: { number },
        });

        if (existingMohalla) {
          return res.status(409).json({
            success: false,
            message: 'Mohalla with this number already exists',
          });
        }
      }

      // Update mohalla
      const updatedMohalla = await prisma.mohalla.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(number && { number }),
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Mohalla updated successfully',
        data: updatedMohalla,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update mohalla',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete mohalla
  static async deleteMohalla(req: AuthRequest, res: Response) {
    try {
      // Validate params
      const validationResult = idParamSchema.safeParse(req.params);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mohalla ID',
          errors: validationResult.error.issues,
        });
      }

      const { id } = validationResult.data;

      // Check if mohalla exists
      const mohalla = await prisma.mohalla.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              houses: true,
            },
          },
        },
      });

      if (!mohalla) {
        return res.status(404).json({
          success: false,
          message: 'Mohalla not found',
        });
      }

      // Check if mohalla has houses
      if (mohalla._count.houses > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete mohalla. It has ${mohalla._count.houses} houses associated with it. Please remove or reassign the houses first.`,
        });
      }

      // Delete mohalla
      await prisma.mohalla.delete({
        where: { id: Number(id) },
      });

      return res.status(200).json({
        success: true,
        message: 'Mohalla deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete mohalla',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get mohalla statistics
  static async getMohallaStatistics(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Mohalla ID is required',
        });
      }

      const mohalla = await prisma.mohalla.findUnique({
        where: { id: Number(id) },
      });

      if (!mohalla) {
        return res.status(404).json({
          success: false,
          message: 'Mohalla not found',
        });
      }

      // Get statistics
      const [
        totalHouses,
        activeHouses,
        inactiveHouses,
        totalReadings,
        pendingBills,
        generatedBills,
        paidBills,
      ] = await Promise.all([
        prisma.house.count({
          where: { mohallaId: Number(id) },
        }),
        prisma.house.count({
          where: { mohallaId: Number(id), isActive: true },
        }),
        prisma.house.count({
          where: { mohallaId: Number(id), isActive: false },
        }),
        prisma.reading.count({
          where: {
            house: {
              mohallaId: Number(id),
            },
          },
        }),
        prisma.reading.count({
          where: {
            house: {
              mohallaId: Number(id),
            },
            billStatus: 'PENDING',
          },
        }),
        prisma.reading.count({
          where: {
            house: {
              mohallaId: Number(id),
            },
            billStatus: 'GENERATED',
          },
        }),
        prisma.reading.count({
          where: {
            house: {
              mohallaId: Number(id),
            },
            billStatus: 'PAID',
          },
        }),
      ]);

      // Calculate total revenue
      const paidReadings = await prisma.reading.findMany({
        where: {
          house: {
            mohallaId: Number(id),
          },
          billStatus: 'PAID',
        },
        select: {
          paidAmount: true,
        },
      });

      const totalRevenue = paidReadings.reduce((sum, reading) => {
        return sum + Number(reading.paidAmount || 0);
      }, 0);

      return res.status(200).json({
        success: true,
        data: {
          mohalla,
          statistics: {
            houses: {
              total: totalHouses,
              active: activeHouses,
              inactive: inactiveHouses,
            },
            readings: {
              total: totalReadings,
            },
            bills: {
              pending: pendingBills,
              generated: generatedBills,
              paid: paidBills,
            },
            revenue: {
              total: totalRevenue,
            },
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch mohalla statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Bulk create mohallas
  static async bulkCreateMohallas(req: AuthRequest, res: Response) {
    try {
      const { mohallas } = req.body;

      if (!mohallas || !Array.isArray(mohallas)) {
        return res.status(400).json({
          success: false,
          message: 'mohallas array is required',
        });
      }

      if (mohallas.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'mohallas array cannot be empty',
        });
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{
          number: string;
          error: string;
        }>,
        created: [] as Array<{
          number: string;
          mohallaId: number;
        }>,
      };

      for (const mohallaData of mohallas) {
        try {
          // Validate data
          const validation = createMohallaSchema.safeParse(mohallaData);
          
          if (!validation.success) {
            results.failed++;
            results.errors.push({
              number: mohallaData.number || 'unknown',
              error: 'Invalid data format',
            });
            continue;
          }

          const { name, number } = validation.data;

          // Check if mohalla already exists
          const existingMohalla = await prisma.mohalla.findUnique({
            where: { number },
          });

          if (existingMohalla) {
            results.failed++;
            results.errors.push({
              number,
              error: 'Mohalla with this number already exists',
            });
            continue;
          }

          // Create mohalla
          const mohalla = await prisma.mohalla.create({
            data: {
              name,
              number,
            },
          });

          results.success++;
          results.created.push({
            number,
            mohallaId: mohalla.id,
          });
        } catch (error) {
          results.failed++;
          results.errors.push({
            number: mohallaData.number || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Bulk create completed. Success: ${results.success}, Failed: ${results.failed}`,
        data: results,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Bulk create failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}