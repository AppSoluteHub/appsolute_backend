import { PostCategory, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class PostService {
  /**
   * Create a new post
   * @param {string} userId - ID of the authenticated user
   * @param {Object} postData - Details of the post to be created
   */

  static async createPost(userId: string, postData: { title: string; imageUrl: string;  description: string; category?: string; isPublished?: boolean }) {
    try {
      const { title, imageUrl, description, category, isPublished } = postData;
  
      const validCategory: PostCategory = category && Object.values(PostCategory).includes(category as PostCategory)
        ? (category as PostCategory)
        : PostCategory.TECHNOLOGY;  
  
     
      const post = await prisma.post.create({
        data: {
          title,
          description,
          category: validCategory,  
          authorId: userId,
          imageUrl, 
        },
      });
  
      return post;
    } catch (error: any) {
      console.error("Error creating post:", error);
      throw PostService.formatError(error);
    }
  }
  

  
  /**
   * Retrieve all posts
   * @param {boolean} publishedOnly 
   */
  static async getAllPosts(publishedOnly: boolean = true) {
    try {
      const posts = await prisma.post.findMany({
        where: publishedOnly ? { isPublished: true } : undefined, 
        include: {
          author: { select: { id: true, fullName: true, email: true } },
        },
      });
  
      return posts;
    } catch (error: any) {
      console.error("Error retrieving posts:", error);
      throw PostService.formatError(error);
    }
  }
  

  /**
   * Retrieve a single post by ID
   * @param {string} postId - 
   */
  static async getPostById(postId: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
        },
      });

      if (!post) {
        throw { statusCode: 404, message: "Post not found" };
      }

      return post;
    } catch (error: any) {
      console.error("Error retrieving post:", error);
      throw PostService.formatError(error);
    }
  }

  /**
   * Update a post
   * @param {string} postId 
   * @param {string} userId 
   * @param {Object} updateData 
   */
  static async updatePost(postId: string, userId: string, updateData: { title?: string; imageUrl?: string; description?: string; isPublished?: boolean }) {
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });

      if (!post) {
        throw { statusCode: 404, message: "Post not found" };
      }

      if (post.authorId !== userId) {
        throw { statusCode: 403, message: "You are not authorized to update this post" };
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: updateData,
      });

      return updatedPost;
    } catch (error: any) {
      console.error("Error updating post:", error);
      throw PostService.formatError(error);
    }
  }

  /**
   * Delete a post
   * @param {string} postId - ID of the post to delete
   * @param {string} userId - ID of the authenticated user
   */
  static async deletePost(postId: string, userId: string) {
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });

      if (!post) {
        throw { statusCode: 404, message: "Post not found" };
      }

      if (post.authorId !== userId) {
        throw { statusCode: 403, message: "You are not authorized to delete this post" };
      }

      await prisma.post.delete({ where: { id: postId } });

      return { message: "Post deleted successfully" };
    } catch (error: any) {
      console.error("Error deleting post:", error);
      throw PostService.formatError(error);
    }
  }

  /**
   * Format and normalize errors
   */
  private static formatError(error: any) {
    if (error.statusCode && error.message) {
      return error;
    }

    console.error("Unexpected error:", error);
    return { statusCode: 500, message: "An unexpected error occurred" };
  }
}

export default PostService;
