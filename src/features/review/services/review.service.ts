import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../lib/appError';

const prisma = new PrismaClient();

export const createReview = async (data: {
  rating: number;
  comment: string;
  productId: number;
  userId: string;
}) => {
  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return await prisma.review.create({ data });
};

export const getAllReviews = async (options: {
  page?: number;
  limit?: number;
  productId?: number;
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

export const getReviewById = async (id: number) => {
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
    throw new AppError('Review not found', 404);
  }
  return review;
};

export const updateReview = async (id: number, data: { rating?: number; comment?: string }) => {
  return await prisma.review.update({
    where: { id },
    data,
  });
};

export const deleteReview = async (id: number) => {
  return await prisma.review.delete({
    where: { id },
  });
};