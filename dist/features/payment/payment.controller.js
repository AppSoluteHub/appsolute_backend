"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
class PaymentController {
    constructor(secretKey) {
        this.paystackService = new payment_service_1.PayStackService(secretKey);
    }
    async initiatePayment(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const { orderId, amount, email } = req.body;
            const paymentUrl = await this.paystackService.initiatePayment(userId, orderId, amount, email);
            res.json({ paymentUrl });
        }
        catch (error) {
            res.status(500).json({
                error: 'Payment initiation failed',
                message: error.message
            });
        }
    }
    async verifyPayment(req, res) {
        try {
            const { reference } = req.query;
            const isVerified = await this.paystackService.verifyPayment(reference);
            res.json({ verified: isVerified });
        }
        catch (error) {
            res.status(500).json({
                error: 'Payment verification failed',
                message: error.message
            });
        }
    }
    async handleWebhook(req, res) {
        try {
            await this.paystackService.handleWebhook(req.body);
            res.status(200).send('Webhook received');
        }
        catch (error) {
            res.status(500).send('Webhook processing failed');
        }
    }
    async getPaymentStatus(req, res) {
        try {
            const status = await this.paystackService.getPaymentStatus();
            res.json({
                message: 'Payment status fetched successfully',
                length: status.length,
                status
            });
        }
        catch (error) {
            console.error('Error fetching payment status:', error);
            res.status(500).json({ message: 'Error fetching payment status', error });
        }
    }
    async getUserDetails(req, res) {
        try {
            const users = await this.paystackService.getUserDetails();
            res.status(200).json({
                message: 'Users fetched successfully',
                length: users.length,
                users
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching users', error });
        }
    }
}
exports.PaymentController = PaymentController;
