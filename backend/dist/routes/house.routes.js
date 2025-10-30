"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const house_controller_1 = require("../controllers/house.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all houses (with filters)
router.get('/', house_controller_1.HouseController.getAllHouses);
// Get house by ID
router.get('/:id', house_controller_1.HouseController.getHouseById);
// Get house by mohalla number and house number
router.get('/search/by-location', house_controller_1.HouseController.getHouseByMohallaAndHouseNumber);
// Create new house (only SUPER_ADMIN and ADMIN can create)
router.post('/', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), house_controller_1.HouseController.createHouse);
// Update house (only SUPER_ADMIN and ADMIN can update)
router.put('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), house_controller_1.HouseController.updateHouse);
// Update license fee (ADMIN and OPERATOR can update)
router.patch('/license-fee', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), house_controller_1.HouseController.updateLicenseFee);
// Update residence fee (ADMIN and OPERATOR can update)
router.patch('/residence-fee', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), house_controller_1.HouseController.updateResidenceFee);
// Soft delete house (only SUPER_ADMIN and ADMIN can delete)
router.delete('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), house_controller_1.HouseController.deleteHouse);
// Permanently delete house (only SUPER_ADMIN can permanently delete)
router.delete('/:id/permanent', (0, auth_middleware_1.authorize)('SUPER_ADMIN'), house_controller_1.HouseController.permanentlyDeleteHouse);
// Restore deleted house (only SUPER_ADMIN and ADMIN can restore)
router.patch('/:id/restore', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), house_controller_1.HouseController.restoreHouse);
exports.default = router;
//# sourceMappingURL=house.routes.js.map