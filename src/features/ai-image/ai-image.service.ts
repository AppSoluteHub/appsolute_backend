import { GoogleGenerativeAI } from '@google/generative-ai';
import cloudinary from '../../config/cloudinary';
import { prisma } from '../../utils/prisma';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Convert uploaded file to Gemini inlineData format
function fileToGenerativePart(filePath: string, mimeType: string) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType,
        },
    };
}

export class AiImageService {

    static async generateImage(prompt: string, image: Express.Multer.File, userId: string) {

        // Initialize Google Gemini client (0.24.1 syntax)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash" // remove "-latest" for compatibility
        });

        // Upload original
        const originalUpload = await cloudinary.uploader.upload(image.path, {
            folder: "ai-images/originals",
        });

        // Convert user-uploaded image into inlineData part
        const imagePart = fileToGenerativePart(image.path, image.mimetype);

        // Gemini request (OLD SYNTAX)
        const result = await model.generateContent([
            { text: prompt },
            imagePart
        ]);

        const response = result.response;
        if (!response) throw new Error("No response from Gemini.");

        // Extract generated image
        let generatedBase64: string | null = null;

        const parts = response.candidates?.[0]?.content?.parts || [];

        for (const part of parts) {
            if (part.inlineData?.data) {
                generatedBase64 = part.inlineData.data;
                break;
            }
        }

        if (!generatedBase64) {
            throw new Error("Gemini did not return generated image data.");
        }

        // Save generated image temp file
        const tempFile = path.join(process.cwd(), `generated_${Date.now()}.png`);
        fs.writeFileSync(tempFile, Buffer.from(generatedBase64, "base64"));

        // Upload generated image
        const generatedUpload = await cloudinary.uploader.upload(tempFile, {
            folder: "ai-images/generated",
        });

        // Clean up
        fs.unlinkSync(tempFile);
        fs.unlinkSync(image.path);

        // Save to DB
        const saved = await prisma.aiImage.create({
            data: {
                prompt,
                originalImageUrl: originalUpload.secure_url,
                generatedImageUrl: generatedUpload.secure_url,
                userId
            },
        });

        return saved;
    }
}
