import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createProductDto, updateProductDto } from '../dto/product.dto';
import authenticate, { isAdmin } from '../../../middlewares/auth.middleware';
import upload from '../../../config/multer'; 
import { validateFile } from '../../../middlewares/validateFile'; 

const router = Router();

router.post(
  '/',
  authenticate,
  isAdmin,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]),
  validateFile, // File validation middleware
  validateRequest(createProductDto),
  productController.createProduct
);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.patch(
  '/:id',
  authenticate,
  isAdmin,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), 
  validateFile, 
  validateRequest(updateProductDto),
  productController.updateProduct
);
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);

export default router;