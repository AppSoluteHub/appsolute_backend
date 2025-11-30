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
            console.log("Running Replicate model with prompt:", prompt);
            // Using SDXL img2img - handles ANY prompt (cartoon, oil painting, cyberpunk, etc.)
            const output = await replicate.run("stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", {
                input: {
                    image: dataUrl,
                    prompt: prompt, // User can say ANYTHING: "make it cartoon", "oil painting", "cyberpunk style", etc.
                    negative_prompt: "ugly, distorted, blurry, low quality, deformed, disfigured, bad anatomy",
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                    strength: 0.8, // 0.8 = strong transformation, 0.3 = subtle changes
                    seed: Math.floor(Math.random() * 1000000), // Random seed for variety
                }
            });
            console.log("Model completed. Output:", output);
            // Handle output (can be a URL or array of URLs)
            let imageUrl;
            if (Array.isArray(output)) {
                imageUrl = output[0];
            }
            else {
                imageUrl = output;
            }
            // Download the generated image
            const response = await (0, node_fetch_1.default)(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            // Save to temporary file
            const tempFile = path_1.default.join(process.cwd(), `generated_${Date.now()}.png`);
            fs_1.default.writeFileSync(tempFile, buffer);
            console.log("Generated image saved temporarily");
            // Upload generated image to Cloudinary
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
            console.error("Error in transformImage:", error);
            throw error;
        }
    }
}
exports.AiImageService = AiImageService;
