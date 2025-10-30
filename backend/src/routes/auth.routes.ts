import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/change-password', authenticate, AuthController.changePassword);

// SUPER_ADMIN only routes
router.post(
  '/register',
  AuthController.register
);

export default router;