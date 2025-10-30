import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { verifyAccessToken } from '../utils/jwt.utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Check if admin exists and is active
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or inactive',
      });
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};