import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';
import { AppError } from '../../../lib/appError';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params; // Get productId from params
    const userId = req.user?.id; // Get userId from authenticated user

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const reviewData = {
      ...req.body,
      productId: parseInt(productId),
      userId,
    };

    const review = await reviewService.createReview(reviewData);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, productId, userId } = req.query;
    const options = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      productId: productId ? parseInt(productId as string) : undefined,
      userId: userId as string,
    };
    const reviews = await reviewService.getAllReviews(options);
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.getReviewById(parseInt(req.params.id));
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.updateReview(parseInt(req.params.id), req.body);
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reviewService.deleteReview(parseInt(req.params.id));
    res.status(204).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};