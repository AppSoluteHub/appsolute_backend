import { Request, Response, NextFunction } from 'express';
import { LikeService } from './like.services'; 
import { z } from 'zod';
import { BadRequestError, NotFoundError } from '../../lib/appError'; 

// Input validation schema
const toggleLikeSchema = z.object({
  commentId: z.string().uuid('Invalid comment ID'),
});

// Instantiate service
const likeService = new LikeService();

export const toggleCommentLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get userId from authenticated user
    const userId = req.user?.id; 
    if (!userId) {
      throw new BadRequestError('Unauthorized: User not authenticated');
    }

    // Validate commentId
    const { commentId } = toggleLikeSchema.parse({
      commentId: req.params.commentId,
    });

    // Call service method
    const result = await likeService.toggleCommentLike(userId, commentId);

    // Return response
    res.status(result.action === 'liked' ? 201 : 200).json({
      status: 'success',
      data: {
        action: result.action,
        like: result.like || null,
        likeCount: result.likeCount,
        message: result.message || null,
      },
    });
  } catch (error : any) {
    // Handle specific errors
    if (error instanceof BadRequestError) {
       res.status(400).json({
        status: 'error',
        message: error.message,
      });
      return
    }
    if (error instanceof NotFoundError) {
       res.status(404).json({
        status: 'error',
        message: error.message,
      });
      return;
    }
    if (error instanceof z.ZodError) {
       res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    next(error);
  }
};