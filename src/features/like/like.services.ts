import { PrismaClient } from '@prisma/client';
import { BadRequestError, DuplicateError } from '../../lib/appError';

const prisma = new PrismaClient();

export class LikeService {

  async likePost(userId: string, postId: string) {
   
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (existingLike) {
      throw new DuplicateError("You have already liked this post.");
    }

    const newLike = await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    return newLike;
  }

 
  async unlikePost(userId: string, postId: string) {
    // Check if the like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (!existingLike) {
      throw new BadRequestError("You have not liked this post yet.");
    }

    // Delete the like
    await prisma.like.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });

    return { message: "Like removed successfully." };
  }
}
