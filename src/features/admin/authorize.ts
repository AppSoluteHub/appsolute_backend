
import { Request, Response, NextFunction } from "express";
export function authorizeRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
   
    if (req.user?.role !== requiredRole) {
       res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
       return;
    }
    next();
  };
}
