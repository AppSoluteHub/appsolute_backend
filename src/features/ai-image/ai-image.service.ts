import { OpenAI, toFile } from "openai";
import cloudinary from "../../config/cloudinary";
import { prisma } from "../../utils/prisma";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { BadRequestError } from "../../lib/appError";
import sharp from "sharp";

dotenv.config();

export class AiImageService {
  private static isDeterministicEdit(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    const deterministicKeywords = [
      "add star",
      "add watermark",
      "add border",
      "add text",
    ];
    return deterministicKeywords.some((keyword) =>
      lowerPrompt.includes(keyword)
    );
  }

  static async transformImage(
    prompt: string,
    image: Express.Multer.File,
    userId: string
  ) {
    let tempFile: string | null = null;
    let resizedFile: string | null = null;
    let convertedFile: string | null = null;

    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const originalUpload = await cloudinary.uploader.upload(image.path, {
        folder: "ai-images/originals",
      });

      let generatedImagePath: string = "";

      // Check if this is a deterministic edit (perfect preservation with Sharp)
      if (this.isDeterministicEdit(prompt)) {
        console.log("Using Sharp for deterministic overlay");

        const lowerPrompt = prompt.toLowerCase();

        if (lowerPrompt.includes("star")) {
          generatedImagePath = await this.addStarsToImage(image.path);
        } else {
          throw new Error("Deterministic edit type not yet implemented");
        }

        tempFile = generatedImagePath;
      } else {
        console.log("Using OpenAI gpt-image-1 for AI transformation");

        //  Convert to PNG first
        convertedFile = path.join(process.cwd(), `converted_${Date.now()}.png`);
        await sharp(image.path).png().toFile(convertedFile);

        // Resize to 1024x1024
        resizedFile = path.join(process.cwd(), `resized_${Date.now()}.png`);
        await sharp(convertedFile)
          .resize(1024, 1024, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .png()
          .toFile(resizedFile);

        // Clean up converted file
        if (convertedFile && fs.existsSync(convertedFile)) {
          fs.unlinkSync(convertedFile);
          convertedFile = null;
        }

        // Create abort controller for timeout (60 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
          const response = await openai.images.edit({
            model: "gpt-image-1",
            image: await toFile(fs.createReadStream(resizedFile), "image.png", {
              type: "image/png",
            }),
            prompt: prompt,
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

          tempFile = path.join(process.cwd(), `generated_${Date.now()}.png`);
          fs.writeFileSync(tempFile, buffer);
          generatedImagePath = tempFile;
        } catch (abortError: unknown) {
          clearTimeout(timeoutId);
          if (abortError instanceof Error && abortError.name === "AbortError") {
            throw new Error("OpenAI request timed out after 60 seconds");
          }
          throw abortError;
        }

        // Clean up resized file
        if (resizedFile && fs.existsSync(resizedFile)) {
          fs.unlinkSync(resizedFile);
          resizedFile = null;
        }
      }

      if (!generatedImagePath) {
        throw new Error("Failed to generate image");
      }

      // Upload to Cloudinary
      const generatedUpload = await cloudinary.uploader.upload(
        generatedImagePath,
        {
          folder: "ai-images/generated",
        }
      );

      // Clean up
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }
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
      // Handle OpenAI safety/moderation errors
      if (error?.status === 400) {
        if (
          error?.message?.includes("safety") ||
          error?.message?.includes("content_policy") ||
          error?.message?.includes("violated")
        ) {
          console.warn("Content policy violation for prompt:", prompt);
          throw new BadRequestError(
            "This image or prompt violates content policy. Please try a different prompt or image."
          );
        }
      }

      // Handle rate limiting
      if (error?.status === 429) {
        console.error("OpenAI rate limit hit");
        throw new BadRequestError(
          "Too many requests. Please try again in a moment."
        );
      }

      // Cleanup all temp files
      if (fs.existsSync(image.path)) {
        try {
          fs.unlinkSync(image.path);
        } catch (cleanupError) {
          console.error("Error cleaning up uploaded file:", cleanupError);
        }
      }

      if (tempFile && fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (cleanupError) {
          console.error("Error cleaning up temp file:", cleanupError);
        }
      }

      if (resizedFile && fs.existsSync(resizedFile)) {
        try {
          fs.unlinkSync(resizedFile);
        } catch (cleanupError) {
          console.error("Error cleaning up resized file:", cleanupError);
        }
      }

      if (convertedFile && fs.existsSync(convertedFile)) {
        try {
          fs.unlinkSync(convertedFile);
        } catch (cleanupError) {
          console.error("Error cleaning up converted file:", cleanupError);
        }
      }

      console.error("Error in transformImage:", error);
      throw error;
    }
  }

