"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================
// src/routes/charges.routes.ts
// ============================================
const express_1 = require("express");
const charges_controller_1 = require("../controllers/charges.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all charges
router.get('/', charges_controller_1.ChargesController.getAllCharges);
// Get charge by ID
router.get('/:id', charges_controller_1.ChargesController.getChargeById);
// Get charge by name
router.get('/name/:name', charges_controller_1.ChargesController.getChargeByName);
// Create or update charge (requires SUPER_ADMIN or ADMIN)
router.post('/', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), charges_controller_1.ChargesController.createOrUpdateCharge);
// Bulk update charges (requires SUPER_ADMIN or ADMIN)
router.post('/bulk', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), charges_controller_1.ChargesController.bulkUpdateCharges);
// Initialize default charges (requires SUPER_ADMIN)
router.post('/initialize', (0, auth_middleware_1.authorize)('SUPER_ADMIN'), charges_controller_1.ChargesController.initializeDefaultCharges);
// Delete charge (requires SUPER_ADMIN)
router.delete('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN'), charges_controller_1.ChargesController.deleteCharge);
exports.default = router;
//# sourceMappingURL=charges.routes.js.map