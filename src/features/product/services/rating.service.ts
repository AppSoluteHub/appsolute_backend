import { AppError, BadRequestError } from '../../../lib/appError';
import { prisma } from '../../../utils/prisma';
import { updateProductRatingStats } from './product.utils';

export const rateProduct = async (data: {
  value: number;
  productId: string;
  userId: string;
}) => {
  const { value, productId, userId } = data;

  if (value < 1 || value > 5) {
    throw new BadRequestError('Rating value must be between 1 and 5');
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await prisma.rating.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: { value },
    create: {
      userId,
      productId,
      value,
    },
  });

  return await updateProductRatingStats(productId);
};
