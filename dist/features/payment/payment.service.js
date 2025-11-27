"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayStackService = void 0;
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
const prisma_1 = require("../../utils/prisma");
class PayStackService {
    constructor(secretKey) {
        this.paystackSecretKey = secretKey;
    }
    async initiatePayment(userId, orderId, amount, email) {
        try {
            if (!this.isValidCurrencyAmount(amount)) {
                throw new appError_1.BadRequestError("Amount must have at most 2 decimal places");
            }
            const amountInKobo = Math.round(amount * 100);
            const response = await axios_1.default.post("https://api.paystack.co/transaction/initialize", {
                amount: amountInKobo,
                email,
                callback_url: "http://localhost:3000/order-successful",
            }, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`,
                    "Content-Type": "application/json",
                },
            });
            const { reference } = response.data.data;
            await prisma_1.prisma.payment.upsert({
                where: { orderId },
                update: {
                    amount,
                    reference,
                    status: client_1.PaymentStatus.PENDING,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    orderId,
                    email,
                    amount,
                    reference,
                    status: client_1.PaymentStatus.PENDING,
                },
            });
            return response.data.data.authorization_url;
        }
        catch (error) {
            console.error("Payment initiation failed:", error.response?.data || error.message);
            throw new appError_1.BadRequestError(`Payment initiation failed => ${error.response?.data?.message || error.message}`, 500);
        }
    }
    isValidCurrencyAmount(amount) {
        return /^\d+(\.\d{1,2})?$/.test(amount.toFixed(2));
    }
    async verifyPayment(reference) {
        try {
            const response = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`,
                },
            });
            const { status } = response.data.data;
            const isSuccessful = status === "success";
            // Update payment and fetch linked order + user
            const payment = await prisma_1.prisma.payment.update({
                where: { reference },
                data: {
                    status: isSuccessful ? client_1.PaymentStatus.SUCCESS : client_1.PaymentStatus.FAILED,
                },
                include: {
                    order: true,
                },
            });
            // After success, confirm order and clear cart
            if (isSuccessful && payment.orderId) {
                await prisma_1.prisma.order.update({
                    where: { id: payment.orderId },
                    data: { status: "CONFIRMED" },
                });
                // Fetch user cart
                const cart = await prisma_1.prisma.cart.findFirst({
                    where: { userId: payment.order.userId },
                });
                // Clear cart items
                if (cart) {
                    await prisma_1.prisma.cartItem.deleteMany({
                        where: { cartId: cart.id },
                    });
                }
            }
            return isSuccessful;
        }
        catch (error) {
            console.error("Payment verification failed:", error.message);
            return false;
        }
    }
    async handleWebhook(payload) {
        const { event, data } = payload;
        switch (event) {
            case "charge.success":
                await prisma_1.prisma.payment.update({
                    where: { reference: data.reference },
                    data: { status: client_1.PaymentStatus.SUCCESS },
                });
                break;
            case "charge.failed":
                await prisma_1.prisma.payment.update({
                    where: { reference: data.reference },
                    data: { status: client_1.PaymentStatus.FAILED },
                });
                break;
        }
    }
    async getPaymentStatus() {
        const status = await prisma_1.prisma.payment.findMany({
            where: { status: client_1.PaymentStatus.SUCCESS },
        });
        return status;
    }
    async getUserDetails() {
        const users = await prisma_1.prisma.user.findMany({
            where: {
                payments: {
                    some: {
                        status: client_1.PaymentStatus.SUCCESS,
                    },
                },
            },
            include: {
                payments: {
                    where: {
                        status: client_1.PaymentStatus.SUCCESS,
                    },
                },
            },
        });
        return users;
    }
}
exports.PayStackService = PayStackService;
