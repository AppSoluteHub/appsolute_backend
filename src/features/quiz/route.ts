import express from 'express';
import { getQuestion, postAttempt } from './contoller';
import authenticate from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/question', getQuestion);
router.post('/question/:number/attempt',authenticate, postAttempt);

export default router;
