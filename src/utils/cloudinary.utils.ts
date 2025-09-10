import cloudinary from '../config/cloudinary';
import { AppError } from '../lib/appError';

export const uploadImageToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          return reject(new AppError('Failed to upload image to Cloudinary', 500));
        }
        if (!result || !result.secure_url) {
          return reject(new AppError('Cloudinary upload did not return a secure URL', 500));
        }
        resolve(result.secure_url);
      }
    ).end(file.buffer);
  });
};


export const uploadMultipleImagesToCloudinary = async (files: Express.Multer.File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageToCloudinary(file));
  return Promise.all(uploadPromises);
};