import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

// Augment the Express.Request type to include the `user` property
declare global {
  namespace Express {
    interface Request {
      user?: any; // Adjust type if `user` contains more than just `userId`
    }
  }
}

export default function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token; 

  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  try {
    const decoded = verifyToken(token); // Decodes the token, should return an object
    req.user = decoded.userId; // Attach the userId to the request object
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
