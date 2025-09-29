import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';
import { AppError } from '../../../lib/appError';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params; 
    console.log(productId)
  const userId = req.user?.id as string;
    

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const reviewData = {
      ...req.body,
      productId,
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
      productId: productId ? productId as string : undefined,
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
    const review = await reviewService.getReviewById(req.params.id);
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.updateReview(req.params.id, req.body);
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reviewService.deleteReview(req.params.id);
    res.status(204).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};