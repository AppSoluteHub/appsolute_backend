import { Request, Response } from "express";
import PostService from "../services/blog.service";
import cloudinary from "../../../config/cloudinary";
class PostController {
 

  static async createPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user as string;
      const { title,  description, category, isPublished } = req.body;
  
     
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
  
      //Validation for required fields
      if (!title ||  !description || !category) {
        res.status(400).json({
          success: false,
          message: 'Title, category , and description are required',
        });
        return;
      }
  
      let imageUrl: string = "" 
  
      // Handle image upload if an image is provided
      if (req.file) {
        // Narrow the type to ensure req.file is defined
        const file = req.file as Express.Multer.File;
        console.log(file);
        // Upload image to Cloudinary
        imageUrl = await new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'posts' },
            (error, result) => {
              if (error) {
                reject(new Error('Failed to upload image to Cloudinary'));
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
        imageUrl, 
      });
  
      // Return success response
      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post,
      });
    } catch (error: any) {
      console.error('Error creating post:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
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

  /**
   * Update a post
   */
  static async updatePost(req: Request, res: Response) {
    try {
      const userId = req.user as string
      const { id } = req.params;
      const { title, description, imageUrl, isPublished } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const updatedPost = await PostService.updatePost(id, userId, { title, description, imageUrl, isPublished });

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

  /**
   * Delete a post
   */
  static async deletePost(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // Assume the authenticated user ID is attached to req.user
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
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
