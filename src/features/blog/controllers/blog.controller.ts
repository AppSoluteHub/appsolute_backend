import { NextFunction, Request, Response } from "express";
import PostService from "../services/blog.service";
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
   const editorRole = req.user?.role as string;
    if (!userId) throw new UnAuthorizedError("Unauthorized");

    const {
      title,
      description,
      categories,
      tags,       
      contributors,
      isPublished,
    } = req.body;

  
    let parsedCategories: string[] = [];
    if (categories) {
      try {
        parsedCategories = JSON.parse(categories);
      } catch {
        parsedCategories = Array.isArray(categories)
          ? categories
          : [categories];
      }
    }

   
    const parsedTags: string[] = tags
      ? typeof tags === "string"
          ? tags.split(",").map(t => t.trim()).filter(Boolean)
          : Array.isArray(tags)
            ? tags
            : []
      : [];

 
    let parsedContributors: string[] = [];
    if (contributors) {
      try {
        parsedContributors = JSON.parse(contributors);
      } catch {
        parsedContributors = Array.isArray(contributors)
          ? contributors
          : [contributors];
      }
    }

   
    if (
      !title ||
      !description ||
      parsedCategories.length === 0
    ) {
      throw new BadRequestError(
        "Title, description and at least one category are required"
      );
    }

   
    let imageUrl = "";
    if (req.file) {
      const file = req.file as Express.Multer.File;
      imageUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "AppSolute" },
          (err, result) => {
            if (err) return reject(new BadRequestError("Image upload failed"));
            resolve(result!.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    }

  
    const post = await PostService.createPost(userId,editorRole, {
      title,
      description,
      categories: parsedCategories,
      tags: parsedTags,
      contributors: parsedContributors,
      isPublished: Boolean(isPublished),
      imageUrl,
    });

     res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
    return;
  } catch (err) {
    return next(err);
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
      const { postId } = req.params;
      const post = await PostService.getPostById(postId);
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
    const { postId } = req.params;
    const {
      title,
      description,
      imageUrl,
      isPublished,
      tags,
      categories,
      contributors,
    } = req.body;
 
    if (!userId) throw new UnAuthorizedError("You are not Authenticated");

    const updatedPost = await PostService.updatePost(postId, userId, {
      title,
      description,
      imageUrl,
      isPublished,
      tags,
      categories,
      contributors,
    });

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
      const { postId } = req.params;

      if (!userId) throw new UnAuthorizedError("You are not Authenticated");

      await PostService.deletePost(postId, userId);

      res.send(appResponse("Post deleted successfully"));
    } catch (error: any) {
      next(error);
    }
  }
}

export default PostController;
