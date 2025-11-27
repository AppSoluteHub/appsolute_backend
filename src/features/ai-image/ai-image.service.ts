import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import cloudinary from '../../config/cloudinary';
import { prisma } from '../../utils/prisma';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const env = process.env;

// Helper function to convert a file to a GenerativePart
function fileToGenerativePart(filePath: string, mimeType: string) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
            mimeType,
        },
    };
}

export class AiImageService {
    static async generateImage(prompt: string, image: Express.Multer.File, userId: string) {
        // 1. Initialize Google Generative AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // 2. Upload original image to Cloudinary
        const originalUploadResult = await cloudinary.uploader.upload(image.path, {
            folder: 'ai-images/originals',
        });

        // 3. Prepare image for Gemini API
        const imagePart = fileToGenerativePart(image.path, image.mimetype);

        // 4. Generate image with Gemini
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        
        let generatedImageUrl: string = '';
        if (response.candidates && response.candidates.length > 0) {
            for (const candidate of response.candidates) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        // If the response contains an image, save it temporarily and upload to Cloudinary
                        const buffer = Buffer.from(part.inlineData.data, 'base64');
                        const tempImagePath = path.join(process.cwd(), `temp_generated_image_${Date.now()}.png`);
                        fs.writeFileSync(tempImagePath, buffer);

                        const generatedUploadResult = await cloudinary.uploader.upload(tempImagePath, {
                            folder: 'ai-images/generated',
                        });
                        generatedImageUrl = generatedUploadResult.secure_url;
                        fs.unlinkSync(tempImagePath); // Clean up temporary file
                        break;
                    }
                }
                if (generatedImageUrl) break;
            }
        }

        if (!generatedImageUrl) {
            throw new Error('Failed to generate image from Gemini API.');
        }

        // 5. Save to database
        const savedImage = await prisma.aiImage.create({
            data: {
                prompt,
                originalImageUrl: originalUploadResult.secure_url,
                generatedImageUrl,
                userId: userId,
            },
        });
        
        // Clean up the uploaded file by multer
        fs.unlinkSync(image.path);

        return savedImage;
    }
}