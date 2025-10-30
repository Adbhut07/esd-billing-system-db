import { Response } from 'express';
import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../types/auth.types';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.utils';

const prisma = new PrismaClient();

export class AuthController {
  // Register new admin (only SUPER_ADMIN can do this)
  static async register(req: AuthRequest, res: Response) {
    try {
      const { username, email, password, fullName, role } = req.body;

      // Validate input
      if (!username || !email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      // Check if admin already exists
      const existingAdmin = await prisma.admin.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: 'Admin with this username or email already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin
      const admin = await prisma.admin.create({
        data: {
          username,
          email,
          password: hashedPassword,
          fullName,
          role: role || AdminRole.ADMIN,
        },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: admin,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Login
  static async login(req: AuthRequest, res: Response) {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required',
        });
      }

      // Find admin
      const admin = await prisma.admin.findUnique({
        where: { username },
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Admin account is inactive',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Generate tokens
      const tokenPayload = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Store refresh token in database
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          refreshTokens: [refreshToken],
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Refresh token
  static async refreshToken(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }

      // Check if token exists in database
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
      });

      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found or inactive',
        });
      }

      const tokens = admin.refreshTokens as string[] | null;
      if (!tokens || !tokens.includes(refreshToken)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new tokens
      const tokenPayload = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      // Update refresh tokens
      const updatedTokens = tokens.filter((t) => t !== refreshToken);
      updatedTokens.push(newRefreshToken);

      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          refreshTokens: updatedTokens,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Logout
  static async logout(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken || !req.admin) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      // Remove refresh token from database
      const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id },
      });

      if (admin) {
        const tokens = admin.refreshTokens as string[] | null;
        if (tokens) {
          const updatedTokens = tokens.filter((t) => t !== refreshToken);
          await prisma.admin.update({
            where: { id: admin.id },
            data: {
              refreshTokens: updatedTokens,
            },
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get current admin profile
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: admin,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Change password
  static async changePassword(req: AuthRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current and new passwords are required',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters',
        });
      }

      const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id },
      });

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        admin.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear all refresh tokens
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          password: hashedPassword,
          refreshTokens: [],
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Password change failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}