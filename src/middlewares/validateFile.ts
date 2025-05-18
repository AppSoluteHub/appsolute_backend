import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../lib/appError';

export const validateFile = (req: Request, res: Response, next: NextFunction) => {
  // For update operations, file is optional
  if (req.method === 'PATCH' && !req.file) {
    return next();
  }

  // For create operations, file is required
  if (req.method === 'POST' && !req.file) {
    throw new BadRequestError('Image file is required');
  }

  if (req.file) {
    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new BadRequestError('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed');
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (req.file.size > maxSize) {
      throw new BadRequestError('File size too large. Maximum size is 5MB');
    }
  }

  next();
}; 