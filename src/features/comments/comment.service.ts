import { PrismaClient } from "@prisma/client";
import {
  CreateCommentDto,
  UpdateCommentDto,
} from "../../interfaces/comment.interface";
import { AppError, NotFoundError } from "../../lib/appError";
// import { redisClient } from "../../config/redis";

const prisma = new PrismaClient();

export class CommentService {
  async createComment(data: CreateCommentDto) {
    const newComment = await prisma.comment.create({
      data,
      include: {
        author: { select: { fullName: true, profileImage: true } },
      },
    });

    // await redisClient.publish("new-comment", JSON.stringify(newComment));

    return newComment;
  }

  async getCommentsByPostId(postId: string, currentUserId: string) {
    try {
      if (!postId) {
        throw new AppError("postId is required", 400);
      }

      // Check if post exists
      const postExists = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!postExists) {
        throw new NotFoundError("Post not found");
      }

      // Fetch comments with likes, unlikes, and author
      const rawComments = await prisma.comment.findMany({
        where: { postId },
        select: {
          id: true,
          body: true,
          createdAt: true,
          authorId: true,
          author: {
            select: {
              fullName: true,
              profileImage: true,
            },
          },
          likes: true,
          unlikes: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Map and enrich comments
      const comments = rawComments.map((comment) => ({
        ...comment,
        numberOfLikes: comment.likes.length,
        numberOfUnlikes: comment.unlikes.length,
        isOwner: comment.authorId === currentUserId,
      }));

      return {
        comments,
        count: comments.length,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch comments", 500);
    }
  }

  async updateComment(
    commentId: string,
    authorId: string,
    data: UpdateCommentDto
  ) {
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!existingComment) {
      throw new Error("Comment not found");
    }

    if (existingComment.authorId !== authorId) {
      throw new Error("Unauthorized: You can only update your own comment");
    }
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data,
      include: {
        author: { select: { fullName: true, profileImage: true } },
      },
    });

    // await redisClient.publish("new-comment", JSON.stringify(updatedComment));

    return updatedComment;
  }

  async getCommentById(commentId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    return comment;
  }

  async deleteComment(commentId: string) {
    const deletedComment = await prisma.comment.delete({
      where: { id: commentId },
    });
    return deletedComment;
  }
}
