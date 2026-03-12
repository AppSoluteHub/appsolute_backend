"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductRatingStats = void 0;
const prisma_1 = require("../../../utils/prisma");
/**
 * Recalculates the average rating and rating count for a product
 * based on both the Rating and Review tables.
 * @param productId The ID of the product to update
 */
const updateProductRatingStats = async (productId) => {
    // Fetch all ratings for this product
    const ratings = await prisma_1.prisma.rating.findMany({
        where: { productId },
        select: { value: true }
    });
    // Fetch all reviews for this product
    const reviews = await prisma_1.prisma.review.findMany({
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
    return await prisma_1.prisma.product.update({
        where: { id: productId },
        data: {
            averageRating,
            ratingCount
        }
    });
};
exports.updateProductRatingStats = updateProductRatingStats;
