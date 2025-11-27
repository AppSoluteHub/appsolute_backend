"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiImageService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const prisma_1 = require("../../utils/prisma");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const env = process.env;
// Helper function to convert a file to a GenerativePart
function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs_1.default.readFileSync(filePath)).toString('base64'),
            mimeType,
        },
    };
}
class AiImageService {
    static async generateImage(prompt, image, userId) {
        // 1. Initialize Google Generative AI
        const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        // 2. Upload original image to Cloudinary
        const originalUploadResult = await cloudinary_1.default.uploader.upload(image.path, {
            folder: 'ai-images/originals',
        });
        // 3. Prepare image for Gemini API
        const imagePart = fileToGenerativePart(image.path, image.mimetype);
        // 4. Generate image with Gemini
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let generatedImageUrl = '';
        if (response.candidates && response.candidates.length > 0) {
            for (const candidate of response.candidates) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        // If the response contains an image, save it temporarily and upload to Cloudinary
                        const buffer = Buffer.from(part.inlineData.data, 'base64');
                        const tempImagePath = path_1.default.join(process.cwd(), `temp_generated_image_${Date.now()}.png`);
                        fs_1.default.writeFileSync(tempImagePath, buffer);
                        const generatedUploadResult = await cloudinary_1.default.uploader.upload(tempImagePath, {
                            folder: 'ai-images/generated',
                        });
                        generatedImageUrl = generatedUploadResult.secure_url;
                        fs_1.default.unlinkSync(tempImagePath); // Clean up temporary file
                        break;
                    }
                }
                if (generatedImageUrl)
                    break;
            }
        }
        if (!generatedImageUrl) {
            throw new Error('Failed to generate image from Gemini API.');
        }
        // 5. Save to database
        const savedImage = await prisma_1.prisma.aiImage.create({
            data: {
                prompt,
                originalImageUrl: originalUploadResult.secure_url,
                generatedImageUrl,
                userId: userId,
            },
        });
        // Clean up the uploaded file by multer
        fs_1.default.unlinkSync(image.path);
        return savedImage;
    }
}
exports.AiImageService = AiImageService;
