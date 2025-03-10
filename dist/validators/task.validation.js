"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTask = void 0;
const joi_1 = __importDefault(require("joi"));
const validateTask = (req, res, next) => {
    const schema = joi_1.default.object({
        title: joi_1.default.string().min(3).max(200).required(),
        question: joi_1.default.string().min(5).max(500).required(),
        url: joi_1.default.string().uri().required(),
        options: joi_1.default.array().items(joi_1.default.string().required()).min(2).required(),
        correctAnswer: joi_1.default.string().required(),
        score: joi_1.default.number().integer().min(1).default(5),
        points: joi_1.default.number().integer().min(1).default(10),
        tags: joi_1.default.array().items(joi_1.default.string().min(2).max(50)).min(1).required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateTask = validateTask;
