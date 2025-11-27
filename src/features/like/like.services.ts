import { BadRequestError, NotFoundError } from "../../lib/appError";
import { prisma } from "../../utils/prisma";

export class LikeService {
  async toggleCommentLike(userId: string, commentId: string) {
    // Validate inputs
    if (!userId || !commentId) {
      throw new BadRequestError("userId and commentId are required");
    }

    // Check if the comment exists
    const commentExists = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!commentExists) {
      throw new NotFoundError("Comment not found");
    }

    // Check for existing like
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });

    if (!existingLike) {
      // Like the comment
      const newLike = await prisma.like.create({
        data: {
          userId,
          commentId,
        },
      });

      // Get updated like count
      const likeCount = await prisma.like.count({
        where: { commentId },
      });

      return {
        action: "liked",
        like: newLike,
        likeCount,
      };
    } else {
      // Unlike the comment
      await prisma.like.delete({
        where: {
          userId_commentId: { userId, commentId },
        },
      });

      // Get updated like count
      const likeCount = await prisma.like.count({
        where: { commentId },
      });

      return {
        action: "unliked",
        message: "Like removed successfully",
        likeCount,
      };
    }
  }

  async toggleCommentUnLike(userId: string, commentId: string) {
    // Validate inputs
    if (!userId || !commentId) {
      throw new BadRequestError("userId and commentId are required");
    }

    // Check if the comment exists
    const commentExists = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!commentExists) {
      throw new NotFoundError("Comment not found");
    }

    // Check for existing like
    const existingLike = await prisma.unlike.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });

    if (!existingLike) {
      // Like the comment
      const newLike = await prisma.unlike.create({
        data: {
          userId,
          commentId,
        },
      });

      // Get updated like count
      const likeCount = await prisma.unlike.count({
        where: { commentId },
      });

      return {
        action: "unliked",
        like: newLike,
        likeCount,
      };
    } else {
      // Unlike the comment
      await prisma.unlike.delete({
        where: {
          userId_commentId: { userId, commentId },
        },
      });

      // Get updated like count
      const likeCount = await prisma.unlike.count({
        where: { commentId },
      });

      return {
        action: "liked",
        message: "unLike removed successfully",
        likeCount,
      };
    }
  }
}
