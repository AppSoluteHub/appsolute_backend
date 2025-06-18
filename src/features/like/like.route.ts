import express from 'express';
import { toggleCommentLike, toggleCommentUnLike } from './like.contoller'; 
import authenticate from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/:commentId/like', authenticate, toggleCommentLike);
router.post('/:commentId/unlike', authenticate, toggleCommentUnLike);

export default router;