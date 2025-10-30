"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const water_controller_1 = require("../controllers/water.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all water readings (with filters)
router.get('/', water_controller_1.WaterController.getWaterReadings);
// Get reading by ID
router.get('/:id', water_controller_1.WaterController.getReadingById);
// Get reading by house and month
router.get('/house/month', water_controller_1.WaterController.getReadingByHouseAndMonth);
// Upload new water reading (ADMIN and OPERATOR can upload)
router.post('/', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), water_controller_1.WaterController.uploadWaterReading);
// Bulk upload water readings (ADMIN and OPERATOR can upload)
router.post('/bulk', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), water_controller_1.WaterController.bulkUploadWaterReadings);
// Update water reading (ADMIN and OPERATOR can update)
router.put('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), water_controller_1.WaterController.updateWaterReading);
// Delete water reading (only SUPER_ADMIN and ADMIN can delete)
router.delete('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), water_controller_1.WaterController.deleteWaterReading);
// Recalculate water consumption for a reading
router.post('/:id/recalculate', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), water_controller_1.WaterController.recalculateWaterConsumption);
// Recalculate all water consumption for a house
router.post('/house/:houseId/recalculate-all', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), water_controller_1.WaterController.recalculateAllWaterConsumption);
exports.default = router;
//# sourceMappingURL=water.routes.js.map