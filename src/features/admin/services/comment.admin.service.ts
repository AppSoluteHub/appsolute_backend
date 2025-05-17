import { PrismaClient } from "@prisma/client";
import { CreateCommentDto, UpdateCommentDto } from "../../../interfaces/comment.interface";
import { AppError, NotFoundError } from "../../../lib/appError";
// import { redisClient } from "../../config/redis"; 

const prisma = new PrismaClient();

export class CommentService {
    async getCommentsByPostId(postId: string) {
        try {
          const comments = await prisma.comment.findMany({
            where: { postId },
            select: {
              body: true,
              author: {
                select: {
                  fullName: true,
                  profileImage: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
          });
      
          if (comments.length === 0) {
            throw new NotFoundError("No comments found for this post");
          }
      
          return comments;
        } catch (error) {
          if (error instanceof AppError) throw error;
          throw new Error("Failed to fetch comments");
        }
      }
      
    async getCommentsByUserId(userId: string) {
        try {
          const comments = await prisma.comment.findMany({
            where: { authorId: userId },
            select: {
              body: true,
              author: {
                select: {
                  fullName: true,
                  profileImage: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
          });
      
          if (comments.length === 0) {
            throw new NotFoundError("No comments found for this user");
          }
      
          return comments;
        } catch (error) {
          if (error instanceof AppError) throw error;
          throw new Error("Failed to fetch comments");
        }
      }
      

  async updateComment(commentId: string, data: UpdateCommentDto) {
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

  async deleteComment(commentId: string) {
    const deletedComment = await prisma.comment.delete({
      where: { id: commentId },
    });

 
    // await redisClient.publish("delete-comment", JSON.stringify({ commentId }));

    return deletedComment;
  }
}
