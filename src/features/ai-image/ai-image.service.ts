import { OpenAI, toFile } from "openai";
import cloudinary from "../../config/cloudinary";
import { prisma } from "../../utils/prisma";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { BadRequestError } from "../../lib/appError";

dotenv.config();

export class AiImageService {
  
  

   static async transformImage(
    prompt: string,
    image: Express.Multer.File,
    userId: string
  ) {
    let tempFile: string | null = null;

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Upload original image
      const originalUpload = await cloudinary.uploader.upload(image.path, {
        folder: "ai-images/originals",
      });

      // Create a temp file to store OpenAI's output
      tempFile = path.join(process.cwd(), `generated_${Date.now()}.png`);

      // OpenAI image edit
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: await toFile(fs.createReadStream(image.path), "image.png", {
          type: "image/png",
        }),
        prompt,
        size: "1024x1024",
        n: 1,
      });

      clearTimeout(timeoutId);

      if (!response.data || response.data.length === 0) {
        throw new Error("No data returned from OpenAI");
      }

      const imageBase64 = response.data[0].b64_json;
      if (!imageBase64) {
        throw new Error("No image data returned from OpenAI");
      }

      const buffer = Buffer.from(imageBase64, "base64");
      fs.writeFileSync(tempFile, buffer);

      // Upload generated image to Cloudinary
      const generatedUpload = await cloudinary.uploader.upload(tempFile, {
        folder: "ai-images/generated",
      });

      // Clean up
      if (fs.existsSync(image.path)) fs.unlinkSync(image.path);
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      tempFile = null;

      // Save to database
      const saved = await prisma.aiImage.create({
        data: {
          prompt,
          originalImageUrl: originalUpload.secure_url,
          generatedImageUrl: generatedUpload.secure_url,
          userId,
        },
      });

      return saved;
    } catch (error: any) {
      if (error?.status === 400 && /safety|content_policy|violated/i.test(error?.message)) {
        throw new BadRequestError(
          "This image or prompt violates content policy. Please try a different prompt or image."
        );
      }
      if (error?.status === 429) {
        throw new BadRequestError("Too many requests. Please try again in a moment.");
      }
      if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      if (fs.existsSync(image.path)) fs.unlinkSync(image.path);
      console.error("Error in transformImage:", error);
      throw error;
    }
  }

  static async getUserImages(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [images, total] = await Promise.all([
      prisma.aiImage.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.aiImage.count({ where: { userId } }),
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

  static async getImageById(imageId: string, userId: string) {
    const image = await prisma.aiImage.findFirst({
      where: { id: imageId, userId },
    });

    if (!image) throw new Error("Image not found or access denied");

    return image;
  }

static async updateImage(
    imageId: string,
    userId: string,
    data: { prompt: string }
  ) {
    let tempFile: string | null = null;

    try {
      const existing = await prisma.aiImage.findFirst({
        where: { id: imageId, userId },
      });

      if (!existing) throw new Error("Image not found or access denied");
      if (!data.prompt) throw new Error("Prompt is required for update");

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Download original image
      const imageResponse = await fetch(existing.originalImageUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      const originalTempPath = path.join(process.cwd(), `original_${Date.now()}.png`);
      fs.writeFileSync(originalTempPath, imageBuffer);

      tempFile = path.join(process.cwd(), `updated_${Date.now()}.png`);

      // OpenAI edit
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: await toFile(fs.createReadStream(originalTempPath), "image.png", {
          type: "image/png",
        }),
        prompt: data.prompt,
        size: "1024x1024",
        n: 1,
      });

      clearTimeout(timeoutId);

      if (!response.data || response.data.length === 0) {
        throw new Error("No data returned from OpenAI");
      }

      const imageBase64 = response.data[0].b64_json;
      if (!imageBase64) throw new Error("No image data returned from OpenAI");

      fs.writeFileSync(tempFile, Buffer.from(imageBase64, "base64"));

      // Upload to Cloudinary
      const newGeneratedUpload = await cloudinary.uploader.upload(tempFile, {
        folder: "ai-images/generated",
      });

      // Delete old generated image
      const extractPublicId = (url: string) => {
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        return `ai-images/${folder}/${filename.split(".")[0]}`;
      };
      await cloudinary.uploader.destroy(extractPublicId(existing.generatedImageUrl));

      // Clean up
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      if (fs.existsSync(originalTempPath)) fs.unlinkSync(originalTempPath);
      tempFile = null;

      // Update DB
      const updated = await prisma.aiImage.update({
        where: { id: imageId },
        data: {
          prompt: data.prompt,
          generatedImageUrl: newGeneratedUpload.secure_url,
        },
      });

      return updated;
    } catch (error: any) {
      if (error?.status === 400 && /safety|content_policy/i.test(error?.message)) {
        throw new BadRequestError(
          "This image or prompt violates content policy. Please try a different prompt."
        );
      }
      if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      console.error("Error updating image:", error);
      throw error;
    }
  }
  static async deleteImage(imageId: string, userId: string) {
    const image = await prisma.aiImage.findFirst({
      where: { id: imageId, userId },
    });
    if (!image) throw new Error("Image not found or access denied");

    const extractPublicId = (url: string) => {
      const parts = url.split("/");
      const filename = parts[parts.length - 1];
      const folder = parts[parts.length - 2];
      return `ai-images/${folder}/${filename.split(".")[0]}`;
    };

    await Promise.all([
      cloudinary.uploader.destroy(extractPublicId(image.originalImageUrl)),
      cloudinary.uploader.destroy(extractPublicId(image.generatedImageUrl)),
    ]);

    await prisma.aiImage.delete({ where: { id: imageId } });

    return { success: true, message: "Image deleted successfully" };
  }

  static async getUserStats(userId: string) {
    const totalImages = await prisma.aiImage.count({ where: { userId } });
    const recentImages = await prisma.aiImage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, prompt: true, createdAt: true, generatedImageUrl: true },
    });

    return { totalImages, recentImages };
  }
}