  // Helper for star overlay using Sharp (deterministic, perfect preservation)
  private static async addStarsToImage(imagePath: string): Promise<string> {
    const outputPath = path.join(process.cwd(), `stars_${Date.now()}.png`);
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    const composites = [];
    const numStars = 10 + Math.floor(Math.random() * 15);

    for (let i = 0; i < numStars; i++) {
      const x = Math.floor(Math.random() * metadata.width!);
      const y = Math.floor(Math.random() * metadata.height!);
      const size = 20 + Math.floor(Math.random() * 40);

      const starSvg = Buffer.from(`
                <svg width="${size}" height="${size}">
                    <polygon points="${size / 2},${size * 0.1} ${size * 0.61},${
        size * 0.35
      } ${size * 0.88},${size * 0.35} ${size * 0.67},${size * 0.52} ${
        size * 0.75
      },${size * 0.8} ${size / 2},${size * 0.62} ${size * 0.25},${size * 0.8} ${
        size * 0.33
      },${size * 0.52} ${size * 0.12},${size * 0.35} ${size * 0.39},${
        size * 0.35
      }" 
                             fill="rgba(255, 255, 255, ${
                               0.7 + Math.random() * 0.3
                             })" 
                             stroke="rgba(255, 215, 0, 0.9)" 
                             stroke-width="1"/>
                </svg>
            `);

      composites.push({ input: starSvg, top: y, left: x });
    }

    await image.composite(composites).toFile(outputPath);
    return outputPath;
  }

