import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../lib/appError';


export const validateFile = (req: Request, res: Response, next: NextFunction) => {
  // For update operations, file is optional
  if (req.method === 'PATCH' && !req.files) {
    return next();
  }

  // For create operations, file is required
  if (req.method === 'POST' && (!req.files || !(req.files as any).image)) {
    throw new BadRequestError('Image file is required');
  }

  const imageFiles = (req.files as any)?.image || [];
  const fileToValidate = imageFiles[0]; // first image

  if (fileToValidate) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(fileToValidate.mimetype)) {
      throw new BadRequestError('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileToValidate.size > maxSize) {
      throw new BadRequestError('File size too large. Maximum size is 5MB');
    }
  }

  next();
};
