"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductDto = exports.createProductDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createProductDto = joi_1.default.object({
    title: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Title is required',
        'any.required': 'Title is required'
    }),
    description: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Description is required',
        'any.required': 'Description is required'
    }),
    price: joi_1.default.number().positive().required().messages({
        'number.positive': 'Price must be a positive number',
        'any.required': 'Price is required'
    }),
    image: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Image must be a valid URL'
    }),
    gallery: joi_1.default.array().items(joi_1.default.string().uri().messages({
        'string.uri': 'Gallery items must be valid URLs'
    })).optional(),
    colors: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()), joi_1.default.string()).optional(),
    sizes: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()), joi_1.default.string()).optional(),
    stock: joi_1.default.number().integer().min(0).required().messages({
        'number.min': 'Stock cannot be negative',
        'number.integer': 'Stock must be an integer',
        'any.required': 'Stock is required'
    }),
    sku: joi_1.default.string().min(1).required().messages({
        'string.empty': 'SKU is required',
        'any.required': 'SKU is required'
    }),
    category: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Category is required',
        'any.required': 'Category is required'
    }),
    tags: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()), joi_1.default.string()).optional(),
});
exports.updateProductDto = joi_1.default.object({
    title: joi_1.default.string().min(1).optional().messages({
        'string.empty': 'Title is required'
    }),
    description: joi_1.default.string().min(1).optional().messages({
        'string.empty': 'Description is required'
    }),
    price: joi_1.default.number().positive().optional().messages({
        'number.positive': 'Price must be a positive number'
    }),
    image: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Image must be a valid URL'
    }),
    gallery: joi_1.default.array().items(joi_1.default.string().uri().messages({
        'string.uri': 'Gallery items must be valid URLs'
    })).optional(),
    colors: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()), joi_1.default.string()).optional(),
    sizes: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()), joi_1.default.string()).optional(),
    stock: joi_1.default.number().integer().min(0).optional().messages({
        'number.min': 'Stock cannot be negative',
        'number.integer': 'Stock must be an integer'
    }),
    sku: joi_1.default.string().min(1).optional().messages({
        'string.empty': 'SKU is required'
    }),
    category: joi_1.default.string().min(1).optional().messages({
        'string.empty': 'Category is required'
    }),
    tags: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()), joi_1.default.string()).optional(),
});
