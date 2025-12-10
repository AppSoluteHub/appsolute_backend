"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiImageService = void 0;
const replicate_1 = __importDefault(require("replicate"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const prisma_1 = require("../../utils/prisma");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const appError_1 = require("../../lib/appError");
dotenv_1.default.config();
class AiImageService {
    static async transformImage(prompt, image, userId) {
        try {
            // Initialize Replicate
            const replicate = new replicate_1.default({
                auth: process.env.REPLICATE_API_TOKEN,
            });
            // Upload original image to Cloudinary
            const originalUpload = await cloudinary_1.default.uploader.upload(image.path, {
                folder: "ai-images/originals",
            });
            console.log("Original image uploaded to Cloudinary");
            // Convert uploaded image to base64 data URL for Replicate
            const imageBuffer = fs_1.default.readFileSync(image.path);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = image.mimetype || 'image/jpeg';
            const dataUrl = `data:${mimeType};base64,${base64Image}`;
            const output = await replicate.run("stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", {
                input: {
                    image: dataUrl,
                    prompt: prompt,
                    negative_prompt: "ugly, distorted, blurry, low quality, deformed, disfigured, bad anatomy",
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                    strength: 0.8,
                    seed: Math.floor(Math.random() * 1000000),
                }
            });
            let imageUrl;
            if (Array.isArray(output)) {
                imageUrl = output[0];
            }
            else {
                imageUrl = output;
            }
            const response = await (0, node_fetch_1.default)(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const tempFile = path_1.default.join(process.cwd(), `generated_${Date.now()}.png`);
            fs_1.default.writeFileSync(tempFile, buffer);
            console.log("Generated image saved temporarily");
            const generatedUpload = await cloudinary_1.default.uploader.upload(tempFile, {
                folder: "ai-images/generated",
            });
            console.log("Generated image uploaded to Cloudinary");
            // Clean up temporary files
            fs_1.default.unlinkSync(tempFile);
            fs_1.default.unlinkSync(image.path);
            // Save to database
            const saved = await prisma_1.prisma.aiImage.create({
                data: {
                    prompt,
                    originalImageUrl: originalUpload.secure_url,
                    generatedImageUrl: generatedUpload.secure_url,
                    userId
                },
            });
            return saved;
        }
        catch (error) {
            // Clean up uploaded file in case of error
            if (fs_1.default.existsSync(image.path)) {
                fs_1.default.unlinkSync(image.path);
            }
            if (error.message?.includes("NSFW content detected")) {
                console.warn("NSFW content detected for prompt:", prompt);
                throw new appError_1.BadRequestError("The prompt or generated content was flagged as NSFW. Please modify your prompt and try again.");
            }
            console.error("Error in transformImage:", error);
            throw error;
        }
    }
    static async getUserImages(userId, page, limit) {
        try {
            const skip = (page - 1) * limit;
            const [images, total] = await Promise.all([
                prisma_1.prisma.aiImage.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma_1.prisma.aiImage.count({ where: { userId } })
            ]);
            return {
                images,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            console.error("Error fetching user images:", error);
            throw error;
        }
    }
    static async getImageById(imageId, userId) {
        try {
            const image = await prisma_1.prisma.aiImage.findFirst({
                where: {
                    id: imageId,
                    userId
                }
            });
            if (!image) {
                throw new Error("Image not found or access denied");
            }
            return image;
        }
        catch (error) {
            console.error("Error fetching image by ID:", error);
            throw error;
        }
    }
    static async updateImage(imageId, userId, data) {
        try {
            // Verify ownership and get existing image
            const existing = await prisma_1.prisma.aiImage.findFirst({
                where: { id: imageId, userId }
            });
            if (!existing) {
                throw new Error("Image not found or access denied");
            }
            if (!data.prompt) {
                throw new Error("Prompt is required for update");
            }
            // Initialize Replicate
            const replicate = new replicate_1.default({
                auth: process.env.REPLICATE_API_TOKEN,
            });
            // Download original image from Cloudinary
            const imageResponse = await (0, node_fetch_1.default)(existing.originalImageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const buffer = Buffer.from(imageBuffer);
            // Convert to base64 data URL
            const base64Image = buffer.toString('base64');
            const dataUrl = `data:image/jpeg;base64,${base64Image}`;
            // Generate new image with updated prompt
            const output = await replicate.run("stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", {
                input: {
                    image: dataUrl,
                    prompt: data.prompt,
                    negative_prompt: "ugly, distorted, blurry, low quality, deformed, disfigured, bad anatomy",
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                    strength: 0.8,
                    seed: Math.floor(Math.random() * 1000000),
                }
            });
            let imageUrl;
            if (Array.isArray(output)) {
                imageUrl = output[0];
            }
            else {
                imageUrl = output;
            }
            // Download new generated image
            const newImageResponse = await (0, node_fetch_1.default)(imageUrl);
            const newArrayBuffer = await newImageResponse.arrayBuffer();
            const newBuffer = Buffer.from(newArrayBuffer);
            const tempFile = path_1.default.join(process.cwd(), `updated_${Date.now()}.png`);
            fs_1.default.writeFileSync(tempFile, newBuffer);
            // Upload new generated image to Cloudinary
            const newGeneratedUpload = await cloudinary_1.default.uploader.upload(tempFile, {
                folder: "ai-images/generated",
            });
            // Delete old generated image from Cloudinary
            const extractPublicId = (url) => {
                const parts = url.split('/');
                const filename = parts[parts.length - 1];
                const folder = parts[parts.length - 2];
                return `ai-images/${folder}/${filename.split('.')[0]}`;
            };
            await cloudinary_1.default.uploader.destroy(extractPublicId(existing.generatedImageUrl));
            // Clean up temp file
            fs_1.default.unlinkSync(tempFile);
            // Update database with new generated image URL and prompt
            const updated = await prisma_1.prisma.aiImage.update({
                where: { id: imageId },
                data: {
                    prompt: data.prompt,
                    generatedImageUrl: newGeneratedUpload.secure_url,
                }
            });
            return updated;
        }
        catch (error) {
            console.error("Error updating image:", error);
            throw error;
        }
    }
    static async deleteImage(imageId, userId) {
        try {
            // Verify ownership
            const image = await prisma_1.prisma.aiImage.findFirst({
                where: { id: imageId, userId }
            });
            if (!image) {
                throw new Error("Image not found or access denied");
            }
            // Extract public IDs from Cloudinary URLs
            const extractPublicId = (url) => {
                const parts = url.split('/');
                const filename = parts[parts.length - 1];
                const folder = parts[parts.length - 2];
                return `ai-images/${folder}/${filename.split('.')[0]}`;
            };
            await Promise.all([
                cloudinary_1.default.uploader.destroy(extractPublicId(image.originalImageUrl)),
                cloudinary_1.default.uploader.destroy(extractPublicId(image.generatedImageUrl))
            ]);
            await prisma_1.prisma.aiImage.delete({
                where: { id: imageId }
            });
            return { success: true, message: "Image deleted successfully" };
        }
        catch (error) {
            console.error("Error deleting image:", error);
            throw error;
        }
    }
    static async getUserStats(userId) {
        try {
            const totalImages = await prisma_1.prisma.aiImage.count({
                where: { userId }
            });
            const recentImages = await prisma_1.prisma.aiImage.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    prompt: true,
                    createdAt: true,
                    generatedImageUrl: true
                }
            });
            return {
                totalImages,
                recentImages
            };
        }
        catch (error) {
            console.error("Error fetching user stats:", error);
            throw error;
        }
    }
}
exports.AiImageService = AiImageService;
