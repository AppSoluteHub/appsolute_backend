import express from 'express';
import { getQuestion, postAttempt, updateQuizConfig } from './controller';
import authenticate, { isAdmin } from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/question/:number', authenticate, getQuestion);
router.post('/question/:number/attempt', authenticate, postAttempt);
router.put('/config', authenticate, isAdmin, updateQuizConfig);

export default router;

