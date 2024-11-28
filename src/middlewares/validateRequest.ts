import { Request, Response, NextFunction } from "express";

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body) return res.status(400).json({ error: "Invalid request data" });
  next();
};

export default validateRequest;
