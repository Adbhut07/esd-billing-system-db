import { Router } from 'express';
import { BillController } from '../controllers/bill.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all bills (with filters)
router.get('/', BillController.getBills);

// Get bill by ID
router.get('/:id', BillController.getBillById);

// Get bill summary for a house
router.get('/house/:houseId/summary', BillController.getBillSummary);

// Update other charges for a reading (ADMIN and OPERATOR can update)
router.put(
  '/other-charges',
  authorize('SUPER_ADMIN', 'ADMIN', 'OPERATOR'),
  BillController.updateOtherCharges
);

// Generate bill for a reading (ADMIN and OPERATOR can generate)
router.post(
  '/generate',
  authorize('SUPER_ADMIN', 'ADMIN', 'OPERATOR'),
  BillController.generateBill
);

// Bulk generate bills for a mohalla (only SUPER_ADMIN and ADMIN)
router.post(
  '/bulk-generate',
  authorize('SUPER_ADMIN', 'ADMIN'),
  BillController.bulkGenerateBills
);

// Update paid amount for a bill (ADMIN and OPERATOR can update)
router.put(
  '/payment',
  authorize('SUPER_ADMIN', 'ADMIN', 'OPERATOR'),
  BillController.updatePaidAmount
);

export default router;
