import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().optional()
    
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  next();
};

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  next();
};

export const validateResetPassword = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    password: Joi.string().min(8).required(),
    token: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  next();
};
