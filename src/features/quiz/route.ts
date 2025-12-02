import express from 'express';
import { getQuestion, postAttempt, seedQuizQuestions, configureQuiz, getConfiguration } from './controller';
import authenticate, { isAdmin } from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/question', getQuestion);
router.post('/question/:number/attempt',authenticate, postAttempt);

router.post('/seed', authenticate, seedQuizQuestions);
router.post('/configure', authenticate,isAdmin, configureQuiz);
router.get('/configure', authenticate,isAdmin, getConfiguration);


export default router;