import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { AppError } from '../../../lib/appError';
import { uploadImageToCloudinary, uploadMultipleImagesToCloudinary } from '../../../utils/cloudinary.utils'; // Import cloudinary utils

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let imageUrl: string | undefined;
    let galleryUrls: string[] | undefined;

    // Handle single image upload
    if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] }).image) {
      const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];
      imageUrl = await uploadImageToCloudinary(imageFile);
    }

    // Handle multiple gallery images upload
    if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] }).gallery) {
      const galleryFiles = (req.files as { [fieldname: string]: Express.Multer.File[] }).gallery;
      galleryUrls = await uploadMultipleImagesToCloudinary(galleryFiles);
    }

    const productData = {
      ...req.body,
      image: imageUrl,
      gallery: galleryUrls,
    };

    const product = await productService.createProduct(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, category, search } = req.query;
    const options = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      category: category as string,
      search: search as string,
    };
    const products = await productService.getAllProducts(options);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductById(parseInt(req.params.id));
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let imageUrl: string | undefined;
    let galleryUrls: string[] | undefined;

    // Handle single image upload for update
    if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] }).image) {
      const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];
      imageUrl = await uploadImageToCloudinary(imageFile);
    }

    // Handle multiple gallery images upload for update
    if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] }).gallery) {
      const galleryFiles = (req.files as { [fieldname: string]: Express.Multer.File[] }).gallery;
      galleryUrls = await uploadMultipleImagesToCloudinary(galleryFiles);
    }

    const productData = {
      ...req.body,
      ...(imageUrl && { image: imageUrl }), // Only add image if it was uploaded
      ...(galleryUrls && { gallery: galleryUrls }), // Only add gallery if it was uploaded
    };

    const product = await productService.updateProduct(parseInt(req.params.id), productData);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.deleteProduct(parseInt(req.params.id));
    res.status(204).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};