"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
const getOrders = async (userId) => {
    const orders = await prisma.order.findMany({
        where: {
            userId,
            status: { not: 'PENDING' },
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
    return orders;
};
exports.getOrders = getOrders;
const getOrderById = async (userId, orderId) => {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId,
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            billingAddress: true,
        },
    });
    if (!order) {
        throw new appError_1.BadRequestError('Order not found', 404);
    }
    return order;
};
exports.getOrderById = getOrderById;
const createOrder = async (userId, billingAddress) => {
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
    if (!cart || cart.items.length === 0) {
        throw new appError_1.BadRequestError('Cart is empty', 400);
    }
    const total = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const order = await prisma.order.create({
        data: {
            userId,
            total,
            status: 'CONFIRMED',
            items: {
                create: cart.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
            },
            billingAddress: {
                create: billingAddress,
            },
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            billingAddress: true,
        },
    });
    await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id,
        },
    });
    return order;
};
exports.createOrder = createOrder;
