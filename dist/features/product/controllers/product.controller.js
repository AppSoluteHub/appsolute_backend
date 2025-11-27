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
const createProduct = async (req, res, next) => {
    try {
        const { image: imageUrl, gallery: galleryUrls, ...restOfBody } = req.body;
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
        const { image: imageUrl, gallery: galleryUrls, ...restOfBody } = req.body;
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
        const productData = { ...restOfBody };
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
