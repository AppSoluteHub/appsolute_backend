"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
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
