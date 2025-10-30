import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { TokenPayload } from '../types/auth.types';

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiry,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpiry,
  });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, jwtConfig.accessTokenSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, jwtConfig.refreshTokenSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
};
