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
const appError_1 = require("../../lib/appError");
const sharp_1 = __importDefault(require("sharp"));
dotenv_1.default.config();
class AiImageService {
    // Helper to check if it's a deterministic edit (use Sharp instead of AI)
    static isDeterministicEdit(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        const deterministicKeywords = ['add star', 'add watermark', 'add border', 'add text'];
        return deterministicKeywords.some(keyword => lowerPrompt.includes(keyword));
    }
    static async transformImage(prompt, image, userId) {
        let tempFile = null;
        let resizedFile = null;
        let convertedFile = null;
        try {
            const openai = new openai_1.OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            // Upload original to Cloudinary
            const originalUpload = await cloudinary_1.default.uploader.upload(image.path, {
                folder: "ai-images/originals",
            });
            console.log("Original image uploaded to Cloudinary");
            let generatedImagePath = '';
            // Check if this is a deterministic edit (perfect preservation with Sharp)
            if (this.isDeterministicEdit(prompt)) {
                console.log("Using Sharp for deterministic overlay");
                const lowerPrompt = prompt.toLowerCase();
                if (lowerPrompt.includes('star')) {
                    generatedImagePath = await this.addStarsToImage(image.path);
                }
                else {
                    throw new Error("Deterministic edit type not yet implemented");
                }
                tempFile = generatedImagePath;
            }
            else {
                // Use OpenAI gpt-image-1 for AI-powered edits
                console.log("Using OpenAI gpt-image-1 for AI transformation");
                // STEP 1: Convert to PNG first (fixes MIME type issue)
                convertedFile = path_1.default.join(process.cwd(), `converted_${Date.now()}.png`);
                await (0, sharp_1.default)(image.path)
                    .png()
                    .toFile(convertedFile);
                console.log("Image converted to PNG");
                // STEP 2: Resize to 1024x1024
                resizedFile = path_1.default.join(process.cwd(), `resized_${Date.now()}.png`);
                await (0, sharp_1.default)(convertedFile)
                    .resize(1024, 1024, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                    .png()
                    .toFile(resizedFile);
                console.log("Image resized to 1024x1024");
                // Clean up converted file
                if (convertedFile && fs_1.default.existsSync(convertedFile)) {
                    fs_1.default.unlinkSync(convertedFile);
                    convertedFile = null;
                }
                // Create abort controller for timeout (30 seconds)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);
                try {
                    // ALWAYS use edit (never generate) for image-to-image
                    const response = await openai.images.edit({
                        model: "gpt-image-1",
                        image: fs_1.default.createReadStream(resizedFile),
                        prompt: prompt,
                        size: "1024x1024",
                        n: 1,
                    });
                    clearTimeout(timeoutId);
                    if (!response.data || response.data.length === 0) {
                        throw new Error("No data returned from OpenAI");
                    }
                    const imageUrl = response.data[0].url;
                    if (!imageUrl) {
                        throw new Error("No image URL returned from OpenAI");
                    }
                    const imageResponse = await (0, node_fetch_1.default)(imageUrl);
                    if (!imageResponse.ok) {
                        throw new Error(`Failed to download image: ${imageResponse.statusText}`);
                    }
                    const arrayBuffer = await imageResponse.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    tempFile = path_1.default.join(process.cwd(), `generated_${Date.now()}.png`);
                    fs_1.default.writeFileSync(tempFile, buffer);
                    generatedImagePath = tempFile;
                }
                catch (abortError) {
                    clearTimeout(timeoutId);
                    if (abortError instanceof Error && abortError.name === 'AbortError') {
                        throw new Error("OpenAI request timed out after 30 seconds");
                    }
                    throw abortError;
                }
                // Clean up resized file
                if (resizedFile && fs_1.default.existsSync(resizedFile)) {
                    fs_1.default.unlinkSync(resizedFile);
                    resizedFile = null;
                }
            }
            console.log("Generated image ready");
            if (!generatedImagePath) {
                throw new Error("Failed to generate image");
            }
            // Upload to Cloudinary
            const generatedUpload = await cloudinary_1.default.uploader.upload(generatedImagePath, {
                folder: "ai-images/generated",
            });
            console.log("Generated image uploaded to Cloudinary");
            // Clean up
            if (tempFile && fs_1.default.existsSync(tempFile)) {
                fs_1.default.unlinkSync(tempFile);
            }
            if (fs_1.default.existsSync(image.path)) {
                fs_1.default.unlinkSync(image.path);
            }
            tempFile = null;
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
            // Handle OpenAI safety/moderation errors
            if (error?.status === 400) {
                if (error?.message?.includes("safety") ||
                    error?.message?.includes("content_policy") ||
                    error?.message?.includes("violated")) {
                    console.warn("Content policy violation for prompt:", prompt);
                    throw new appError_1.BadRequestError("This image or prompt violates content policy. Please try a different prompt or image.");
                }
            }
            // Handle rate limiting
            if (error?.status === 429) {
                console.error("OpenAI rate limit hit");
                throw new appError_1.BadRequestError("Too many requests. Please try again in a moment.");
            }
            // Cleanup all temp files
            if (fs_1.default.existsSync(image.path)) {
                try {
                    fs_1.default.unlinkSync(image.path);
                }
                catch (cleanupError) {
                    console.error("Error cleaning up uploaded file:", cleanupError);
                }
            }
            if (tempFile && fs_1.default.existsSync(tempFile)) {
                try {
                    fs_1.default.unlinkSync(tempFile);
                }
                catch (cleanupError) {
                    console.error("Error cleaning up temp file:", cleanupError);
                }
            }
            if (resizedFile && fs_1.default.existsSync(resizedFile)) {
                try {
                    fs_1.default.unlinkSync(resizedFile);
                }
                catch (cleanupError) {
                    console.error("Error cleaning up resized file:", cleanupError);
                }
            }
            if (convertedFile && fs_1.default.existsSync(convertedFile)) {
                try {
                    fs_1.default.unlinkSync(convertedFile);
                }
                catch (cleanupError) {
                    console.error("Error cleaning up converted file:", cleanupError);
                }
            }
            console.error("Error in transformImage:", error);
            throw error;
        }
    }
    // Helper for star overlay using Sharp (deterministic, perfect preservation)
    static async addStarsToImage(imagePath) {
        const outputPath = path_1.default.join(process.cwd(), `stars_${Date.now()}.png`);
        const image = (0, sharp_1.default)(imagePath);
        const metadata = await image.metadata();
        const composites = [];
        const numStars = 10 + Math.floor(Math.random() * 15);
        for (let i = 0; i < numStars; i++) {
            const x = Math.floor(Math.random() * metadata.width);
            const y = Math.floor(Math.random() * metadata.height);
            const size = 20 + Math.floor(Math.random() * 40);
            const starSvg = Buffer.from(`
                <svg width="${size}" height="${size}">
                    <polygon points="${size / 2},${size * 0.1} ${size * 0.61},${size * 0.35} ${size * 0.88},${size * 0.35} ${size * 0.67},${size * 0.52} ${size * 0.75},${size * 0.8} ${size / 2},${size * 0.62} ${size * 0.25},${size * 0.8} ${size * 0.33},${size * 0.52} ${size * 0.12},${size * 0.35} ${size * 0.39},${size * 0.35}" 
                             fill="rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})" 
                             stroke="rgba(255, 215, 0, 0.9)" 
                             stroke-width="1"/>
                </svg>
            `);
            composites.push({ input: starSvg, top: y, left: x });
        }
        await image.composite(composites).toFile(outputPath);
        return outputPath;
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
        let tempFile = null;
        let resizedFile = null;
        let originalTempPath = null;
        let convertedFile = null;
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
            const openai = new openai_1.OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            // Download original image from Cloudinary
            const imageResponse = await (0, node_fetch_1.default)(existing.originalImageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const buffer = Buffer.from(imageBuffer);
            // Save to temp file
            originalTempPath = path_1.default.join(process.cwd(), `original_${Date.now()}.png`);
            fs_1.default.writeFileSync(originalTempPath, buffer);
            let generatedImagePath = '';
            // Check if deterministic edit
            if (this.isDeterministicEdit(data.prompt)) {
                console.log("Using Sharp for deterministic overlay");
                const lowerPrompt = data.prompt.toLowerCase();
                if (lowerPrompt.includes('star')) {
                    generatedImagePath = await this.addStarsToImage(originalTempPath);
                }
                else {
                    throw new Error("Deterministic edit type not yet implemented");
                }
                tempFile = generatedImagePath;
            }
            else {
                // STEP 1: Convert to PNG first
                convertedFile = path_1.default.join(process.cwd(), `converted_${Date.now()}.png`);
                await (0, sharp_1.default)(originalTempPath)
                    .png()
                    .toFile(convertedFile);
                console.log("Image converted to PNG");
                // STEP 2: Resize to 1024x1024
                resizedFile = path_1.default.join(process.cwd(), `resized_${Date.now()}.png`);
                await (0, sharp_1.default)(convertedFile)
                    .resize(1024, 1024, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                    .png()
                    .toFile(resizedFile);
                console.log("Image resized to 1024x1024");
                // Clean up converted file
                if (convertedFile && fs_1.default.existsSync(convertedFile)) {
                    fs_1.default.unlinkSync(convertedFile);
                    convertedFile = null;
                }
                // Create timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);
                try {
                    // Use OpenAI edit
                    const response = await openai.images.edit({
                        model: "gpt-image-1",
                        image: fs_1.default.createReadStream(resizedFile),
                        prompt: data.prompt,
                        size: "1024x1024",
                        n: 1,
                    });
                    clearTimeout(timeoutId);
                    if (!response.data || response.data.length === 0) {
                        throw new Error("No data returned from OpenAI");
                    }
                    const imageUrl = response.data[0].url;
                    if (!imageUrl) {
                        throw new Error("No image URL returned from OpenAI");
                    }
                    const newImageResponse = await (0, node_fetch_1.default)(imageUrl);
                    const newArrayBuffer = await newImageResponse.arrayBuffer();
                    const newBuffer = Buffer.from(newArrayBuffer);
                    tempFile = path_1.default.join(process.cwd(), `updated_${Date.now()}.png`);
                    fs_1.default.writeFileSync(tempFile, newBuffer);
                    generatedImagePath = tempFile;
                }
                catch (abortError) {
                    clearTimeout(timeoutId);
                    if (abortError instanceof Error && abortError.name === 'AbortError') {
                        throw new Error("OpenAI request timed out after 30 seconds");
                    }
                    throw abortError;
                }
                // Clean up resized file
                if (resizedFile && fs_1.default.existsSync(resizedFile)) {
                    fs_1.default.unlinkSync(resizedFile);
                    resizedFile = null;
                }
            }
            // Clean up original temp
            if (originalTempPath && fs_1.default.existsSync(originalTempPath)) {
                fs_1.default.unlinkSync(originalTempPath);
                originalTempPath = null;
            }
            if (!generatedImagePath) {
                throw new Error("Failed to generate image");
            }
            // Upload new generated image to Cloudinary
            const newGeneratedUpload = await cloudinary_1.default.uploader.upload(generatedImagePath, {
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
            if (tempFile && fs_1.default.existsSync(tempFile)) {
                fs_1.default.unlinkSync(tempFile);
                tempFile = null;
            }
            // Update database
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
            // Handle safety errors
            if (error?.status === 400 &&
                (error?.message?.includes("safety") || error?.message?.includes("content_policy"))) {
                throw new appError_1.BadRequestError("This image or prompt violates content policy. Please try a different prompt.");
            }
            // Cleanup
            if (tempFile && fs_1.default.existsSync(tempFile)) {
                try {
                    fs_1.default.unlinkSync(tempFile);
                }
                catch (cleanupError) {
                    console.error("Error cleaning up temp file:", cleanupError);
                }
            }
            if (resizedFile && fs_1.default.existsSync(resizedFile)) {
                try {
                    fs_1.default.unlinkSync(resizedFile);
                }
                catch (cleanupError) {
                    console.error("Error cleaning up resized file:", cleanupError);
                }
            }
            if (originalTempPath && fs_1.default.existsSync(originalTempPath)) {
                try {
                    fs_1.default.unlinkSync(originalTempPath);
                }
                catch (cleanupError) {
                    console.error("Error cleaning up original temp file:", cleanupError);
                }
            }
            if (convertedFile && fs_1.default.existsSync(convertedFile)) {
                try {
                    fs_1.default.unlinkSync(convertedFile);
                }
                catch (cleanupError) {
                    console.error("Error cleaning up converted file:", cleanupError);
                }
            }
            console.error("Error updating image:", error);
            throw error;
        }
    }
    static async deleteImage(imageId, userId) {
        try {
            const image = await prisma_1.prisma.aiImage.findFirst({
                where: { id: imageId, userId }
            });
            if (!image) {
                throw new Error("Image not found or access denied");
            }
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
