import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service";
import { AppError } from "../../../lib/appError";
import {
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
} from "../../../utils/cloudinary.utils";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let imageUrl: string | undefined;
    let galleryUrls: string[] | undefined;

    // Handle single image upload
    if (
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] }).image
    ) {
      const imageFile = (
        req.files as { [fieldname: string]: Express.Multer.File[] }
      ).image[0];
      imageUrl = await uploadImageToCloudinary(imageFile);
    }

    // Handle multiple gallery images upload
    if (
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] }).gallery
    ) {
      const galleryFiles = (
        req.files as { [fieldname: string]: Express.Multer.File[] }
      ).gallery;
      galleryUrls = await uploadMultipleImagesToCloudinary(galleryFiles);
    }

    const normalizeArray = (field: any) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          return field.split(',').map(item => item.trim());
        }
      }
      return [field];
    };

    const productData = {
      ...req.body,
      price: parseFloat(req.body.price),
      weight: parseFloat(req.body.weight),
      stock: parseInt(req.body.stock, 10),
      colors: normalizeArray(req.body.colors),
      sizes: normalizeArray(req.body.sizes),
      tags: normalizeArray(req.body.tags),
      image: imageUrl,
      gallery: galleryUrls,
    };

    const product = await productService.createProduct(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getProductById(
      req.params.id)
    
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let imageUrl: string | undefined;
    let galleryUrls: string[] | undefined;

    // Handle single image upload for update
    if (
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] }).image
    ) {
      const imageFile = (
        req.files as { [fieldname: string]: Express.Multer.File[] }
      ).image[0];
      imageUrl = await uploadImageToCloudinary(imageFile);
    }

    // Handle multiple gallery images upload for update
    if (
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] }).gallery
    ) {
      const galleryFiles = (
        req.files as { [fieldname: string]: Express.Multer.File[] }
      ).gallery;
      galleryUrls = await uploadMultipleImagesToCloudinary(galleryFiles);
    }

    const normalizeArray = (field: any) => {
      if (!field) return undefined;
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          return field.split(',').map(item => item.trim());
        }
      }
      return [field];
    };

    const productData: any = { ...req.body };

    if (req.body.price) {
      productData.price = parseFloat(req.body.price);
    }
    if (req.body.weight) {
      productData.weight = parseFloat(req.body.weight);
    }
    if (req.body.stock) {
      productData.stock = parseInt(req.body.stock, 10);
    }
    if (req.body.colors) {
      productData.colors = normalizeArray(req.body.colors);
    }
    if (req.body.sizes) {
      productData.sizes = normalizeArray(req.body.sizes);
    }
    if (req.body.tags) {
      productData.tags = normalizeArray(req.body.tags);
    }
    if (imageUrl) {
      productData.image = imageUrl;
    }
    if (galleryUrls) {
      productData.gallery = galleryUrls;
    }

    const product = await productService.updateProduct(
      req.params.id,
      productData
    );
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
