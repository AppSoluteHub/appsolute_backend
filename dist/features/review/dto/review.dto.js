"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewDto = exports.createReviewDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createReviewDto = joi_1.default.object({
    rating: joi_1.default.number().integer().min(1).max(5).required().messages({
        'number.min': 'Rating must be at least 1',
        'number.max': 'Rating must be at most 5',
        'number.integer': 'Rating must be an integer',
        'any.required': 'Rating is required'
    }),
    comment: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Comment is required',
        'any.required': 'Comment is required'
    }),
    productId: joi_1.default.number().integer().required().messages({
        'number.integer': 'Product ID must be an integer',
        'any.required': 'Product ID is required'
    }),
    userId: joi_1.default.string().min(1).required().messages({
        'string.empty': 'User ID is required',
        'any.required': 'User ID is required'
    }), // Assuming userId is string from auth middleware
});
exports.updateReviewDto = joi_1.default.object({
    rating: joi_1.default.number().integer().min(1).max(5).optional().messages({
        'number.min': 'Rating must be at least 1',
        'number.max': 'Rating must be at most 5',
        'number.integer': 'Rating must be an integer'
    }),
    comment: joi_1.default.string().min(1).optional().messages({
        'string.empty': 'Comment is required'
    }),
});
