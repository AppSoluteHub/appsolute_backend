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
  
  // ✅ MAIN METHOD: Fast async response
  static async transformImageAsync(
    prompt: string,
    image: Express.Multer.File,
    userId: string
  ) {
    try {
      // Upload original immediately
      const originalUpload = await cloudinary.uploader.upload(image.path, {
        folder: "ai-images/originals",
      });

      console.log("Original image uploaded to Cloudinary");

      // Create pending database entry
      const pending = await prisma.aiImage.create({
        data: {
          prompt,
          originalImageUrl: originalUpload.secure_url,
          generatedImageUrl: null,
          status: "processing",
          userId,
        },
      });

      console.log(`Image record created with ID: ${pending.id}, status: processing`);

      // Clean up uploaded file
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }

      // Process in background (don't await)
      this.processImageInBackground(
        pending.id,
        prompt,
        originalUpload.secure_url
      ).catch((err) => {
        console.error("Background processing error:", err);
        // Update status to failed
        prisma.aiImage
          .update({
            where: { id: pending.id },
            data: { status: "failed" },
          })
          .catch((updateErr) =>
            console.error("Failed to update status to failed:", updateErr)
          );
      });

      // Return immediately with processing status
      return pending;
    } catch (error: any) {
      // Clean up uploaded file on error
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }
      console.error("Error in transformImageAsync:", error);
      throw error;
    }
  }

  // Background processing method
  private static async processImageInBackground(
    imageId: string,
    prompt: string,
    originalUrl: string
  ) {
    let tempFile: string | null = null;
    let originalTempPath: string | null = null;

    try {
      console.log(`Starting background processing for image ${imageId}`);

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Download original from Cloudinary
      const imageResponse = await fetch(originalUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      originalTempPath = path.join(
        process.cwd(),
        `original_${Date.now()}.png`
      );
      fs.writeFileSync(originalTempPath, imageBuffer);

      console.log(`Processing with OpenAI for image ${imageId}`);

      // OpenAI processing with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: await toFile(
          fs.createReadStream(originalTempPath),
          "image.png",
          {
            type: "image/png",
          }
        ),
        prompt,
        size: "1024x1024",
        n: 1,
      });

      clearTimeout(timeoutId);

      if (!response.data || response.data.length === 0) {
        throw new Error("No data returned from OpenAI");
      }

      const imageBase64 = response.data[0].b64_json;
      if (!imageBase64) throw new Error("No image data returned from OpenAI");

      tempFile = path.join(process.cwd(), `generated_${Date.now()}.png`);
      fs.writeFileSync(tempFile, Buffer.from(imageBase64, "base64"));

      console.log(`Uploading generated image to Cloudinary for ${imageId}`);

      // Upload generated image
      const generatedUpload = await cloudinary.uploader.upload(tempFile, {
        folder: "ai-images/generated",
      });

      console.log(`Image processing completed for ${imageId}`);

      // Update database with generated image
      await prisma.aiImage.update({
        where: { id: imageId },
        data: {
          generatedImageUrl: generatedUpload.secure_url,
          status: "completed",
        },
      });

      // Clean up
      if (originalTempPath && fs.existsSync(originalTempPath)) {
        fs.unlinkSync(originalTempPath);
      }
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }

      console.log(`Cleanup completed for ${imageId}`);
    } catch (error: any) {
      console.error(`Background processing error for ${imageId}:`, error);

      // Update to failed status
      await prisma.aiImage
        .update({
          where: { id: imageId },
          data: {
            status: "failed",
            generatedImageUrl: null,
          },
        })
        .catch((updateErr) =>
          console.error("Failed to update status to failed:", updateErr)
        );

      // Clean up on error
      if (originalTempPath && fs.existsSync(originalTempPath)) {
        fs.unlinkSync(originalTempPath);
      }
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  // Get image status (for polling)
  static async getImageStatus(imageId: string, userId: string) {
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
      console.error("Error fetching image status:", error);
      throw error;
    }
  }

  // Get user images with optional status filter
  static async getUserImages(
    userId: string,
    page: number,
    limit: number,
    status?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [images, total] = await Promise.all([
      prisma.aiImage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.aiImage.count({ where }),
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

  // Update method (also async now)
  static async updateImageAsync(
    imageId: string,
    userId: string,
    data: { prompt: string }
  ) {
    try {
      const existing = await prisma.aiImage.findFirst({
        where: { id: imageId, userId },
      });

      if (!existing) throw new Error("Image not found or access denied");
      if (!data.prompt) throw new Error("Prompt is required for update");

      // Update to processing status
      const updated = await prisma.aiImage.update({
        where: { id: imageId },
        data: {
          prompt: data.prompt,
          status: "processing",
        },
      });

      // Process in background
      this.updateImageInBackground(
        imageId,
        data.prompt,
        existing.originalImageUrl,
        existing.generatedImageUrl
      ).catch((err) => {
        console.error("Background update error:", err);
        prisma.aiImage
          .update({
            where: { id: imageId },
            data: { status: "failed" },
          })
          .catch((updateErr) =>
            console.error("Failed to update status to failed:", updateErr)
          );
      });

      return updated;
    } catch (error: any) {
      console.error("Error in updateImageAsync:", error);
      throw error;
    }
  }

  // Background update method
  private static async updateImageInBackground(
    imageId: string,
    prompt: string,
    originalUrl: string,
    oldGeneratedUrl: string | null
  ) {
    let tempFile: string | null = null;
    let originalTempPath: string | null = null;

    try {
      console.log(`Starting background update for image ${imageId}`);

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Download original
      const imageResponse = await fetch(originalUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      originalTempPath = path.join(
        process.cwd(),
        `original_${Date.now()}.png`
      );
      fs.writeFileSync(originalTempPath, imageBuffer);

      // OpenAI processing
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: await toFile(
          fs.createReadStream(originalTempPath),
          "image.png",
          {
            type: "image/png",
          }
        ),
        prompt,
        size: "1024x1024",
        n: 1,
      });

      clearTimeout(timeoutId);

      if (!response.data || response.data.length === 0) {
        throw new Error("No data returned from OpenAI");
      }

      const imageBase64 = response.data[0].b64_json;
      if (!imageBase64) throw new Error("No image data returned from OpenAI");

      tempFile = path.join(process.cwd(), `updated_${Date.now()}.png`);
      fs.writeFileSync(tempFile, Buffer.from(imageBase64, "base64"));

      // Upload to Cloudinary
      const newGeneratedUpload = await cloudinary.uploader.upload(tempFile, {
        folder: "ai-images/generated",
      });

      // Delete old generated image from Cloudinary
      if (oldGeneratedUrl) {
        const extractPublicId = (url: string) => {
          const parts = url.split("/");
          const filename = parts[parts.length - 1];
          const folder = parts[parts.length - 2];
          return `ai-images/${folder}/${filename.split(".")[0]}`;
        };
        await cloudinary.uploader
          .destroy(extractPublicId(oldGeneratedUrl))
          .catch((err) =>
            console.error("Failed to delete old image from Cloudinary:", err)
          );
      }

      // Update DB
      await prisma.aiImage.update({
        where: { id: imageId },
        data: {
          generatedImageUrl: newGeneratedUpload.secure_url,
          status: "completed",
        },
      });

      // Clean up
      if (originalTempPath && fs.existsSync(originalTempPath)) {
        fs.unlinkSync(originalTempPath);
      }
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }

      console.log(`Update completed for ${imageId}`);
    } catch (error: any) {
      console.error(`Background update error for ${imageId}:`, error);

      await prisma.aiImage
        .update({
          where: { id: imageId },
          data: { status: "failed" },
        })
        .catch((updateErr) =>
          console.error("Failed to update status to failed:", updateErr)
        );

      // Clean up on error
      if (originalTempPath && fs.existsSync(originalTempPath)) {
        fs.unlinkSync(originalTempPath);
      }
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
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

    const deletePromises = [
      cloudinary.uploader.destroy(extractPublicId(image.originalImageUrl)),
    ];

    // Only delete generated image if it exists
    if (image.generatedImageUrl) {
      deletePromises.push(
        cloudinary.uploader.destroy(extractPublicId(image.generatedImageUrl))
      );
    }

    await Promise.all(deletePromises);

    await prisma.aiImage.delete({ where: { id: imageId } });

    return { success: true, message: "Image deleted successfully" };
  }

  static async getUserStats(userId: string) {
    const [totalImages, processingCount, completedCount, failedCount] =
      await Promise.all([
        prisma.aiImage.count({ where: { userId } }),
        prisma.aiImage.count({ where: { userId, status: "processing" } }),
        prisma.aiImage.count({ where: { userId, status: "completed" } }),
        prisma.aiImage.count({ where: { userId, status: "failed" } }),
      ]);

    const recentImages = await prisma.aiImage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        prompt: true,
        createdAt: true,
        generatedImageUrl: true,
        status: true,
      },
    });

    return {
      totalImages,
      processingCount,
      completedCount,
      failedCount,
      recentImages,
    };
  }
}

