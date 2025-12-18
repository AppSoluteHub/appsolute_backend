"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.deleteImage = exports.updateImage = exports.getImageById = exports.getUserImages = exports.getImageStatus = exports.transformImage = void 0;
const ai_image_service_1 = require("./ai-image.service");
const appError_1 = require("../../lib/appError");
const transformImage = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        const image = req.file;
        const userId = req.user?.id;
        if (!image || !prompt) {
            throw new appError_1.BadRequestError("Image and prompt are required");
        }
        const result = await ai_image_service_1.AiImageService.transformImageAsync(prompt, image, userId);
        res.status(202).json({
            status: "success",
            message: "Image processing started. Use the image ID to check status.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.transformImage = transformImage;
const getImageStatus = async (req, res, next) => {
    try {
        const { imageId } = req.params;
        const userId = req.user?.id;
        const image = await ai_image_service_1.AiImageService.getImageStatus(imageId, userId);
        res.status(200).json({
            status: "success",
            data: image,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getImageStatus = getImageStatus;
// Get user images
const getUserImages = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const result = await ai_image_service_1.AiImageService.getUserImages(userId, page, limit, status);
        res.status(200).json({
            status: "success",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserImages = getUserImages;
const getImageById = async (req, res, next) => {
    try {
        const { imageId } = req.params;
        const userId = req.user?.id;
        const image = await ai_image_service_1.AiImageService.getImageById(imageId, userId);
        res.status(200).json({
            status: "success",
            data: image,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getImageById = getImageById;
// Update image 
const updateImage = async (req, res, next) => {
    try {
        const { imageId } = req.params;
        const { prompt } = req.body;
        const userId = req.user?.id;
        if (!prompt) {
            throw new appError_1.BadRequestError("Prompt is required");
        }
        const result = await ai_image_service_1.AiImageService.updateImageAsync(imageId, userId, {
            prompt,
        });
        res.status(202).json({
            status: "success",
            message: "Image update started. Use the image ID to check status.",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateImage = updateImage;
const deleteImage = async (req, res, next) => {
    try {
        const { imageId } = req.params;
        const userId = req.user?.id;
        const result = await ai_image_service_1.AiImageService.deleteImage(imageId, userId);
        res.status(200).json({
            status: "success",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteImage = deleteImage;
// Get user stats
const getUserStats = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const stats = await ai_image_service_1.AiImageService.getUserStats(userId);
        res.status(200).json({
            status: "success",
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserStats = getUserStats;
