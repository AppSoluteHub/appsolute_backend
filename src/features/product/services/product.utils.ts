import { prisma } from '../../../utils/prisma';

/**
 * Recalculates the average rating and rating count for a product
 * based on both the Rating and Review tables.
 * @param productId The ID of the product to update
 */
export const updateProductRatingStats = async (productId: string) => {
  // Fetch all ratings for this product
  const ratings = await prisma.rating.findMany({
    where: { productId },
    select: { value: true }
  });

  // Fetch all reviews for this product
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true }
  });

  const allRatings = [
    ...ratings.map(r => r.value),
    ...reviews.map(r => r.rating)
  ];

  const ratingCount = allRatings.length;
  const averageRating = ratingCount > 0 
    ? allRatings.reduce((acc, curr) => acc + curr, 0) / ratingCount 
    : 0;

  return await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating,
      ratingCount
    }
  });
};
