import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateTask = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    question: Joi.string().min(5).max(500).required(),
    url: Joi.string().uri().required(),
    options: Joi.array().items(Joi.string().required()).min(2).required(),
    correctAnswer: Joi.string().required(),
    score: Joi.number().integer().min(1).default(5),
    points: Joi.number().integer().min(1).default(10),
    tags: Joi.array().items(Joi.string().min(2).max(50)).min(1).required()
  });
  

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  next();
};
