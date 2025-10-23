"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderByShareToken = exports.generateShareableOrderLink = exports.createOrder = exports.getOrderById = exports.getUsersOrders = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
const getUsersOrders = async (userId) => {
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
            billingAddress: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return orders;
};
exports.getUsersOrders = getUsersOrders;
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
    return await prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findFirst({
            where: { userId },
            include: {
                items: { include: { product: true } },
            },
        });
        if (!cart || cart.items.length === 0) {
            throw new appError_1.BadRequestError("Cart is empty", 400);
        }
        const subtotal = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
        const discount = cart.items.reduce((acc, item) => acc + (item.product.price * (item.product.discount || 0) / 100 * item.quantity), 0);
        const totalBeforeVat = subtotal - discount;
        const vat = totalBeforeVat * 0.075;
        const total = totalBeforeVat + vat;
        const { userId: _ignore, ...billingData } = billingAddress;
        const order = await tx.order.create({
            data: {
                userId,
                total,
                vat,
                discount,
                status: "PROCESSING",
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                },
                billingAddress: {
                    create: {
                        ...billingData,
                        user: {
                            connect: { id: userId },
                        },
                    },
                },
            },
            include: {
                items: { include: { product: true } },
                billingAddress: true,
            },
        });
        // await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return order;
    }, {
        timeout: 10000,
    });
};
exports.createOrder = createOrder;
const generateShareableOrderLink = async (userId, orderId) => {
    // Find the order
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
    });
    if (!order) {
        throw new appError_1.BadRequestError("Order not found or you do not have access", 404);
    }
    // Generate a unique token
    const token = crypto_1.default.randomBytes(16).toString("hex");
    // Save token in the order
    await prisma.order.update({
        where: { id: orderId },
        data: { shareToken: token },
    });
    // Return shareable URL
    const url = `${process.env.FRONTEND_URL}/shared-order/${token}`;
    return { success: true, url };
};
exports.generateShareableOrderLink = generateShareableOrderLink;
// Fetch order by share token
const getOrderByShareToken = async (token) => {
    const order = await prisma.order.findFirst({
        where: { shareToken: token },
        include: {
            items: { include: { product: true } },
        },
    });
    if (!order) {
        throw new appError_1.BadRequestError("Invalid or expired share link", 404);
    }
    return order;
};
exports.getOrderByShareToken = getOrderByShareToken;
