"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularProducts = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const appError_1 = require("../../../lib/appError");
const prisma_1 = require("../../../utils/prisma");
const createProduct = async (data) => {
    return await prisma_1.prisma.product.create({ data });
};
exports.createProduct = createProduct;
const getAllProducts = async (options) => {
    const { page = 1, limit = 10, category, search, brand, tags } = options;
    const skip = (page - 1) * limit;
    const where = {};
    if (category) {
        where.category = category;
    }
    if (search) {
        where.title = {
            contains: search,
            mode: "insensitive",
        };
    }
    if (brand) {
        where.brand = brand;
    }
    if (tags && tags.length > 0) {
        where.tags = {
            hasSome: tags,
        };
    }
    const [products, total] = await Promise.all([
        prisma_1.prisma.product.findMany({
            where,
            skip,
            take: limit,
        }),
        prisma_1.prisma.product.count({ where }),
    ]);
    return {
        products,
        total,
        page,
        limit,
    };
};
exports.getAllProducts = getAllProducts;
const getProductById = async (id) => {
    const product = await prisma_1.prisma.product.findUnique({
        where: { id },
        include: {
            reviews: {
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            profileImage: true,
                        },
                    },
                },
            },
        },
    });
    if (!product) {
        throw new appError_1.AppError("Product not found", 404);
    }
    const relatedProducts = await prisma_1.prisma.product.findMany({
        where: {
            category: product.category,
            id: { not: product.id },
        },
        take: 4,
    });
    return {
        product,
        relatedProducts,
    };
};
exports.getProductById = getProductById;
const updateProduct = async (id, data) => {
    return await prisma_1.prisma.product.update({
        where: { id },
        data,
    });
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    return await prisma_1.prisma.product.delete({
        where: { id },
    });
};
exports.deleteProduct = deleteProduct;
const getPopularProducts = async (limit = 10) => {
    try {
        // Get products with their rating and sales data
        const products = await prisma_1.prisma.product.findMany({
            where: {
                isActive: true,
            },
            include: {
                reviews: true,
                ratings: true,
                orderItems: {
                    include: {
                        order: true,
                    },
                },
            },
        });
        // Calculate popularity score for each product
        const productsWithPopularity = products.map((product) => {
            const reviewCount = product.reviews.length;
            const ratingCount = product.ratings.length;
            const averageRating = product.averageRating || 0;
            // Calculate total sales (sum of quantities from completed orders)
            const totalSales = product.orderItems
                .filter((item) => item.order.status === 'COMPLETED')
                .reduce((sum, item) => sum + item.quantity, 0);
            // Popularity score formula:
            // - Rating weight: 40%
            // - Review count weight: 30%
            // - Sales weight: 30%
            const popularityScore = (averageRating * 0.4) +
                (Math.min(reviewCount / 10, 5) * 0.3) + // Cap review influence at 5
                (Math.min(totalSales / 5, 5) * 0.3); // Cap sales influence at 5
            return {
                ...product,
                popularityScore,
                reviewCount,
                ratingCount,
                totalSales,
            };
        });
        // Sort by popularity score (descending) and return top products
        const popularProducts = productsWithPopularity
            .sort((a, b) => b.popularityScore - a.popularityScore)
            .slice(0, limit)
            .map(({ popularityScore, reviewCount, ratingCount, totalSales, ...product }) => ({
            ...product,
            stats: {
                reviewCount,
                ratingCount,
                totalSales,
                averageRating: product.averageRating,
            },
        }));
        return popularProducts;
    }
    catch (error) {
        console.error('Error fetching popular products:', error);
        throw new appError_1.AppError('Failed to fetch popular products', 500);
    }
};
exports.getPopularProducts = getPopularProducts;
