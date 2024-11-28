import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Define the schema for leaderboard operations
const leaderboardSchema = Joi.object({
  userId: Joi.string().uuid().required(), 
  score: Joi.number().min(0).required(), 
  answered: Joi.number().integer().min(0).optional(), 
});

// Validation middleware
const validateLeaderboard = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = leaderboardSchema.validate(req.body, { abortEarly: false });

  if (error) {
    res.status(400).json({
      message: 'Validation error',
      details: error.details.map((detail) => detail.message),
    });
    return; 
  }

  next(); 
};

export { validateLeaderboard };
