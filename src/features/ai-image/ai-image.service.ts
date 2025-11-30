import Replicate from 'replicate';
import cloudinary from '../../config/cloudinary';
import { prisma } from '../../utils/prisma';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export class AiImageService {

    static async transformImage(prompt: string, image: Express.Multer.File, userId: string) {
        try {
            // Initialize Replicate
            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_TOKEN,
            });

            // Upload original image to Cloudinary
            const originalUpload = await cloudinary.uploader.upload(image.path, {
                folder: "ai-images/originals",
            });

            console.log("Original image uploaded to Cloudinary");

            // Convert uploaded image to base64 data URL for Replicate
            const imageBuffer = fs.readFileSync(image.path);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = image.mimetype || 'image/jpeg';
            const dataUrl = `data:${mimeType};base64,${base64Image}`;

            console.log("Running Replicate model with prompt:", prompt);

            // Using SDXL img2img - handles ANY prompt (cartoon, oil painting, cyberpunk, etc.)
            const output = await replicate.run(
                "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
                {
                    input: {
                        image: dataUrl,
                        prompt: prompt, // User can say ANYTHING: "make it cartoon", "oil painting", "cyberpunk style", etc.
                        negative_prompt: "ugly, distorted, blurry, low quality, deformed, disfigured, bad anatomy",
                        num_inference_steps: 30,
                        guidance_scale: 7.5,
                        strength: 0.8, // 0.8 = strong transformation, 0.3 = subtle changes
                        seed: Math.floor(Math.random() * 1000000), // Random seed for variety
                    }
                }
            );

            console.log("Model completed. Output:", output);

            // Handle output (can be a URL or array of URLs)
            let imageUrl: string;
            if (Array.isArray(output)) {
                imageUrl = output[0] as string;
            } else {
                imageUrl = output as any;
            }

            // Download the generated image
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Save to temporary file
            const tempFile = path.join(process.cwd(), `generated_${Date.now()}.png`);
            fs.writeFileSync(tempFile, buffer);

            console.log("Generated image saved temporarily");

            // Upload generated image to Cloudinary
            const generatedUpload = await cloudinary.uploader.upload(tempFile, {
                folder: "ai-images/generated",
            });

            console.log("Generated image uploaded to Cloudinary");

            // Clean up temporary files
            fs.unlinkSync(tempFile);
            fs.unlinkSync(image.path);

            // Save to database
            const saved = await prisma.aiImage.create({
                data: {
                    prompt,
                    originalImageUrl: originalUpload.secure_url,
                    generatedImageUrl: generatedUpload.secure_url,
                    userId
                },
            });

            return saved;

        } catch (error) {
            // Clean up uploaded file in case of error
            if (fs.existsSync(image.path)) {
                fs.unlinkSync(image.path);
            }
            
            console.error("Error in transformImage:", error);
            throw error;
        }
    }


}


