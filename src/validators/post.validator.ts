// src/postValidation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Define the schema
const createPostSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  isPublished: Joi.boolean().optional(),
  imageUrl: Joi.string().required(),
  category: Joi.string()
    .valid('AI', 'TECHNOLOGY', 'MARKETING', 'DESIGN', 'SOFTWARE')
    .optional(),
});

// Validation middleware
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
