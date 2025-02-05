import { Request, Response } from "express";
import PostService from "../services/blog.service";
import cloudinary from "../../../config/cloudinary";
import fs from "fs";
import path from "path";
import { BadRequestError } from "../../../lib/appError";
import { PostCategory } from "@prisma/client";

class PostController {
  static async createPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id as string;
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
            { folder: "AppSolute" },
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
      const postCat = category as PostCategory;

      const post = await PostService.createPost(userId, {
        title,
        description,
        category: postCat,
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
      const userId = req.user?.id as string;
      const { id } = req.params;
      const { title, description, imageUrl, isPublished } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const updatedPost = await PostService.updatePost(id, userId, {
        title,
        description,
        imageUrl,
        isPublished,
      });

      if (!updatedPost) {
        res.status(404).json({ success: false, message: "Post not found" });
      }

      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: updatedPost,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  static async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id as string;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      console.log("id", id);
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
