import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { NotFoundError, InternalServerError } from "../lib/appError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2003") {
      statusCode = 400;
      message = "Cannot delete post: It has associated comments.";
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
