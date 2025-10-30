import { Router } from 'express';
import { MohallaController } from '../controllers/mohalla.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all mohallas (with pagination and search)
router.get('/', MohallaController.getMohallas);

// Get all mohallas without pagination (for dropdowns)
router.get('/all', MohallaController.getAllMohallas);

// Get mohalla by ID
router.get('/:id', MohallaController.getMohallaById);

// Get mohalla by number
router.get('/number/:number', MohallaController.getMohallaByNumber);

// Get houses in a mohalla
router.get('/:id/houses', MohallaController.getHousesInMohalla);

// Get mohalla statistics
router.get('/:id/statistics', MohallaController.getMohallaStatistics);

// Create new mohalla (only SUPER_ADMIN and ADMIN can create)
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN'),
  MohallaController.createMohalla
);

// Bulk create mohallas (only SUPER_ADMIN and ADMIN can create)
router.post(
  '/bulk',
  authorize('SUPER_ADMIN', 'ADMIN'),
  MohallaController.bulkCreateMohallas
);

// Update mohalla (only SUPER_ADMIN and ADMIN can update)
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  MohallaController.updateMohalla
);

// Delete mohalla (only SUPER_ADMIN can delete)
router.delete(
  '/:id',
  authorize('SUPER_ADMIN'),
  MohallaController.deleteMohalla
);

export default router;
