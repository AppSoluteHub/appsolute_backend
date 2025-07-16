"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePost = exports.updatePostSchema = exports.createPostSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createPostSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(3).max(200).messages({
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title cannot exceed 200 characters',
    }),
    description: joi_1.default.string().required().min(10).messages({
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 10 characters long',
    }),
    category: joi_1.default.array().items(joi_1.default.string()).min(1).required().messages({
        'array.base': 'Category must be an array',
        'array.min': 'At least one category is required',
    }),
    contributors: joi_1.default.array().items(joi_1.default.string()).default([]),
    isPublished: joi_1.default.boolean().default(false),
});
exports.updatePostSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(200).messages({
        'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title cannot exceed 200 characters',
    }),
    description: joi_1.default.string().min(10).messages({
        'string.min': 'Description must be at least 10 characters long',
    }),
    category: joi_1.default.array().items(joi_1.default.string()).min(1).messages({
        'array.base': 'Category must be an array',
        'array.min': 'At least one category is required',
    }),
    contributors: joi_1.default.array().items(joi_1.default.string()),
    isPublished: joi_1.default.boolean(),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update',
});
const validatePost = (req, res, next) => {
    const { error } = exports.createPostSchema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400).json({
            message: 'Validation error',
            details: error.details.map((detail) => detail.message),
        });
        return;
    }
    next();
};
exports.validatePost = validatePost;
