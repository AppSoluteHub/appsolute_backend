import { NextFunction, Request, Response } from "express";
import PostService from "../services/post.admin.service";
import cloudinary from "../../../config/cloudinary";
import { BadRequestError, UnAuthorizedError } from "../../../lib/appError";
import appResponse from "../../../lib/appResponse";

class PostController {


static async createPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id as string;
      const { title, description, category, contributors, isPublished } = req.body;
  
      if (!userId) throw new UnAuthorizedError("Unauthorized");
      if (!title || !description || !category)
        throw new BadRequestError(
          "Title, category, and description are required"
        );
  
      const sanitizedCategory: string[] = Array.isArray(category)
        ? category.map((cat: string) => cat.trim())
        : [String(category).trim()];
  
      let imageUrl: string = "";
  
      if (req.file) {
        try {
          const file = req.file as Express.Multer.File;
          imageUrl = await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "AppSolute" },
              (error, result) => {
                if (error)
                  return reject(
                    new BadRequestError("Failed to upload image to Cloudinary")
                  );
                if (result) return resolve(result.secure_url);
              }
            );
            uploadStream.end(file.buffer);
          });
        } catch (error) {
          return next(error);
        }
      }
  
      const post = await PostService.createPost(userId, {
        title,
        description,
        category: sanitizedCategory,
        isPublished,
        contributors,
        imageUrl,
      });
  
      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: {
          title: post.title,
          fullName: post.author.fullName,
          profileImage: post.author.profileImage,
          role: post.author.role,
        },
      });
  
    } catch (error) {
      next(error);
    }
  }
  

  static async getAllPosts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { publishedOnly } = req.query;
      const posts = await PostService.getAllPosts(publishedOnly === "true");
      const filteredPosts = posts.map((post) => ({
        title: post.title,
        fullName: post.author?.fullName,
        profileImage: post.author?.profileImage,
        role: post.author?.role,
      }));
      res.send(appResponse("Posts fetched successfully", posts));
    } catch (error: any) {
      next(error);
    }
  }

  static async getPostById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const post = await PostService.getPostById(id);
      res.send(appResponse("Post fetched successfully", post));
    } catch (error: any) {
      next(error);
    }
  }

  static async updatePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id as string;
      const { id } = req.params;
      const { title, description, imageUrl, isPublished } = req.body;

      if (!userId) throw new UnAuthorizedError("You are not Authenticated");
      const updatedPost = await PostService.updatePost(id, userId, {
        title,
        description,
        imageUrl,
        isPublished,
      });

      if (!updatedPost) throw new BadRequestError("Post not found");
      res.send(appResponse("Post updated successfully", updatedPost));
    } catch (error: any) {
      next(error);
    }
  }

  static async deletePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id as string;
      const { id } = req.params;

      if (!userId) throw new UnAuthorizedError("You are not Authenticated");

      await PostService.deletePost(id, userId);

      res.send(appResponse("Post deleted successfully"));
    } catch (error: any) {
      next(error);
    }
  }
}

export default PostController;
