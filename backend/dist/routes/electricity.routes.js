"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const electricity_controller_1 = require("../controllers/electricity.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all readings (with filters)
router.get('/', electricity_controller_1.ElectricityController.getElectricityReadings);
// Get reading by ID
router.get('/:id', electricity_controller_1.ElectricityController.getReadingById);
// Get reading by house and month
router.get('/house/month', electricity_controller_1.ElectricityController.getReadingByHouseAndMonth);
// Upload new reading (ADMIN and OPERATOR can upload)
router.post('/', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), electricity_controller_1.ElectricityController.uploadElectricityReading);
// Update reading (ADMIN and OPERATOR can update)
router.put('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), electricity_controller_1.ElectricityController.updateElectricityReading);
// Delete reading (only SUPER_ADMIN and ADMIN can delete)
router.delete('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), electricity_controller_1.ElectricityController.deleteElectricityReading);
// Recalculate consumption
router.post('/:id/recalculate', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), electricity_controller_1.ElectricityController.recalculateConsumption);
exports.default = router;
//# sourceMappingURL=electricity.routes.js.map