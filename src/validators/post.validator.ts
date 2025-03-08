// src/postValidation.ts
import { PostCategory } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';


const createPostSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  contributors: Joi.string().required(),
  isPublished: Joi.boolean().optional(),
  imageUrl: Joi.string().optional(),
  category: Joi.string()
  .valid(...Object.values(PostCategory)) 
  .optional(),
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
