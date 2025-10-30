"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', auth_controller_1.AuthController.login);
router.post('/refresh-token', auth_controller_1.AuthController.refreshToken);
// Protected routes
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.AuthController.logout);
router.get('/profile', auth_middleware_1.authenticate, auth_controller_1.AuthController.getProfile);
router.post('/change-password', auth_middleware_1.authenticate, auth_controller_1.AuthController.changePassword);
// SUPER_ADMIN only routes
router.post('/register', auth_controller_1.AuthController.register);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map