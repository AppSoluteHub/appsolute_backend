import { Request, Response, NextFunction } from "express";
import { BadRequestError, UnAuthorizedError } from "../../../lib/appError";
import cloudinary from "../../../config/cloudinary";
import { imageService } from "../services/uploadImage.service";

export class ImageController {
  static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;
      if (!userId) throw new UnAuthorizedError("Unauthorized");

      if (!req.file) throw new BadRequestError("No image file provided");

      const file = req.file as Express.Multer.File;

      const imageUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "AppSoluteImages" },
          (err, result) => {
            if (err || !result) {
              return reject(new BadRequestError("Image upload failed"));
            }
            resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });

      const data = await imageService.createImage(imageUrl);

      res.status(201).json({
        success: true,
        message: "Image uploaded successfully",
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}
