"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = require("../config/jwt.config");
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, jwt_config_1.jwtConfig.accessTokenSecret, {
        expiresIn: jwt_config_1.jwtConfig.accessTokenExpiry,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, jwt_config_1.jwtConfig.refreshTokenSecret, {
        expiresIn: jwt_config_1.jwtConfig.refreshTokenExpiry,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, jwt_config_1.jwtConfig.accessTokenSecret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, jwt_config_1.jwtConfig.refreshTokenSecret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.utils.js.map