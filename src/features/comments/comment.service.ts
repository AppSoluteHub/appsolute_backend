import { PrismaClient } from "@prisma/client";
import { CreateCommentDto, UpdateCommentDto } from "../../interfaces/comment.interface";
import { AppError, NotFoundError } from "../../lib/appError";
const  prisma = new PrismaClient();

export class CommentService {

 
  async createComment(data: CreateCommentDto) {
    return await prisma.comment.create({
      data,
    });
  }


 
  async getCommentsByPostId(postId: string) {
    try {
      const comments = await prisma.comment.findMany({
        where: { postId },
        include: {
          author: { select: { fullName: true, profileImage: true } }, 
        },
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
  
  
  async updateComment(comentId: string, data: UpdateCommentDto) {
    return await prisma.comment.update({
      where: { id: comentId },
      data,
    });
  }

 
  async deleteComment(commentId: string) {
    return await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
