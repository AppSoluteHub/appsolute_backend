import { PrismaClient } from "@prisma/client";
import { CreateCommentDto, UpdateCommentDto } from "../../interfaces/comment.interface";
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

  async getCommentsByPostId(postId: string) {
    try {
      const comments = await prisma.comment.findMany({
        where: { postId },
        include: {
          author: { select: { fullName: true, profileImage: true }, },
          
        },
       
        orderBy: { createdAt: "desc" },
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

  async updateComment(commentId: string,authorId: string ,data: UpdateCommentDto) {
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
