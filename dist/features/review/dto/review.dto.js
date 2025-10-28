"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewDto = exports.createReviewDto = void 0;
const joi_1 = __importDefault(require("joi"));
const ratingSchema = joi_1.default.number()
    .integer()
    .min(1)
    .max(5)
    .messages({
    'number.base': 'Rating must be a number',
    'number.integer': 'Rating must be an integer',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be at most 5',
});
exports.createReviewDto = joi_1.default.object({
    rating: ratingSchema.required().messages({
        'any.required': 'Rating is required',
    }),
    title: joi_1.default.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title must be less than 100 characters',
        'any.required': 'Title is required',
    }),
    comment: joi_1.default.string()
        .trim()
        .min(5)
        .max(1000)
        .required()
        .messages({
        'string.empty': 'Comment is required',
        'string.min': 'Comment must be at least 5 characters long',
        'string.max': 'Comment must be less than 1000 characters',
        'any.required': 'Comment is required',
    }),
    isRecommending: joi_1.default.boolean()
        .required()
        .messages({
        'boolean.base': 'isRecommending must be true or false',
        'any.required': 'isRecommending is required',
    }),
});
exports.updateReviewDto = joi_1.default.object({
    rating: ratingSchema.optional(),
    title: joi_1.default.string().trim().min(3).max(100).optional(),
    comment: joi_1.default.string().trim().min(5).max(1000).optional(),
    isRecommending: joi_1.default.boolean().optional(),
}).min(1).messages({
    'object.min': 'At least one field must be provided to update',
});
