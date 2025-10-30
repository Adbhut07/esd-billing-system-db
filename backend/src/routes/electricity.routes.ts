import { Router } from 'express';
import { ElectricityController } from '../controllers/electricity.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all readings (with filters)
router.get('/', ElectricityController.getElectricityReadings);

// Get reading by ID
router.get('/:id', ElectricityController.getReadingById);

// Get reading by house and month
router.get('/house/month', ElectricityController.getReadingByHouseAndMonth);

// Upload new reading (ADMIN and OPERATOR can upload)
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN', 'OPERATOR'),
  ElectricityController.uploadElectricityReading
);

// Update reading (ADMIN and OPERATOR can update)
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN', 'OPERATOR'),
  ElectricityController.updateElectricityReading
);

// Delete reading (only SUPER_ADMIN and ADMIN can delete)
router.delete(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  ElectricityController.deleteElectricityReading
);

// Recalculate consumption
router.post(
  '/:id/recalculate',
  authorize('SUPER_ADMIN', 'ADMIN'),
  ElectricityController.recalculateConsumption
);

export default router;
