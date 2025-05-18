import express from 'express';
import * as categoryController from '../category/cat.controller';
import authenticate, { isAdmin } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authenticate,isAdmin, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.patch('/:id', authenticate, isAdmin, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
