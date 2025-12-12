import Replicate from 'replicate';
import cloudinary from '../../config/cloudinary';
import { prisma } from '../../utils/prisma';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { BadRequestError } from '../../lib/appError';

dotenv.config();

export class AiImageService {

    // Determine the best model and settings based on prompt
    private static getModelAndSettings(userPrompt: string) {
        const lowerPrompt = userPrompt.toLowerCase();
        
        // Check for instruction-based edits (add, remove, change specific things)
        const editKeywords = ['add', 'remove', 'put', 'place', 'insert', 'delete'];
        const isEdit = editKeywords.some(keyword => lowerPrompt.startsWith(keyword));
        
        // Check for style transformations
        const styleKeywords = ['cartoon', 'anime', 'sketch', 'drawing', 'illustration', 'painting', 'watercolor', 'oil painting', 'pencil', 'style'];
        const isStyleTransform = styleKeywords.some(keyword => lowerPrompt.includes(keyword));
        
        if (isEdit) {
            // Use InstructPix2Pix for precise edits
            return {
                model: "timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f" as `${string}/${string}:${string}`,
                settings: {
                    prompt: userPrompt,
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                    image_guidance_scale: 1.5,
                },
                usesSeed: false
            };
        }
        
        if (isStyleTransform) {
            // Use SDXL for style transformations
            return {
                model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b" as `${string}/${string}:${string}`,
                settings: {
                    prompt: `${userPrompt}, maintain original composition and layout, preserve all elements, detailed ${userPrompt} style, high quality`,
                    negative_prompt: "ugly, distorted, blurry, low quality, deformed, disfigured, bad anatomy",
                    num_inference_steps: 50,
                    guidance_scale: 10,
                    strength: 0.35,
                    refine: "expert_ensemble_refiner",
                    scheduler: "KarrasDPM",
                },
                usesSeed: true
            };
        }
        
        // Default to SDXL for general transformations
        return {
            model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b" as `${string}/${string}:${string}`,
            settings: {
                prompt: `${userPrompt}, highly detailed, professional quality, 8k resolution`,
                negative_prompt: "ugly, distorted, blurry, low quality",
                num_inference_steps: 50,
                guidance_scale: 10,
                strength: 0.5,
                refine: "expert_ensemble_refiner",
                scheduler: "KarrasDPM",
            },
            usesSeed: true
        };
    }

    static async transformImage(prompt: string, image: Express.Multer.File, userId: string) {
        let tempFile: string | null = null;
        
        try {
            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_TOKEN,
            });

            // Upload original image to Cloudinary
            const originalUpload = await cloudinary.uploader.upload(image.path, {
                folder: "ai-images/originals",
            });

            console.log("Original image uploaded to Cloudinary");

            // Convert to base64 data URL
            const imageBuffer = fs.readFileSync(image.path);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = image.mimetype || 'image/jpeg';
            const dataUrl = `data:${mimeType};base64,${base64Image}`;

            // Get the best model and settings for this prompt
            const { model, settings, usesSeed } = this.getModelAndSettings(prompt);
            
            console.log(`Using model: ${model}`);
            console.log(`Settings:`, settings);
            
            // Build input object conditionally
            const input: any = {
                image: dataUrl,
                ...settings,
            };
            
            // Only add seed if the model supports it
            if (usesSeed) {
                input.seed = Math.floor(Math.random() * 1000000);
            }
            
            const output = await replicate.run(model, { input });

            let imageUrl: string;
            if (Array.isArray(output)) {
                imageUrl = output[0] as string;
            } else {
                imageUrl = output as any;
            }

            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            tempFile = path.join(process.cwd(), `generated_${Date.now()}.png`);
            fs.writeFileSync(tempFile, buffer);

            console.log("Generated image saved temporarily");

            const generatedUpload = await cloudinary.uploader.upload(tempFile, {
                folder: "ai-images/generated",
            });

            console.log("Generated image uploaded to Cloudinary");

