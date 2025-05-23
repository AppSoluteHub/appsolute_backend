import express from 'express';
import * as tagController from '../tags/tag.controller';
import authenticate, { isAdmin, isSuperAdmin } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/',authenticate,isAdmin, tagController.createTagController);
router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);
router.patch('/:id',authenticate,isAdmin,tagController.updateTag);
router.delete('/:id',authenticate,isAdmin,tagController.deleteTagController);

export default router;
