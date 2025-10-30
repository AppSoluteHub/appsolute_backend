import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service";
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
    const { image: imageUrl, gallery: galleryUrls, ...restOfBody } = req.body;

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
      ...restOfBody,
      price: parseFloat(restOfBody.price),
      weight: parseFloat(restOfBody.weight),
      stock: parseInt(restOfBody.stock, 10),
      colors: normalizeArray(restOfBody.colors),
      sizes: normalizeArray(restOfBody.sizes),
      tags: normalizeArray(restOfBody.tags),
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
    const { image: imageUrl, gallery: galleryUrls, ...restOfBody } = req.body;

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

    const productData: any = { ...restOfBody };

    if (restOfBody.price) {
      productData.price = parseFloat(restOfBody.price);
    }
    if (restOfBody.weight) {
      productData.weight = parseFloat(restOfBody.weight);
    }
    if (restOfBody.stock) {
      productData.stock = parseInt(restOfBody.stock, 10);
    }
    if (restOfBody.colors) {
      productData.colors = normalizeArray(restOfBody.colors);
    }
    if (restOfBody.sizes) {
      productData.sizes = normalizeArray(restOfBody.sizes);
    }
    if (restOfBody.tags) {
      productData.tags = normalizeArray(restOfBody.tags);
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
