
import { PostCategory, PrismaClient } from "@prisma/client";
import { PostData, UpdatePostData } from "../../../interfaces/post.interface";

const prisma = new PrismaClient();

class PostService {
  static async createPost(userId: string, postData: PostData) {
    const { title, imageUrl, description, category,contributors, isPublished } = postData;
    const validCategory: PostCategory =
      category && Object.values(PostCategory).includes(category as PostCategory)
        ? (category as PostCategory)
        : PostCategory.TECHNOLOGY;

    try {
      const post = await prisma.post.create({
        data: {
          title,
          description,
          category: validCategory,
          authorId: userId,
          imageUrl,
          contributors,
          isPublished,
        },
      });
      return post;
    } catch (error) {
      throw PostService.formatError(error);
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
      throw PostService.formatError(error);
    }
  }

  static async getPostById(postId: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
        },
      });

      if (!post) throw { statusCode: 404, message: "Post not found" };

      return post;
    } catch (error) {
      throw PostService.formatError(error);
    }
  }

  static async updatePost(postId: string, userId: string, updateData: UpdatePostData) {
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });

      if (!post) throw { statusCode: 404, message: "Post not found" };
      if (post.authorId !== userId) throw { statusCode: 403, message: "Not authorized to update this post" };

      return await prisma.post.update({
        where: { id: postId },
        data: updateData,
      });
    } catch (error) {
      throw PostService.formatError(error);
    }
  }

  static async deletePost(postId: string, userId: string) {
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });

      if (!post) throw { statusCode: 404, message: "Post not found" };
      if (post.authorId !== userId) throw { statusCode: 403, message: "Not authorized to delete this post" };

      await prisma.post.delete({ where: { id: postId } });
      return { message: "Post deleted successfully" };
    } catch (error) {
      throw PostService.formatError(error);
    }
  }

  private static formatError(error: any) {
    if (error.statusCode && error.message) return error;
    return { statusCode: 500, message: "An unexpected error occurred" };
  }
}

export default PostService;

