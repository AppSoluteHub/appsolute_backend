import { z } from 'zod';

export const createReviewDto = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(1, 'Comment is required'),
  productId: z.number().int('Product ID must be an integer'),
  userId: z.string().min(1, 'User ID is required'), // Assuming userId is string from auth middleware
});

export const updateReviewDto = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  comment: z.string().min(1, 'Comment is required').optional(),
});