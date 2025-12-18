"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRateLimiter = exports.globalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again in a minute.',
    },
});
exports.userRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 3,
    keyGenerator: (req) => req.user.userId,
    message: 'Too many image requests. Please wait a moment.',
});
