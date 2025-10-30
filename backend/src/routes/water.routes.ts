import { Router } from 'express';
import { WaterController } from '../controllers/water.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all water readings (with filters)
router.get('/', WaterController.getWaterReadings);

// Get reading by ID
router.get('/:id', WaterController.getReadingById);

// Get reading by house and month
router.get('/house/month', WaterController.getReadingByHouseAndMonth);

// Upload new water reading (ADMIN and OPERATOR can upload)
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN', 'OPERATOR'),
  WaterController.uploadWaterReading
);

// Bulk upload water readings (ADMIN and OPERATOR can upload)
router.post(
  '/bulk',
  authorize('SUPER_ADMIN', 'ADMIN', 'OPERATOR'),
  WaterController.bulkUploadWaterReadings
);

// Update water reading (ADMIN and OPERATOR can update)
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN', 'OPERATOR'),
  WaterController.updateWaterReading
);

// Delete water reading (only SUPER_ADMIN and ADMIN can delete)
router.delete(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  WaterController.deleteWaterReading
);

// Recalculate water consumption for a reading
router.post(
  '/:id/recalculate',
  authorize('SUPER_ADMIN', 'ADMIN'),
  WaterController.recalculateWaterConsumption
);

// Recalculate all water consumption for a house
router.post(
  '/house/:houseId/recalculate-all',
  authorize('SUPER_ADMIN', 'ADMIN'),
  WaterController.recalculateAllWaterConsumption
);

export default router;
