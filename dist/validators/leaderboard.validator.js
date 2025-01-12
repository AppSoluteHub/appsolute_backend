"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLeaderboard = void 0;
const joi_1 = __importDefault(require("joi"));
// Define the schema for leaderboard operations
const leaderboardSchema = joi_1.default.object({
    userId: joi_1.default.string().uuid().required(),
    score: joi_1.default.number().min(0).required(),
    answered: joi_1.default.number().integer().min(0).optional(),
});
// Validation middleware
const validateLeaderboard = (req, res, next) => {
    const { error } = leaderboardSchema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400).json({
            message: 'Validation error',
            details: error.details.map((detail) => detail.message),
        });
        return;
    }
    next();
};
exports.validateLeaderboard = validateLeaderboard;
