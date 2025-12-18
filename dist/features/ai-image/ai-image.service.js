"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiImageService = void 0;
const openai_1 = require("openai");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const prisma_1 = require("../../utils/prisma");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
dotenv_1.default.config();
class AiImageService {
    //  Fast async response
    static async transformImageAsync(prompt, image, userId) {
        try {
            const originalUpload = await cloudinary_1.default.uploader.upload(image.path, {
                folder: "ai-images/originals",
            });
            const pending = await prisma_1.prisma.aiImage.create({
                data: {
                    prompt,
                    originalImageUrl: originalUpload.secure_url,
                    generatedImageUrl: null,
                    status: "processing",
                    userId,
                },
            });
            // Clean up uploaded file
            if (fs_1.default.existsSync(image.path)) {
                fs_1.default.unlinkSync(image.path);
            }
            this.processImageInBackground(pending.id, prompt, originalUpload.secure_url).catch((err) => {
                console.error("Background processing error:", err);
                // Update status to failed
                prisma_1.prisma.aiImage
                    .update({
                    where: { id: pending.id },
                    data: { status: "failed" },
                })
                    .catch((updateErr) => console.error("Failed to update status to failed:", updateErr));
            });
            return pending;
        }
        catch (error) {
            // Clean up uploaded file on error
            if (fs_1.default.existsSync(image.path)) {
                fs_1.default.unlinkSync(image.path);
            }
            console.error("Error in transformImageAsync:", error);
            throw error;
        }
    }
    // Background processing method
    static async processImageInBackground(imageId, prompt, originalUrl) {
        let tempFile = null;
        let originalTempPath = null;
        try {
            const openai = new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            // Download original from Cloudinary
            const imageResponse = await (0, node_fetch_1.default)(originalUrl);
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            originalTempPath = path_1.default.join(process.cwd(), `original_${Date.now()}.png`);
            fs_1.default.writeFileSync(originalTempPath, imageBuffer);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);
            const response = await openai.images.edit({
                model: "gpt-image-1",
                image: await (0, openai_1.toFile)(fs_1.default.createReadStream(originalTempPath), "image.png", {
                    type: "image/png",
                }),
                prompt,
                size: "1024x1024",
                n: 1,
            }, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.data || response.data.length === 0) {
                throw new Error("No data returned from OpenAI");
            }
            const imageBase64 = response.data[0].b64_json;
            if (!imageBase64)
                throw new Error("No image data returned from OpenAI");
            tempFile = path_1.default.join(process.cwd(), `generated_${Date.now()}.png`);
            fs_1.default.writeFileSync(tempFile, Buffer.from(imageBase64, "base64"));
            console.log(`Uploading generated image to Cloudinary for ${imageId}`);
            // Upload generated image
            const generatedUpload = await cloudinary_1.default.uploader.upload(tempFile, {
                folder: "ai-images/generated",
            });
            console.log(`Image processing completed for ${imageId}`);
            // Update database with generated image
            await prisma_1.prisma.aiImage.update({
                where: { id: imageId },
                data: {
                    generatedImageUrl: generatedUpload.secure_url,
                    status: "completed",
                },
            });
            // Clean up
            if (originalTempPath && fs_1.default.existsSync(originalTempPath)) {
                fs_1.default.unlinkSync(originalTempPath);
            }
            if (tempFile && fs_1.default.existsSync(tempFile)) {
                fs_1.default.unlinkSync(tempFile);
            }
            console.log(`Cleanup completed for ${imageId}`);
        }
        catch (error) {
            console.error(`Background processing error for ${imageId}:`, error);
            // Update to failed status
            await prisma_1.prisma.aiImage
                .update({
                where: { id: imageId },
                data: {
                    status: "failed",
                    generatedImageUrl: null,
                },
            })
                .catch((updateErr) => console.error("Failed to update status to failed:", updateErr));
            // Clean up on error
            if (originalTempPath && fs_1.default.existsSync(originalTempPath)) {
                fs_1.default.unlinkSync(originalTempPath);
            }
            if (tempFile && fs_1.default.existsSync(tempFile)) {
                fs_1.default.unlinkSync(tempFile);
            }
        }
    }
    static async getImageStatus(imageId, userId) {
        try {
            const image = await prisma_1.prisma.aiImage.findFirst({
                where: {
                    id: imageId,
                    userId,
                },
            });
            if (!image) {
                throw new Error("Image not found or access denied");
            }
            return image;
        }
        catch (error) {
            console.error("Error fetching image status:", error);
            throw error;
        }
    }
    // Get user images with optional status filter
    static async getUserImages(userId, page, limit, status) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (status) {
            where.status = status;
        }
        const [images, total] = await Promise.all([
            prisma_1.prisma.aiImage.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma_1.prisma.aiImage.count({ where }),
        ]);
        return {
            images,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async getImageById(imageId, userId) {
        const image = await prisma_1.prisma.aiImage.findFirst({
            where: { id: imageId, userId },
        });
        if (!image)
            throw new Error("Image not found or access denied");
        return image;
    }
    static async updateImageAsync(imageId, userId, data) {
        try {
            const existing = await prisma_1.prisma.aiImage.findFirst({
                where: { id: imageId, userId },
            });
            if (!existing)
                throw new Error("Image not found or access denied");
            if (!data.prompt)
                throw new Error("Prompt is required for update");
            // Update to processing status
            const updated = await prisma_1.prisma.aiImage.update({
                where: { id: imageId },
                data: {
                    prompt: data.prompt,
                    status: "processing",
                },
            });
            // Process in background
            this.updateImageInBackground(imageId, data.prompt, existing.originalImageUrl, existing.generatedImageUrl).catch((err) => {
                console.error("Background update error:", err);
                prisma_1.prisma.aiImage
                    .update({
                    where: { id: imageId },
                    data: { status: "failed" },
                })
                    .catch((updateErr) => console.error("Failed to update status to failed:", updateErr));
            });
            return updated;
        }
        catch (error) {
            console.error("Error in updateImageAsync:", error);
            throw error;
        }
    }
    static async updateImageInBackground(imageId, prompt, originalUrl, oldGeneratedUrl) {
        let tempFile = null;
        let originalTempPath = null;
        try {
            console.log(`Starting background update for image ${imageId}`);
            const openai = new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            // Download original
            const imageResponse = await (0, node_fetch_1.default)(originalUrl);
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            originalTempPath = path_1.default.join(process.cwd(), `original_${Date.now()}.png`);
            fs_1.default.writeFileSync(originalTempPath, imageBuffer);
            // OpenAI processing
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);
            const response = await openai.images.edit({
                model: "gpt-image-1",
                image: await (0, openai_1.toFile)(fs_1.default.createReadStream(originalTempPath), "image.png", {
                    type: "image/png",
                }),
                prompt,
                size: "1024x1024",
                n: 1,
            }, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.data || response.data.length === 0) {
                throw new Error("No data returned from OpenAI");
            }
            const imageBase64 = response.data[0].b64_json;
            if (!imageBase64)
                throw new Error("No image data returned from OpenAI");
            tempFile = path_1.default.join(process.cwd(), `updated_${Date.now()}.png`);
            fs_1.default.writeFileSync(tempFile, Buffer.from(imageBase64, "base64"));
            // Upload to Cloudinary
            const newGeneratedUpload = await cloudinary_1.default.uploader.upload(tempFile, {
                folder: "ai-images/generated",
            });
            // Delete old generated image from Cloudinary
            if (oldGeneratedUrl) {
                const extractPublicId = (url) => {
                    const parts = url.split("/");
                    const filename = parts[parts.length - 1];
                    const folder = parts[parts.length - 2];
                    return `ai-images/${folder}/${filename.split(".")[0]}`;
                };
                await cloudinary_1.default.uploader
                    .destroy(extractPublicId(oldGeneratedUrl))
                    .catch((err) => console.error("Failed to delete old image from Cloudinary:", err));
            }
            // Update DB
            await prisma_1.prisma.aiImage.update({
                where: { id: imageId },
                data: {
                    generatedImageUrl: newGeneratedUpload.secure_url,
                    status: "completed",
                },
            });
            // Clean up
            if (originalTempPath && fs_1.default.existsSync(originalTempPath)) {
                fs_1.default.unlinkSync(originalTempPath);
            }
            if (tempFile && fs_1.default.existsSync(tempFile)) {
                fs_1.default.unlinkSync(tempFile);
            }
            console.log(`Update completed for ${imageId}`);
        }
        catch (error) {
            console.error(`Background update error for ${imageId}:`, error);
            await prisma_1.prisma.aiImage
                .update({
                where: { id: imageId },
                data: { status: "failed" },
            })
                .catch((updateErr) => console.error("Failed to update status to failed:", updateErr));
            // Clean up on error
            if (originalTempPath && fs_1.default.existsSync(originalTempPath)) {
                fs_1.default.unlinkSync(originalTempPath);
            }
            if (tempFile && fs_1.default.existsSync(tempFile)) {
                fs_1.default.unlinkSync(tempFile);
            }
        }
    }
    static async deleteImage(imageId, userId) {
        const image = await prisma_1.prisma.aiImage.findFirst({
            where: { id: imageId, userId },
        });
        if (!image)
            throw new Error("Image not found or access denied");
        const extractPublicId = (url) => {
            const parts = url.split("/");
            const filename = parts[parts.length - 1];
            const folder = parts[parts.length - 2];
            return `ai-images/${folder}/${filename.split(".")[0]}`;
        };
        const deletePromises = [
            cloudinary_1.default.uploader.destroy(extractPublicId(image.originalImageUrl)),
        ];
        // Only delete generated image if it exists
        if (image.generatedImageUrl) {
            deletePromises.push(cloudinary_1.default.uploader.destroy(extractPublicId(image.generatedImageUrl)));
        }
        await Promise.all(deletePromises);
        await prisma_1.prisma.aiImage.delete({ where: { id: imageId } });
        return { success: true, message: "Image deleted successfully" };
    }
    static async getUserStats(userId) {
        const [totalImages, processingCount, completedCount, failedCount] = await Promise.all([
            prisma_1.prisma.aiImage.count({ where: { userId } }),
            prisma_1.prisma.aiImage.count({ where: { userId, status: "processing" } }),
            prisma_1.prisma.aiImage.count({ where: { userId, status: "completed" } }),
            prisma_1.prisma.aiImage.count({ where: { userId, status: "failed" } }),
        ]);
        const recentImages = await prisma_1.prisma.aiImage.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                prompt: true,
                createdAt: true,
                generatedImageUrl: true,
                status: true,
            },
        });
        return {
            totalImages,
            processingCount,
            completedCount,
            failedCount,
            recentImages,
        };
    }
}
exports.AiImageService = AiImageService;