  static async getUserImages(userId: string, page: number, limit: number) {
    try {
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
          userId,
        },
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

  static async updateImage(
    imageId: string,
    userId: string,
    data: { prompt: string }
  ) {
    let tempFile: string | null = null;
    let resizedFile: string | null = null;
    let originalTempPath: string | null = null;
    let convertedFile: string | null = null;

    try {
      // Verify ownership and get existing image
      const existing = await prisma.aiImage.findFirst({
        where: { id: imageId, userId },
      });

      if (!existing) {
        throw new Error("Image not found or access denied");
      }

      if (!data.prompt) {
        throw new Error("Prompt is required for update");
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Download original image from Cloudinary
      const imageResponse = await fetch(existing.originalImageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);

      // Save to temp file
      originalTempPath = path.join(process.cwd(), `original_${Date.now()}.png`);
      fs.writeFileSync(originalTempPath, buffer);

      let generatedImagePath: string = "";

      // Check if deterministic edit
      if (this.isDeterministicEdit(data.prompt)) {
        console.log("Using Sharp for deterministic overlay");

        const lowerPrompt = data.prompt.toLowerCase();

        if (lowerPrompt.includes("star")) {
          generatedImagePath = await this.addStarsToImage(originalTempPath);
        } else {
          throw new Error("Deterministic edit type not yet implemented");
        }

        tempFile = generatedImagePath;
      } else {
        convertedFile = path.join(process.cwd(), `converted_${Date.now()}.png`);
        await sharp(originalTempPath).png().toFile(convertedFile);

        console.log("Image converted to PNG");

        resizedFile = path.join(process.cwd(), `resized_${Date.now()}.png`);
        await sharp(convertedFile)
          .resize(1024, 1024, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .png()
          .toFile(resizedFile);

        console.log("Image resized to 1024x1024");

        // Clean up converted file
        if (convertedFile && fs.existsSync(convertedFile)) {
          fs.unlinkSync(convertedFile);
          convertedFile = null;
        }

        // Create timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
          // Use OpenAI edit with toFile helper
          const response = await openai.images.edit({
            model: "gpt-image-1",
            image: await toFile(fs.createReadStream(resizedFile), "image.png", {
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

          if (!imageBase64) {
            throw new Error("No image data returned from OpenAI");
          }

          const newBuffer = Buffer.from(imageBase64, "base64");

          tempFile = path.join(process.cwd(), `updated_${Date.now()}.png`);
          fs.writeFileSync(tempFile, newBuffer);
          generatedImagePath = tempFile;

          tempFile = path.join(process.cwd(), `updated_${Date.now()}.png`);
          fs.writeFileSync(tempFile, newBuffer);
          generatedImagePath = tempFile;
        } catch (abortError: unknown) {
          clearTimeout(timeoutId);
          if (abortError instanceof Error && abortError.name === "AbortError") {
            throw new Error("OpenAI request timed out after 60 seconds");
          }
          throw abortError;
        }

        // Clean up resized file
        if (resizedFile && fs.existsSync(resizedFile)) {
          fs.unlinkSync(resizedFile);
          resizedFile = null;
        }
      }

      // Clean up original temp
      if (originalTempPath && fs.existsSync(originalTempPath)) {
        fs.unlinkSync(originalTempPath);
        originalTempPath = null;
      }

      if (!generatedImagePath) {
        throw new Error("Failed to generate image");
      }

      // Upload new generated image to Cloudinary
      const newGeneratedUpload = await cloudinary.uploader.upload(
        generatedImagePath,
        {
          folder: "ai-images/generated",
        }
      );

      // Delete old generated image from Cloudinary
      const extractPublicId = (url: string) => {
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        return `ai-images/${folder}/${filename.split(".")[0]}`;
      };

      await cloudinary.uploader.destroy(
        extractPublicId(existing.generatedImageUrl)
      );

      // Clean up temp file
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
        tempFile = null;
      }

      // Update database
      const updated = await prisma.aiImage.update({
        where: { id: imageId },
        data: {
          prompt: data.prompt,
          generatedImageUrl: newGeneratedUpload.secure_url,
        },
      });

      return updated;
    } catch (error: any) {
      // Handle safety errors
      if (
        error?.status === 400 &&
        (error?.message?.includes("safety") ||
          error?.message?.includes("content_policy"))
      ) {
        throw new BadRequestError(
          "This image or prompt violates content policy. Please try a different prompt."
        );
      }

      // Cleanup
      if (tempFile && fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (cleanupError) {
          console.error("Error cleaning up temp file:", cleanupError);
        }
      }

      if (resizedFile && fs.existsSync(resizedFile)) {
        try {
          fs.unlinkSync(resizedFile);
        } catch (cleanupError) {
          console.error("Error cleaning up resized file:", cleanupError);
        }
      }

      if (originalTempPath && fs.existsSync(originalTempPath)) {
        try {
          fs.unlinkSync(originalTempPath);
        } catch (cleanupError) {
          console.error("Error cleaning up original temp file:", cleanupError);
        }
      }

      if (convertedFile && fs.existsSync(convertedFile)) {
        try {
          fs.unlinkSync(convertedFile);
        } catch (cleanupError) {
          console.error("Error cleaning up converted file:", cleanupError);
        }
      }

      console.error("Error updating image:", error);
      throw error;
    }
  }

  static async deleteImage(imageId: string, userId: string) {
    try {
      const image = await prisma.aiImage.findFirst({
        where: { id: imageId, userId },
      });

      if (!image) {
        throw new Error("Image not found or access denied");
      }

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

      await prisma.aiImage.delete({
        where: { id: imageId },
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
        where: { userId },
      });

      const recentImages = await prisma.aiImage.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          prompt: true,
          createdAt: true,
          generatedImageUrl: true,
        },
      });

      return {
        totalImages,
        recentImages,
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }
}
