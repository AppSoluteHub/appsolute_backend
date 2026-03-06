import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createProductDto, updateProductDto } from '../dto/product.dto';
import authenticate, { isAdmin } from '../../../middlewares/auth.middleware';
import * as ratingController from '../controllers/rating.controller';
import upload from '../../../config/multer'; 
import { validateFile } from '../../../middlewares/validateFile'; 

const router = Router();

router.post(
  '/',
  authenticate,
  isAdmin,
  validateRequest(createProductDto),
  productController.createProduct
);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.patch(
  '/:id',
  authenticate,
  isAdmin,
  validateRequest(updateProductDto),
  productController.updateProduct
);
router.delete('/:id', authenticate, productController.deleteProduct);
router.post('/:id/rate', authenticate,ratingController.rateProduct);
router.get('/popular', productController.getPopularProducts);

export default router;