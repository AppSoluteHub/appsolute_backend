"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const productService = __importStar(require("../services/product.service"));
const cloudinary_utils_1 = require("../../../utils/cloudinary.utils");
const createProduct = async (req, res, next) => {
    try {
        let imageUrl;
        let galleryUrls;
        // Handle single image upload
        if (req.files &&
            req.files.image) {
            const imageFile = req.files.image[0];
            imageUrl = await (0, cloudinary_utils_1.uploadImageToCloudinary)(imageFile);
        }
        // Handle multiple gallery images upload
        if (req.files &&
            req.files.gallery) {
            const galleryFiles = req.files.gallery;
            galleryUrls = await (0, cloudinary_utils_1.uploadMultipleImagesToCloudinary)(galleryFiles);
        }
        const normalizeArray = (field) => {
            if (!field)
                return [];
            if (Array.isArray(field))
                return field;
            if (typeof field === 'string') {
                try {
                    const parsed = JSON.parse(field);
                    if (Array.isArray(parsed))
                        return parsed;
                }
                catch (e) {
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
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const getAllProducts = async (req, res, next) => {
    try {
        const { page, limit, category, search } = req.query;
        const options = {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            category: category,
            search: search,
        };
        const products = await productService.getAllProducts(options);
        res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res, next) => {
    try {
        let imageUrl;
        let galleryUrls;
        // Handle single image upload for update
        if (req.files &&
            req.files.image) {
            const imageFile = req.files.image[0];
            imageUrl = await (0, cloudinary_utils_1.uploadImageToCloudinary)(imageFile);
        }
        // Handle multiple gallery images upload for update
        if (req.files &&
            req.files.gallery) {
            const galleryFiles = req.files.gallery;
            galleryUrls = await (0, cloudinary_utils_1.uploadMultipleImagesToCloudinary)(galleryFiles);
        }
        const normalizeArray = (field) => {
            if (!field)
                return undefined;
            if (Array.isArray(field))
                return field;
            if (typeof field === 'string') {
                try {
                    const parsed = JSON.parse(field);
                    if (Array.isArray(parsed))
                        return parsed;
                }
                catch (e) {
                    return field.split(',').map(item => item.trim());
                }
            }
            return [field];
        };
        const productData = { ...req.body };
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
        const product = await productService.updateProduct(req.params.id, productData);
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.status(204).json({ success: true, data: null });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
