import { Request, Response } from "express";
import PostService from "../services/blog.service";
import cloudinary from "../../../config/cloudinary";
import fs from "fs";
import path from "path";

class PostController {
  static async createPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user as string;
      const { title, description, category, contributors, isPublished } =
        req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      if (!title || !description || !category) {
        res.status(400).json({
          success: false,
          message: "Title, category , and description are required",
        });
        return;
      }

      let imageUrl: string = "";

      if (req.file) {
        const file = req.file as Express.Multer.File;

        imageUrl = await new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "posts" },
            (error, result) => {
              if (error) {
                reject(new Error("Failed to upload image to Cloudinary"));
              } else if (result) {
                resolve(result.secure_url);
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      }

      const post = await PostService.createPost(userId, {
        title,
        description,
        category,
        isPublished,
        contributors,
        imageUrl,
      });

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: post,
      });
    } catch (error: any) {
      console.error("Error creating post:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  static async getAllPosts(req: Request, res: Response) {
    try {
      const { publishedOnly } = req.query;
      const posts = await PostService.getAllPosts(publishedOnly === "true");

      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  static async getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const post = await PostService.getPostById(id);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }



  static async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user as string; // Type-cast to string for clarity
      const { id } = req.params;
      const { title, description, imageUrl, isPublished,  } = req.body;

      // Check if user is authorized
      if (!userId) {
         res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Update post
      const updatedPost = await PostService.updatePost(id, userId, {
        title,
        description,
        imageUrl,
        isPublished,
        
      });

      // Handle case if post wasn't found
      if (!updatedPost) {
        res.status(404).json({ success: false, message: "Post not found" });
      }

      // Respond with success
      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: updatedPost,
      });
    } catch (error: any) {
      // Handle unexpected errors
      console.error(error); // Log error for debugging
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  static async deletePost(req: Request, res: Response):Promise<void> {
    try {
      const userId = req.user as string;
      const { id } = req.params;
console.log(userId);
      if (!userId) {
         res.status(401).json({ message: "Unauthorized" });
         return;
      }

      await PostService.deletePost(id, userId);

      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }


  
}

export default PostController;
