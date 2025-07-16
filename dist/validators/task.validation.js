"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const joi_1 = __importDefault(require("joi"));
//
// — Create Task Schema
//
exports.createTaskSchema = joi_1.default.object({
    title: joi_1.default.string().trim().required().min(1).max(255),
    categories: joi_1.default.array()
        .items(joi_1.default.string().trim())
        .min(1)
        .required(),
    tags: joi_1.default.array()
        .items(joi_1.default.string().trim())
        .min(1)
        .required(),
    url: joi_1.default.string().uri().required(),
    points: joi_1.default.number().integer().min(0).required(),
    imageUrl: joi_1.default.string().uri().required(),
    description: joi_1.default.string().trim().required(),
    questions: joi_1.default.array()
        .items(joi_1.default.object({
        questionText: joi_1.default.string().trim().required(),
        options: joi_1.default.array().items(joi_1.default.string().trim()).min(1).required(),
        correctAnswer: joi_1.default.string().trim().required(),
    }))
        .min(1)
        .required(),
});
//
// — Update Task Schema
//
exports.updateTaskSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(1).max(255),
    categories: joi_1.default.array()
        .items(joi_1.default.string().trim())
        .min(1),
    tags: joi_1.default.array()
        .items(joi_1.default.string().trim())
        .min(1),
    url: joi_1.default.string().uri(),
    points: joi_1.default.number().integer().min(0),
    questions: joi_1.default.array().items(joi_1.default.object({
        questionText: joi_1.default.string().trim().required(),
        options: joi_1.default.array().items(joi_1.default.string().trim()).min(1).required(),
        correctAnswer: joi_1.default.string().trim().required(),
    })).min(1),
}).min(1); // Require at least one field for update
//
// — Generic validation middleware
//
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            res.status(400).json({
                status: 'error',
                message: errorMessage,
            });
            return;
        }
        req.body = value;
        next();
    };
};
exports.validate = validate;
