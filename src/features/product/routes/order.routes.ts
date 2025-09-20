
import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import authenticate from '../../../middlewares/auth.middleware';

const router = Router();

router.get('/',authenticate, orderController.getOrdersController);
router.get('/:orderId',authenticate, orderController.getOrderByIdController);
router.post('/', authenticate, orderController.createOrderController);
router.post("/:orderId/share-link", authenticate, orderController.shareOrderLink);
router.get("/shared/:token", orderController.viewSharedOrder);

export default router;