// import { OpenAI, toFile } from "openai";
// import cloudinary from "../../config/cloudinary";
// import { prisma } from "../../utils/prisma";
// import fs from "fs";
// import path from "path";
// import dotenv from "dotenv";
// import fetch from "node-fetch";
// import { BadRequestError } from "../../lib/appError";

// dotenv.config();

// export class AiImageService {
  
  

//    static async transformImage(
//     prompt: string,
//     image: Express.Multer.File,
//     userId: string
//   ) {
//     let tempFile: string | null = null;

//     try {
//       const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//       // Upload original image
//       const originalUpload = await cloudinary.uploader.upload(image.path, {
//         folder: "ai-images/originals",
//       });

//       // Create a temp file to store OpenAI's output
//       tempFile = path.join(process.cwd(), `generated_${Date.now()}.png`);

//       // OpenAI image edit
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 60000);

//       const response = await openai.images.edit({
//         model: "gpt-image-1",
//         image: await toFile(fs.createReadStream(image.path), "image.png", {
//           type: "image/png",
//         }),
//         prompt,
//         size: "1024x1024",
//         n: 1,
//       });

//       clearTimeout(timeoutId);

//       if (!response.data || response.data.length === 0) {
//         throw new Error("No data returned from OpenAI");
//       }

//       const imageBase64 = response.data[0].b64_json;
//       if (!imageBase64) {
//         throw new Error("No image data returned from OpenAI");
//       }

