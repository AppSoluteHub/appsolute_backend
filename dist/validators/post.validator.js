"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePost = void 0;
// src/postValidation.ts
const client_1 = require("@prisma/client");
const joi_1 = __importDefault(require("joi"));
// Define the schema
const createPostSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    contributors: joi_1.default.string().required(),
    isPublished: joi_1.default.boolean().optional(),
    imageUrl: joi_1.default.string().optional(),
    category: joi_1.default.string()
        .valid(...Object.values(client_1.PostCategory))
        .optional(),
});
const validatePost = (req, res, next) => {
    const { error } = createPostSchema.validate(req.body, { abortEarly: false });
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
