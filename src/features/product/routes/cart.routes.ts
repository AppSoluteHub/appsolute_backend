
import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import authenticate from '../../../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, cartController.getCartController);
router.post('/', authenticate, cartController.addToCartController);
router.delete('/:cartItemId',authenticate , cartController.removeFromCartController);

export default router;
