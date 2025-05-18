// src/postValidation.ts
import { PostCategory } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const createPostSchema = Joi.object({
  title: Joi.string().required().min(3).max(200).messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  description: Joi.string().required().min(10).messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters long',
  }),
  category: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.base': 'Category must be an array',
    'array.min': 'At least one category is required',
  }),
  contributors: Joi.array().items(Joi.string()).default([]),
  isPublished: Joi.boolean().default(false),
});

export const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(200).messages({
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  description: Joi.string().min(10).messages({
    'string.min': 'Description must be at least 10 characters long',
  }),
  category: Joi.array().items(Joi.string()).min(1).messages({
    'array.base': 'Category must be an array',
    'array.min': 'At least one category is required',
  }),
  contributors: Joi.array().items(Joi.string()),
  isPublished: Joi.boolean(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const validatePost = (req: Request, res: Response, next: NextFunction): void => {
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

export { validatePost };
