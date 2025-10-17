import { Router } from 'express';
import { PaymentController } from './payment.controller';
import dotenv from 'dotenv';
import authenticate from '../../middlewares/auth.middleware';

dotenv.config();

const router = Router();
const paystackSecretKey = process.env.PAYSTACK_SECRETE_KEY! || '';
const paymentController = new PaymentController(paystackSecretKey);

router.post('/initiate', authenticate,paymentController.initiatePayment.bind(paymentController));
router.get('/verify', paymentController.verifyPayment.bind(paymentController));
router.post('/webhook', paymentController.handleWebhook.bind(paymentController));
router.get('/status', paymentController.getPaymentStatus.bind(paymentController));
router.get('/users', paymentController.getUserDetails.bind(paymentController));

export default router;
