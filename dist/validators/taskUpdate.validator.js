"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateTask = void 0;
const joi_1 = __importDefault(require("joi"));
const validateUpdateTask = (req, res, next) => {
    const schema = joi_1.default.object({
        question: joi_1.default.string().min(5).max(500).optional(),
        url: joi_1.default.string().uri().optional(),
        options: joi_1.default.array().items(joi_1.default.string().required()).min(2).optional(),
        correctAnswer: joi_1.default.string().optional(),
        score: joi_1.default.number().integer().min(1).optional(),
    }).or("question", "url", "options", "correctAnswer", "score");
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateUpdateTask = validateUpdateTask;
