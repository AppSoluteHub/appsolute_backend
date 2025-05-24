// src/routes/dashboard.ts
import { Router } from 'express';
import { getDashboardSummary } from '../dashboard/dashboard.controller.';

const router = Router();
router.get('/summary', getDashboardSummary);

export default router;
