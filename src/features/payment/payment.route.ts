import { Router } from 'express';
import { PaymentController } from './payment.controller';
import dotenv from 'dotenv';
import authenticate from '../../middlewares/auth.middleware';

dotenv.config();

const router = Router();
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
const paymentController = new PaymentController(paystackSecretKey);

router.post('/initiate',authenticate, paymentController.initiatePayment);
router.get('/verify',authenticate, paymentController.verifyPayment);
router.post('/webhook',authenticate, paymentController.handleWebhook);
router.get('/status',authenticate, paymentController.getPaymentStatus);
router.get('/users',authenticate, paymentController.getUserDetails);

export default router;