//       const buffer = Buffer.from(imageBase64, "base64");
//       fs.writeFileSync(tempFile, buffer);

//       // Upload generated image to Cloudinary
//       const generatedUpload = await cloudinary.uploader.upload(tempFile, {
//         folder: "ai-images/generated",
//       });

//       // Clean up
//       if (fs.existsSync(image.path)) fs.unlinkSync(image.path);
//       if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
//       tempFile = null;

//       // Save to database
//       const saved = await prisma.aiImage.create({
//         data: {
//           prompt,
//           originalImageUrl: originalUpload.secure_url,
//           generatedImageUrl: generatedUpload.secure_url,
//           userId,
//         },
//       });

//       return saved;
//     } catch (error: any) {
//       if (error?.status === 400 && /safety|content_policy|violated/i.test(error?.message)) {
//         throw new BadRequestError(
//           "This image or prompt violates content policy. Please try a different prompt or image."
//         );
//       }
//       if (error?.status === 429) {
//         throw new BadRequestError("Too many requests. Please try again in a moment.");
//       }
//       if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
//       if (fs.existsSync(image.path)) fs.unlinkSync(image.path);
//       console.error("Error in transformImage:", error);
//       throw error;
//     }
//   }

//   static async getUserImages(userId: string, page: number, limit: number) {
//     const skip = (page - 1) * limit;
//     const [images, total] = await Promise.all([
//       prisma.aiImage.findMany({
//         where: { userId },
//         orderBy: { createdAt: "desc" },
//         skip,
//         take: limit,
//       }),
//       prisma.aiImage.count({ where: { userId } }),
//     ]);

//     return {
//       images,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   static async getImageById(imageId: string, userId: string) {
//     const image = await prisma.aiImage.findFirst({
//       where: { id: imageId, userId },
//     });

