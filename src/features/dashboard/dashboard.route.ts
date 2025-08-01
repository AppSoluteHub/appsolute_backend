import { Router } from 'express';
import { getDashboardSummary } from '../dashboard/dashboard.controller.';
import authenticate, { isAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/summary',authenticate, isAdmin, getDashboardSummary);

export default router;
