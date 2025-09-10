import Joi from 'joi';

export const createProductDto = Joi.object({
  title: Joi.string().min(1).required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(1).required().messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required'
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required'
  }),
  image: Joi.string().uri().required().messages({
    'string.uri': 'Image must be a valid URL',
    'any.required': 'Image is required'
  }),
  gallery: Joi.array().items(
    Joi.string().uri().messages({
      'string.uri': 'Gallery items must be valid URLs'
    })
  ).optional(),
  colors: Joi.array().items(Joi.string()).optional(),
  sizes: Joi.array().items(Joi.string()).optional(),
  stock: Joi.number().integer().min(0).required().messages({
    'number.min': 'Stock cannot be negative',
    'number.integer': 'Stock must be an integer',
    'any.required': 'Stock is required'
  }),
  sku: Joi.string().min(1).required().messages({
    'string.empty': 'SKU is required',
    'any.required': 'SKU is required'
  }),
  category: Joi.string().min(1).required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required'
  }),
  tags: Joi.array().items(Joi.string()).optional(),
});

export const updateProductDto = Joi.object({
  title: Joi.string().min(1).optional().messages({
    'string.empty': 'Title is required'
  }),
  description: Joi.string().min(1).optional().messages({
    'string.empty': 'Description is required'
  }),
  price: Joi.number().positive().optional().messages({
    'number.positive': 'Price must be a positive number'
  }),
  image: Joi.string().uri().optional().messages({
    'string.uri': 'Image must be a valid URL'
  }),
  gallery: Joi.array().items(
    Joi.string().uri().messages({
      'string.uri': 'Gallery items must be valid URLs'
    })
  ).optional(),
  colors: Joi.array().items(Joi.string()).optional(),
  sizes: Joi.array().items(Joi.string()).optional(),
  stock: Joi.number().integer().min(0).optional().messages({
    'number.min': 'Stock cannot be negative',
    'number.integer': 'Stock must be an integer'
  }),
  sku: Joi.string().min(1).optional().messages({
    'string.empty': 'SKU is required'
  }),
  category: Joi.string().min(1).optional().messages({
    'string.empty': 'Category is required'
  }),
  tags: Joi.array().items(Joi.string()).optional(),
});