//     if (!image) throw new Error("Image not found or access denied");

//     return image;
//   }

// static async updateImage(
//     imageId: string,
//     userId: string,
//     data: { prompt: string }
//   ) {
//     let tempFile: string | null = null;

//     try {
//       const existing = await prisma.aiImage.findFirst({
//         where: { id: imageId, userId },
//       });

//       if (!existing) throw new Error("Image not found or access denied");
//       if (!data.prompt) throw new Error("Prompt is required for update");

//       const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//       // Download original image
//       const imageResponse = await fetch(existing.originalImageUrl);
//       const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

//       const originalTempPath = path.join(process.cwd(), `original_${Date.now()}.png`);
//       fs.writeFileSync(originalTempPath, imageBuffer);

//       tempFile = path.join(process.cwd(), `updated_${Date.now()}.png`);

//       // OpenAI edit
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 60000);

//       const response = await openai.images.edit({
//         model: "gpt-image-1",
//         image: await toFile(fs.createReadStream(originalTempPath), "image.png", {
//           type: "image/png",
//         }),
//         prompt: data.prompt,
//         size: "1024x1024",
//         n: 1,
//       });

//       clearTimeout(timeoutId);

//       if (!response.data || response.data.length === 0) {
//         throw new Error("No data returned from OpenAI");
//       }

//       const imageBase64 = response.data[0].b64_json;
//       if (!imageBase64) throw new Error("No image data returned from OpenAI");

//       fs.writeFileSync(tempFile, Buffer.from(imageBase64, "base64"));

//       // Upload to Cloudinary
//       const newGeneratedUpload = await cloudinary.uploader.upload(tempFile, {
//         folder: "ai-images/generated",
//       });

//       // Delete old generated image
//       const extractPublicId = (url: string) => {
//         const parts = url.split("/");
//         const filename = parts[parts.length - 1];
//         const folder = parts[parts.length - 2];
//         return `ai-images/${folder}/${filename.split(".")[0]}`;
//       };
//       await cloudinary.uploader.destroy(extractPublicId(existing.generatedImageUrl));

//       // Clean up
//       if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
//       if (fs.existsSync(originalTempPath)) fs.unlinkSync(originalTempPath);
//       tempFile = null;

//       // Update DB
//       const updated = await prisma.aiImage.update({
//         where: { id: imageId },
//         data: {
//           prompt: data.prompt,
//           generatedImageUrl: newGeneratedUpload.secure_url,
//         },
//       });

//       return updated;
//     } catch (error: any) {
//       if (error?.status === 400 && /safety|content_policy/i.test(error?.message)) {
//         throw new BadRequestError(
//           "This image or prompt violates content policy. Please try a different prompt."
//         );
//       }
//       if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
//       console.error("Error updating image:", error);
//       throw error;
//     }
//   }
//   static async deleteImage(imageId: string, userId: string) {
//     const image = await prisma.aiImage.findFirst({
//       where: { id: imageId, userId },
//     });
//     if (!image) throw new Error("Image not found or access denied");

//     const extractPublicId = (url: string) => {
//       const parts = url.split("/");
//       const filename = parts[parts.length - 1];
//       const folder = parts[parts.length - 2];
//       return `ai-images/${folder}/${filename.split(".")[0]}`;
//     };

//     await Promise.all([
//       cloudinary.uploader.destroy(extractPublicId(image.originalImageUrl)),
//       cloudinary.uploader.destroy(extractPublicId(image.generatedImageUrl)),
//     ]);

//     await prisma.aiImage.delete({ where: { id: imageId } });

//     return { success: true, message: "Image deleted successfully" };
//   }

//   static async getUserStats(userId: string) {
//     const totalImages = await prisma.aiImage.count({ where: { userId } });
//     const recentImages = await prisma.aiImage.findMany({
//       where: { userId },
//       orderBy: { createdAt: "desc" },
//       take: 5,
//       select: { id: true, prompt: true, createdAt: true, generatedImageUrl: true },
//     });

//     return { totalImages, recentImages };
//   }
// }
