import { Router } from 'express';
import { HouseController } from '../controllers/house.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all houses (with filters)
router.get('/', HouseController.getAllHouses);

// Get house by ID
router.get('/:id', HouseController.getHouseById);

// Get house by mohalla number and house number
router.get('/search/by-location', HouseController.getHouseByMohallaAndHouseNumber);

// Create new house (only SUPER_ADMIN and ADMIN can create)
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN'),
  HouseController.createHouse
);

// Update house (only SUPER_ADMIN and ADMIN can update)
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  HouseController.updateHouse
);

// Update license fee (ADMIN and OPERATOR can update)
router.patch(
  '/license-fee',
  authorize('SUPER_ADMIN', 'ADMIN', 'OPERATOR'),
  HouseController.updateLicenseFee
);

// Update residence fee (ADMIN and OPERATOR can update)
router.patch(
  '/residence-fee',
  authorize('SUPER_ADMIN', 'ADMIN', 'OPERATOR'),
  HouseController.updateResidenceFee
);

// Soft delete house (only SUPER_ADMIN and ADMIN can delete)
router.delete(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  HouseController.deleteHouse
);

// Permanently delete house (only SUPER_ADMIN can permanently delete)
router.delete(
  '/:id/permanent',
  authorize('SUPER_ADMIN'),
  HouseController.permanentlyDeleteHouse
);

// Restore deleted house (only SUPER_ADMIN and ADMIN can restore)
router.patch(
  '/:id/restore',
  authorize('SUPER_ADMIN', 'ADMIN'),
  HouseController.restoreHouse
);

export default router;