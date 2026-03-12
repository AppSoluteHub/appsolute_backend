"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.getReviewById = exports.getAllReviews = exports.createReview = void 0;
const appError_1 = require("../../../lib/appError");
const prisma_1 = require("../../../utils/prisma");
const product_utils_1 = require("../../product/services/product.utils");
const createReview = async (data) => {
    const product = await prisma_1.prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) {
        throw new appError_1.AppError('Product not found', 404);
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
        throw new appError_1.BadRequestError('User not found', 404);
    }
    const existingReview = await prisma_1.prisma.review.findFirst({
        where: {
            userId: data.userId,
            productId: data.productId
        }
    });
    if (existingReview) {
        throw new appError_1.BadRequestError('You have already reviewed this product. You can update your existing review instead.', 409);
    }
    const review = await prisma_1.prisma.review.create({ data });
    await (0, product_utils_1.updateProductRatingStats)(data.productId);
    return review;
};
exports.createReview = createReview;
const getAllReviews = async (options) => {
    const { page = 1, limit = 10, productId, userId } = options;
    const skip = (page - 1) * limit;
    const where = {};
    if (productId) {
        where.productId = productId;
    }
    if (userId) {
        where.userId = userId;
    }
    const [reviews, total] = await Promise.all([
        prisma_1.prisma.review.findMany({
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
        prisma_1.prisma.review.count({ where }),
    ]);
    return {
        reviews,
        total,
        page,
        limit,
    };
};
exports.getAllReviews = getAllReviews;
const getReviewById = async (id) => {
    const review = await prisma_1.prisma.review.findUnique({
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
        throw new appError_1.BadRequestError('Review not found', 404);
    }
    return review;
};
exports.getReviewById = getReviewById;
const updateReview = async (id, data) => {
    const review = await prisma_1.prisma.review.update({
        where: { id },
        data,
    });
    await (0, product_utils_1.updateProductRatingStats)(review.productId);
    return review;
};
exports.updateReview = updateReview;
const deleteReview = async (id) => {
    const review = await prisma_1.prisma.review.delete({
        where: { id },
    });
    await (0, product_utils_1.updateProductRatingStats)(review.productId);
    return review;
};
exports.deleteReview = deleteReview;
