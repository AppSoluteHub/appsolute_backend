import Joi, { ObjectSchema } from 'joi';
import { Request, Response, NextFunction } from 'express';

//
// — Create Task Schema
//
export const createTaskSchema: ObjectSchema = Joi.object({
  title: Joi.string().trim().required().min(1).max(255),

  categories: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .required(),

  tags: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .required(),

  url: Joi.string().uri().required(),

  points: Joi.number().integer().min(0).required(),
  imageUrl :Joi.string().uri().required(),
  description: Joi.string().trim().required(),
  questions: Joi.array()
    .items(
      Joi.object({
        questionText: Joi.string().trim().required(),
        options: Joi.array().items(Joi.string().trim()).min(1).required(),
        correctAnswer: Joi.string().trim().required(),
      })
    )
    .min(1)
    .required(),
});

//
// — Update Task Schema
//
export const updateTaskSchema: ObjectSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255),

  categories: Joi.array()
    .items(Joi.string().trim())
    .min(1),

  tags: Joi.array()
    .items(Joi.string().trim())
    .min(1),

  url: Joi.string().uri(),

  points: Joi.number().integer().min(0),

  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().trim().required(),
      options: Joi.array().items(Joi.string().trim()).min(1).required(),
      correctAnswer: Joi.string().trim().required(),
    })
  ).min(1),
}).min(1); // Require at least one field for update

//
// — Generic validation middleware
//
export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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
