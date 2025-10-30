import { Request } from 'express';
import { AdminRole } from '@prisma/client';

export interface AuthRequest extends Request {
  admin?: {
    id: number;
    username: string;
    email: string;
    role: AdminRole;
  };
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: AdminRole;
}

export interface TokenPayload {
  id: number;
  username: string;
  email: string;
  role: AdminRole;
}