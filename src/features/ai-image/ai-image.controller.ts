
import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AiImageService } from './ai-image.service';




export class AiImageController {
    static generateImage = catchAsync(async (req: Request, res: Response) => {
        const { prompt } = req.body;
        const image = req.file;
        const userId = req.user?.id; 

        if (!image) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ 
                status: 'error',
                message: 'Prompt is required' 
            });
        }
        const generatedImage = await AiImageService.transformImage(prompt, image, userId);

        res.status(200).json({
            status: 'success',
            data: generatedImage,
        });
    });


     static async getUserImages(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 4;

            if (!userId) {
                 res.status(401).json({
                    success: false,
                    message: "Unauthorized - User not authenticated"
                });
                return;
            }

            const result = await AiImageService.getUserImages(userId, page, limit);

             res.status(200).json({
                success: true,
                message: "Images fetched successfully",
                data: result.images,
                pagination: result.pagination
            });
             return;
        } catch (error: any) {
            console.error("Error in getUserImages controller:", error);
             res.status(500).json({
                success: false,
                message: "Failed to fetch images",
                error: error.message
            });
            return;
        } 
    }

    static async getImageById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                 res.status(401).json({
                    success: false,
                    message: "Unauthorized - User not authenticated"
                });
                return;
            }

            const image = await AiImageService.getImageById(id, userId);

             res.status(200).json({
                success: true,
                message: "Image fetched successfully",
                data: image
            });
           return;
        } catch (error: any) {
            console.error("Error in getImageById controller:", error);
            
            if (error.message.includes("not found") || error.message.includes("access denied")) {
                 res.status(404).json({
                    success: false,
                    message: error.message
                });
                return;
            }

             res.status(500).json({
                success: false,
                message: "Failed to fetch image",
                error: error.message
            });
            return;
        }
    }

    static async updateImage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { prompt } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                 res.status(401).json({
                    success: false,
                    message: "Unauthorized - User not authenticated"
                });
                return;
            }

            if (!prompt) {
                 res.status(400).json({
                    success: false,
                    message: "Prompt is required for update"
                });
                return;
            }

            const updated = await AiImageService.updateImage(id, userId, { prompt });

             res.status(200).json({
                success: true,
                message: "Image regenerated successfully",
                data: updated
            });
            return;

        } catch (error: any) {
            console.error("Error in updateImage controller:", error);

            if (error.message.includes("not found") || error.message.includes("access denied")) {
                 res.status(404).json({
                    success: false,
                    message: error.message
                });
                return;
            }

             res.status(500).json({
                success: false,
                message: "Failed to update image",
                error: error.message
            });
            return;
        }
    }

    static async deleteImage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                 res.status(401).json({
                    success: false,
                    message: "Unauthorized - User not authenticated"
                });
                return;
            }

            const result = await AiImageService.deleteImage(id, userId);

             res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
            return;

        } catch (error: any) {
            console.error("Error in deleteImage controller:", error);

            if (error.message.includes("not found") || error.message.includes("access denied")) {
                 res.status(404).json({
                    success: false,
                    message: error.message
                });
                return;
            }

             res.status(500).json({
                success: false,
                message: "Failed to delete image",
                error: error.message
            });
            return;
        }
    }

    static async getUserStats(req: Request, res: Response) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                 res.status(401).json({
                    success: false,
                    message: "Unauthorized - User not authenticated"
                });
                return;
            }

            const stats = await AiImageService.getUserStats(userId);

             res.status(200).json({
                success: true,
                message: "Stats fetched successfully",
                data: stats
            });
            return;

        } catch (error: any) {
            console.error("Error in getUserStats controller:", error);
             res.status(500).json({
                success: false,
                message: "Failed to fetch stats",
                error: error.message
            });
            return;
        }
    }
}
