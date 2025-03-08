import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateUpdateTask = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    question: Joi.string().min(5).max(500).optional(),
    url: Joi.string().uri().optional(),
    options: Joi.array().items(Joi.string().required()).min(2).optional(),
    correctAnswer: Joi.string().optional(),
    score: Joi.number().integer().min(1).optional(),
  }).or("question", "url", "options", "correctAnswer", "score"); 

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  next();
};
