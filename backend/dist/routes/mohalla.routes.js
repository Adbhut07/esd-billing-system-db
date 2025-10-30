"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mohalla_controller_1 = require("../controllers/mohalla.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all mohallas (with pagination and search)
router.get('/', mohalla_controller_1.MohallaController.getMohallas);
// Get all mohallas without pagination (for dropdowns)
router.get('/all', mohalla_controller_1.MohallaController.getAllMohallas);
// Get mohalla by ID
router.get('/:id', mohalla_controller_1.MohallaController.getMohallaById);
// Get mohalla by number
router.get('/number/:number', mohalla_controller_1.MohallaController.getMohallaByNumber);
// Get houses in a mohalla
router.get('/:id/houses', mohalla_controller_1.MohallaController.getHousesInMohalla);
// Get mohalla statistics
router.get('/:id/statistics', mohalla_controller_1.MohallaController.getMohallaStatistics);
// Create new mohalla (only SUPER_ADMIN and ADMIN can create)
router.post('/', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), mohalla_controller_1.MohallaController.createMohalla);
// Bulk create mohallas (only SUPER_ADMIN and ADMIN can create)
router.post('/bulk', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), mohalla_controller_1.MohallaController.bulkCreateMohallas);
// Update mohalla (only SUPER_ADMIN and ADMIN can update)
router.put('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), mohalla_controller_1.MohallaController.updateMohalla);
// Delete mohalla (only SUPER_ADMIN can delete)
router.delete('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN'), mohalla_controller_1.MohallaController.deleteMohalla);
exports.default = router;
//# sourceMappingURL=mohalla.routes.js.map