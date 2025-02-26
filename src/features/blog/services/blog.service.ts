import { PostCategory, PrismaClient } from "@prisma/client";
import { PostData, UpdatePostData } from "../../../interfaces/post.interface";
import {
  AppError,
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnAuthorizedError,
} from "../../../lib/appError";

const prisma = new PrismaClient();

class PostService {
  static async createPost(userId: string, postData: PostData) {
    const { title, imageUrl, description, category, contributors, isPublished } = postData;
  
    if (!title || !description || !imageUrl) {
      throw new BadRequestError("Title, description, and imageUrl are required");
    }
  
    const validCategories: PostCategory[] = [
      "AI",
      "TECHNOLOGY",
      "MARKETING",
      "DESIGN",
      "SOFTWARE",
    ];
  
    const sanitizedCategory = category?.trim().toUpperCase() as PostCategory;
    
   
    const postCategory: string[] = validCategories.includes(sanitizedCategory)
      ? [sanitizedCategory]
      : ["TECHNOLOGY"];
  
   
    const postContributors = Array.isArray(contributors) ? contributors : [];
  
    try {
      const post = await prisma.post.create({
        data: {
          title,
          description,
          category: postCategory, 
          authorId: userId,
          imageUrl,
          contributors: postContributors,
          isPublished: isPublished ?? false,
        },
      });
      return post;
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof AppError) throw error; 
      throw new InternalServerError("Unable to create post");
    }
  }
  

  static async getAllPosts(publishedOnly: boolean = true) {
    try {
      return await prisma.post.findMany({
        where: publishedOnly ? { isPublished: true } : undefined,
        include: {
          author: { select: { id: true, fullName: true, email: true } },
        },
      });
    } catch (error) {
      console.log(error);
    if (error instanceof AppError) throw error; 
      throw new InternalServerError("Unable to fetch posts");
    }
  }

  

  static async getPostById(postId: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: { 
            select: { id: true, fullName: true, email: true } 
          },
          comments: {
            include: {
              author: { select: { id: true, fullName: true, profileImage: true } }
            }
          },
          likes: {
            include: {
              user: { select: { id: true, fullName: true, email: true } }
            }
          }
        },
      });
  
      if (!post) throw new NotFoundError("Post not found");
  
      return post;
    } catch (error) {
      console.error("Error fetching post:", error);
      if (error instanceof AppError) throw error; 
      throw new InternalServerError("Unable to fetch post");
    }
  }
  

  static async updatePost(
    postId: string,
    userId: string,
    updateData: UpdatePostData
  ) {
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });

      if (!post) throw new NotFoundError("Post not found");
      if (post.authorId !== userId)
        throw new UnAuthorizedError("Not authorized");

      return await prisma.post.update({
        where: { id: postId },
        data: updateData,
      });
    } catch (error) {
      console.log(error);
    if (error instanceof AppError) throw error; 
      throw new InternalServerError("Unable to update post");
    }
  }

 
  static async deletePost(postId: string, userId: string) {
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) throw new NotFoundError("Post not found");
  
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError("User not found");
  
      if (user.role !== "ADMIN" && post.authorId !== userId) {
        throw new ForbiddenError("Not authorized to delete this post");
      }
  
      await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId } }),
        prisma.like.deleteMany({ where: { postId } }),
        prisma.post.delete({ where: { id: postId } }),
      ]);
  
      return { message: "Post deleted successfully" };
    } catch (error) {
      console.error("Error deleting post:", error);
      if (error instanceof AppError) throw error; 
      throw new InternalServerError("Unable to delete post");
    }
  }
  
}

export default PostService;
