"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateProduct = void 0;
const appError_1 = require("../../../lib/appError");
const prisma_1 = require("../../../utils/prisma");
const product_utils_1 = require("./product.utils");
const rateProduct = async (data) => {
    const { value, productId, userId } = data;
    if (value < 1 || value > 5) {
        throw new appError_1.BadRequestError('Rating value must be between 1 and 5');
    }
    const product = await prisma_1.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
        throw new appError_1.AppError('Product not found', 404);
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new appError_1.AppError('User not found', 404);
    }
    await prisma_1.prisma.rating.upsert({
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
    return await (0, product_utils_1.updateProductRatingStats)(productId);
};
exports.rateProduct = rateProduct;
