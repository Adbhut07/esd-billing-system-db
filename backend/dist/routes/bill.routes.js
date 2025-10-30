"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bill_controller_1 = require("../controllers/bill.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all bills (with filters)
router.get('/', bill_controller_1.BillController.getBills);
// Get bill by ID
router.get('/:id', bill_controller_1.BillController.getBillById);
// Get bill summary for a house
router.get('/house/:houseId/summary', bill_controller_1.BillController.getBillSummary);
// Update other charges for a reading (ADMIN and OPERATOR can update)
router.put('/other-charges', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), bill_controller_1.BillController.updateOtherCharges);
// Generate bill for a reading (ADMIN and OPERATOR can generate)
router.post('/generate', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), bill_controller_1.BillController.generateBill);
// Bulk generate bills for a mohalla (only SUPER_ADMIN and ADMIN)
router.post('/bulk-generate', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), bill_controller_1.BillController.bulkGenerateBills);
// Update paid amount for a bill (ADMIN and OPERATOR can update)
router.put('/payment', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), bill_controller_1.BillController.updatePaidAmount);
exports.default = router;
//# sourceMappingURL=bill.routes.js.map