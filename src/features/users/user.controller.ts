import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";
import { BadRequestError, UnAuthorizedError } from "../../lib/appError";
import cloudinary from "../../config/cloudinary";

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;

      const users = await UserService.getUsers({
        page: Number(page),
        limit: Number(limit),
        search: String(search),
      });

      res.status(200).json({
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }


  static async getAdmins(req: Request, res: Response) {
    try {
      const { search } = req.query;

      const admins = await UserService.getAdmins({
        search: search as string,
      });

      return res.status(200).json({ success: true, data: admins });
    } catch (error) {
      console.error("Error in getAdmins controller:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }



  static async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await UserService.getUserById(userId);

      res.status(200).json({
        message: "User fetched successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await UserService.deleteUser(userId);

      res.status(200).json({
        message: result.message,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { password, ...updates } = req.body; 
  
      if (password) {
         res.status(400).json({ error: "Password update is not allowed" });
         return;
      }
      const updatedUser = await UserService.updateUser(userId, updates);
      res.status(200).json({
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
  
  
  static async updateProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;
      if (!userId) {
        throw new BadRequestError("Unauthorized: User ID is required");
      }

      let imageUrl: string = "";

      if (req.file) {
        try {
          const file = req.file as Express.Multer.File;
          imageUrl = await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "AppSolute/profile" },
              (error, result) => {
                if (error) {
                  return reject(new BadRequestError("Failed to upload image to Cloudinary"));
                }
                if (result) return resolve(result.secure_url);
              }
            );
            uploadStream.end(file.buffer);
          });
        } catch (error) {
          return next(error);
        }
      }

      if (!imageUrl) {
        throw new BadRequestError("No image file uploaded");
      }

      const updatedUser = await UserService.updateProfileImage(userId, imageUrl);

      res.status(200).json({
        success: true,
        message: "Profile image updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
  
}
