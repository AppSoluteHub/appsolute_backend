import express from 'express';
import { BehaviorController } from './controller';
import authenticate from '../../middlewares/auth.middleware';

const userBahaviourRoutes = express.Router();
const behaviorController = new BehaviorController();

userBahaviourRoutes.post('/track-view',authenticate, behaviorController.trackHomepageView.bind(behaviorController));

export default userBahaviourRoutes;