            // Clean up temporary files
            fs.unlinkSync(tempFile);
            fs.unlinkSync(image.path);
            tempFile = null;

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

        } catch (error: any) {
            // Clean up uploaded file
            if (fs.existsSync(image.path)) {
                try {
                    fs.unlinkSync(image.path);
                } catch (cleanupError) {
                    console.error("Error cleaning up uploaded file:", cleanupError);
                }
            }
            
            // Clean up temp file if it was created
            if (tempFile && fs.existsSync(tempFile)) {
                try {
                    fs.unlinkSync(tempFile);
                } catch (cleanupError) {
                    console.error("Error cleaning up temp file:", cleanupError);
                }
            }
            
            // Handle NSFW content
            if (error.message?.includes("NSFW content detected")) {
                console.warn("NSFW content detected for prompt:", prompt);
                throw new BadRequestError("The prompt or generated content was flagged as NSFW. Please modify your prompt and try again.");
            }
            
            console.error("Error in transformImage:", error);
            throw error;
        }
    }


    static async getUserImages(userId: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;

            const [images, total] = await Promise.all([
                prisma.aiImage.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.aiImage.count({ where: { userId } })
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
        } catch (error) {
            console.error("Error fetching user images:", error);
            throw error;
        }
    }

 
    static async getImageById(imageId: string, userId: string) {
        try {
            const image = await prisma.aiImage.findFirst({
                where: {
                    id: imageId,
                    userId 
                }
            });

            if (!image) {
                throw new Error("Image not found or access denied");
            }

            return image;
        } catch (error) {
            console.error("Error fetching image by ID:", error);
            throw error;
        }
    }

  
    static async updateImage(imageId: string, userId: string, data: { prompt: string }) {
        let tempFile: string | null = null;
        
        try {
            // Verify ownership and get existing image
            const existing = await prisma.aiImage.findFirst({
                where: { id: imageId, userId }
            });

            if (!existing) {
                throw new Error("Image not found or access denied");
            }

            if (!data.prompt) {
                throw new Error("Prompt is required for update");
            }

            // Initialize Replicate
            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_TOKEN,
            });

            // Download original image from Cloudinary
            const imageResponse = await fetch(existing.originalImageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const buffer = Buffer.from(imageBuffer);
            
            // Convert to base64 data URL
            const base64Image = buffer.toString('base64');
            const dataUrl = `data:image/jpeg;base64,${base64Image}`;

            // Get the best model and settings for this prompt
            const { model, settings, usesSeed } = this.getModelAndSettings(data.prompt);
            
            console.log(`Using model: ${model}`);
            console.log(`Settings:`, settings);

            // Build input object conditionally
            const input: any = {
                image: dataUrl,
                ...settings,
            };
            
            // Only add seed if the model supports it
            if (usesSeed) {
                input.seed = Math.floor(Math.random() * 1000000);
            }

            // Generate new image with updated prompt
            const output = await replicate.run(model, { input });

            let imageUrl: string;
            if (Array.isArray(output)) {
                imageUrl = output[0] as string;
            } else {
                imageUrl = output as any;
            }

            // Download new generated image
            const newImageResponse = await fetch(imageUrl);
            const newArrayBuffer = await newImageResponse.arrayBuffer();
            const newBuffer = Buffer.from(newArrayBuffer);

            tempFile = path.join(process.cwd(), `updated_${Date.now()}.png`);
            fs.writeFileSync(tempFile, newBuffer);

            // Upload new generated image to Cloudinary
            const newGeneratedUpload = await cloudinary.uploader.upload(tempFile, {
                folder: "ai-images/generated",
            });

            // Delete old generated image from Cloudinary
            const extractPublicId = (url: string) => {
                const parts = url.split('/');
                const filename = parts[parts.length - 1];
                const folder = parts[parts.length - 2];
                return `ai-images/${folder}/${filename.split('.')[0]}`;
            };

            await cloudinary.uploader.destroy(extractPublicId(existing.generatedImageUrl));

            // Clean up temp file
            fs.unlinkSync(tempFile);
            tempFile = null;

            // Update database with new generated image URL and prompt
            const updated = await prisma.aiImage.update({
                where: { id: imageId },
                data: {
                    prompt: data.prompt,
                    generatedImageUrl: newGeneratedUpload.secure_url,
                }
            });

            return updated;
            
        } catch (error: any) {
            // Clean up temp file if it was created
            if (tempFile && fs.existsSync(tempFile)) {
                try {
                    fs.unlinkSync(tempFile);
                } catch (cleanupError) {
                    console.error("Error cleaning up temp file:", cleanupError);
                }
            }
            
            console.error("Error updating image:", error);
            throw error;
        }
    }

    static async deleteImage(imageId: string, userId: string) {
        try {
            // Verify ownership
            const image = await prisma.aiImage.findFirst({
                where: { id: imageId, userId }
            });

            if (!image) {
                throw new Error("Image not found or access denied");
            }

            // Extract public IDs from Cloudinary URLs
            const extractPublicId = (url: string) => {
                const parts = url.split('/');
                const filename = parts[parts.length - 1];
                const folder = parts[parts.length - 2];
                return `ai-images/${folder}/${filename.split('.')[0]}`;
            };

            await Promise.all([
                cloudinary.uploader.destroy(extractPublicId(image.originalImageUrl)),
                cloudinary.uploader.destroy(extractPublicId(image.generatedImageUrl))
            ]);

            await prisma.aiImage.delete({
                where: { id: imageId }
            });

            return { success: true, message: "Image deleted successfully" };
        } catch (error) {
            console.error("Error deleting image:", error);
            throw error;
        }
    }

 
    static async getUserStats(userId: string) {
        try {
            const totalImages = await prisma.aiImage.count({
                where: { userId }
            });

            const recentImages = await prisma.aiImage.findMany({
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
        } catch (error) {
            console.error("Error fetching user stats:", error);
            throw error;
        }
    }
}