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
// ✅ Update image (async)
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
// ✅ Get user stats
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
// import { Request, Response } from 'express';
// import { catchAsync } from '../../utils/catchAsync';
// import { AiImageService } from './ai-image.service';
// export class AiImageController {
//     static generateImage = catchAsync(async (req: Request, res: Response) => {
//         const { prompt } = req.body;
//         const image = req.file;
//         const userId = req.user?.id; 
//         if (!image) {
//             return res.status(400).json({ message: 'No image uploaded' });
//         }
//         if (!userId) {
//             return res.status(401).json({ message: 'User not authenticated' });
//         }
//         if (!prompt || prompt.trim() === '') {
//             return res.status(400).json({ 
//                 status: 'error',
//                 message: 'Prompt is required' 
//             });
//         }
//         const generatedImage = await AiImageService.transformImage(prompt, image, userId);
//         res.status(200).json({
//             status: 'success',
//             data: generatedImage,
//         });
//     });
//      static async getUserImages(req: Request, res: Response) {
//         try {
//             const userId = req.user?.id;
//             const page = parseInt(req.query.page as string) || 1;
//             const limit = parseInt(req.query.limit as string) || 4;
//             if (!userId) {
//                  res.status(401).json({
//                     success: false,
//                     message: "Unauthorized - User not authenticated"
//                 });
//                 return;
//             }
//             const result = await AiImageService.getUserImages(userId, page, limit);
//              res.status(200).json({
//                 success: true,
//                 message: "Images fetched successfully",
//                 data: result.images,
//                 pagination: result.pagination
//             });
//              return;
//         } catch (error: any) {
//             console.error("Error in getUserImages controller:", error);
//              res.status(500).json({
//                 success: false,
//                 message: "Failed to fetch images",
//                 error: error.message
//             });
//             return;
//         } 
//     }
//     static async getImageById(req: Request, res: Response) {
//         try {
//             const { id } = req.params;
//             const userId = req.user?.id;
//             if (!userId) {
//                  res.status(401).json({
//                     success: false,
//                     message: "Unauthorized - User not authenticated"
//                 });
//                 return;
//             }
//             const image = await AiImageService.getImageById(id, userId);
//              res.status(200).json({
//                 success: true,
//                 message: "Image fetched successfully",
//                 data: image
//             });
//            return;
//         } catch (error: any) {
//             console.error("Error in getImageById controller:", error);
//             if (error.message.includes("not found") || error.message.includes("access denied")) {
//                  res.status(404).json({
//                     success: false,
//                     message: error.message
//                 });
//                 return;
//             }
//              res.status(500).json({
//                 success: false,
//                 message: "Failed to fetch image",
//                 error: error.message
//             });
//             return;
//         }
//     }
//     static async updateImage(req: Request, res: Response) {
//         try {
//             const { id } = req.params;
//             const { prompt } = req.body;
//             const userId = req.user?.id;
//             if (!userId) {
//                  res.status(401).json({
//                     success: false,
//                     message: "Unauthorized - User not authenticated"
//                 });
//                 return;
//             }
//             if (!prompt) {
//                  res.status(400).json({
//                     success: false,
//                     message: "Prompt is required for update"
//                 });
//                 return;
//             }
//             const updated = await AiImageService.updateImage(id, userId, { prompt });
//              res.status(200).json({
//                 success: true,
//                 message: "Image regenerated successfully",
//                 data: updated
//             });
//             return;
//         } catch (error: any) {
//             console.error("Error in updateImage controller:", error);
//             if (error.message.includes("not found") || error.message.includes("access denied")) {
//                  res.status(404).json({
//                     success: false,
//                     message: error.message
//                 });
//                 return;
//             }
//              res.status(500).json({
//                 success: false,
//                 message: "Failed to update image",
//                 error: error.message
//             });
//             return;
//         }
//     }
//     static async deleteImage(req: Request, res: Response) {
//         try {
//             const { id } = req.params;
//             const userId = req.user?.id;
//             if (!userId) {
//                  res.status(401).json({
//                     success: false,
//                     message: "Unauthorized - User not authenticated"
//                 });
//                 return;
//             }
//             const result = await AiImageService.deleteImage(id, userId);
//              res.status(200).json({
//                 success: true,
//                 message: result.message,
//                 data: result
//             });
//             return;
//         } catch (error: any) {
//             console.error("Error in deleteImage controller:", error);
//             if (error.message.includes("not found") || error.message.includes("access denied")) {
//                  res.status(404).json({
//                     success: false,
//                     message: error.message
//                 });
//                 return;
//             }
//              res.status(500).json({
//                 success: false,
//                 message: "Failed to delete image",
//                 error: error.message
//             });
//             return;
//         }
//     }
//     static async getUserStats(req: Request, res: Response) {
//         try {
//             const userId = req.user?.id;
//             if (!userId) {
//                  res.status(401).json({
//                     success: false,
//                     message: "Unauthorized - User not authenticated"
//                 });
//                 return;
//             }
//             const stats = await AiImageService.getUserStats(userId);
//              res.status(200).json({
//                 success: true,
//                 message: "Stats fetched successfully",
//                 data: stats
//             });
//             return;
//         } catch (error: any) {
//             console.error("Error in getUserStats controller:", error);
//              res.status(500).json({
//                 success: false,
//                 message: "Failed to fetch stats",
//                 error: error.message
//             });
//             return;
//         }
//     }
// }
