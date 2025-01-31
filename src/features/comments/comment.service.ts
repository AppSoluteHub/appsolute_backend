import { PrismaClient } from "@prisma/client";
import { CreateCommentDto, UpdateCommentDto } from "../../interfaces/comment.interface";
const  prisma = new PrismaClient();

export class CommentService {

 
  async createComment(data: CreateCommentDto) {
    return await prisma.comment.create({
      data,
    });
  }


  async getCommentsByPostId(postId: string) {
    return await prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { fullName: true, profileImage: true } }, 
      },
    });
  }

  
  async updateComment(commentId: string, data: UpdateCommentDto) {
    return await prisma.comment.update({
      where: { id: commentId },
      data,
    });
  }

 
  async deleteComment(commentId: string) {
    return await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
