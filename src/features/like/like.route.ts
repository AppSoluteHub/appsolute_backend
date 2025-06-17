import express from 'express';
import { toggleCommentLike } from './like.contoller'; 
import authenticate from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/:commentId/like', authenticate, toggleCommentLike);

export default router;