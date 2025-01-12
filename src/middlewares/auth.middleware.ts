import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export default function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded.userId;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}
