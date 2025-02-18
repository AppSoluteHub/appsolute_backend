import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/appError"; 

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = 409; 
        message = "A record with this value already exists.";
        break;
      case "P2003":
        statusCode = 400; 
        message = "Cannot perform this action due to associated records.";
        break;
      case "P2025":
        statusCode = 404; 
        message = "Resource not found.";
        break;
      default:
        statusCode = 500;
        message = "Database error occurred.";
    }
  }


  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
