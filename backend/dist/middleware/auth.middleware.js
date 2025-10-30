"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required',
            });
        }
        const token = authHeader.substring(7);
        const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
            });
        }
        // Check if admin exists and is active
        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
            },
        });
        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found or inactive',
            });
        }
        req.admin = {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
        };
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.authenticate = authenticate;
// Role-based authorization middleware
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        if (!allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map