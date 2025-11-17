// ============================================
// src/routes/charges.routes.ts
// ============================================
import { Router } from 'express';
import { ChargesController } from '../controllers/charges.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all charges
router.get('/', ChargesController.getAllCharges);

// Get charge by ID
router.get('/:id', ChargesController.getChargeById);

// Get charge by name
router.get('/name/:name', ChargesController.getChargeByName);

// Create or update charge (requires SUPER_ADMIN or ADMIN)
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN'),
  ChargesController.createOrUpdateCharge
);

// Bulk update charges (requires SUPER_ADMIN or ADMIN)
router.post(
  '/bulk',
  authorize('SUPER_ADMIN', 'ADMIN'),
  ChargesController.bulkUpdateCharges
);

// Initialize default charges (requires SUPER_ADMIN)
router.post(
  '/initialize',
  authorize('SUPER_ADMIN'),
  ChargesController.initializeDefaultCharges
);

// Delete charge (requires SUPER_ADMIN)
router.delete(
  '/:id',
  authorize('SUPER_ADMIN'),
  ChargesController.deleteCharge
);

export default router;