import { AppError, BadRequestError } from '../../../lib/appError';
import { prisma } from '../../../utils/prisma';
import { updateProductRatingStats } from '../../product/services/product.utils';

export const createReview = async (data: {
  rating: number;
  comment: string;
  title: string;
  isRecommending: boolean;
  productId: string;
  userId: string;
}) => {
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    throw new BadRequestError('User not found', 404);
  }
  
const existingReview = await prisma.review.findFirst({
    where: {
      userId: data.userId,
      productId: data.productId
    }
  });

  if (existingReview) {
    throw new BadRequestError('You have already reviewed this product. You can update your existing review instead.', 409);
  }

  const review = await prisma.review.create({ data });
  await updateProductRatingStats(data.productId);
  return review;
};

export const getAllReviews = async (options: {
  page?: number;
  limit?: number;
  productId?: string;
  userId?: string;
}) => {
  const { page = 1, limit = 10, productId, userId } = options;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (productId) {
    where.productId = productId;
  }
  if (userId) {
    where.userId = userId;
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            image: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    total,
    page,
    limit,
  };
};

export const getReviewById = async (id: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          image: true,
        },
      },
    },
  });
  if (!review) {
    throw new BadRequestError('Review not found', 404);
  }
  return review;
};

export const updateReview = async (id: string, data: { rating?: number; comment?: string }) => {
  const review = await prisma.review.update({
    where: { id },
    data,
  });
  await updateProductRatingStats(review.productId);
  return review;
};

export const deleteReview = async (id: string) => {
  const review = await prisma.review.delete({
    where: { id },
  });
  await updateProductRatingStats(review.productId);
  return review;
};