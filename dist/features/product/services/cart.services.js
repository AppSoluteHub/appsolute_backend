"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartItemCount = exports.clearCart = exports.updateCartItemQuantity = exports.removeFromCart = exports.addToCart = exports.getCart = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
const getCart = async (userId) => {
    const cart = await prisma.cart.findFirst({
        where: {
            userId,
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
    if (!cart) {
        return null;
    }
    // Calculate and update subtotal and total
    const subtotal = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    // Update cart totals in database
    await prisma.cart.update({
        where: { id: cart.id },
        data: {
            subtotal,
            total: subtotal,
        },
    });
    // Related products based on categories of items in cart
    const categories = cart.items.map(item => item.product.category);
    const uniqueCategories = [...new Set(categories)];
    const productIds = cart.items.map((item) => item.productId);
    let relatedProducts = [];
    if (uniqueCategories.length > 0) {
        relatedProducts = await prisma.product.findMany({
            where: {
                category: { in: uniqueCategories },
                id: { notIn: productIds },
            },
            take: 4,
        });
    }
    return {
        ...cart,
        subtotal,
        total: subtotal,
        relatedProducts,
    };
};
exports.getCart = getCart;
const addToCart = async (userId, productId, quantity = 1) => {
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId,
                subtotal: 0,
                total: 0,
            },
        });
    }
    // Ensure product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product)
        throw new appError_1.BadRequestError('Product not found', 404);
    // Check if product already in cart
    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId },
    });
    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
        });
    }
    else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
            },
        });
    }
    return (0, exports.getCart)(userId);
};
exports.addToCart = addToCart;
const removeFromCart = async (userId, cartItemId) => {
    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart)
        throw new appError_1.BadRequestError('Cart not found', 404);
    const item = await prisma.cartItem.findFirst({
        where: {
            id: cartItemId,
            cartId: cart.id, // Extra security check
        }
    });
    if (!item)
        throw new appError_1.BadRequestError('Item not found in cart', 404);
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return (0, exports.getCart)(userId);
};
exports.removeFromCart = removeFromCart;
// Additional helper functions you might need:
const updateCartItemQuantity = async (userId, cartItemId, quantity) => {
    if (quantity <= 0) {
        return (0, exports.removeFromCart)(userId, cartItemId);
    }
    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart)
        throw new appError_1.BadRequestError('Cart not found', 404);
    const item = await prisma.cartItem.findFirst({
        where: {
            id: cartItemId,
            cartId: cart.id,
        },
    });
    if (!item)
        throw new appError_1.BadRequestError('Item not found in cart', 404);
    await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
    });
    return (0, exports.getCart)(userId);
};
exports.updateCartItemQuantity = updateCartItemQuantity;
const clearCart = async (userId) => {
    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart)
        throw new appError_1.BadRequestError('Cart not found', 404);
    await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
    });
    await prisma.cart.update({
        where: { id: cart.id },
        data: {
            subtotal: 0,
            total: 0,
        },
    });
    return (0, exports.getCart)(userId);
};
exports.clearCart = clearCart;
const getCartItemCount = async (userId) => {
    const cart = await prisma.cart.findFirst({
        where: { userId },
        include: { items: true },
    });
    if (!cart)
        return 0;
    return cart.items.reduce((acc, item) => acc + item.quantity, 0);
};
exports.getCartItemCount = getCartItemCount;
