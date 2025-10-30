"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
exports.jwtConfig = {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    accessTokenExpiry: '24h', // 15 minutes
    refreshTokenExpiry: '7d', // 7 days
};
//# sourceMappingURL=jwt.config.js.map