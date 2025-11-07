// src/routes/dashboard.routes.ts
import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// This single endpoint provides all data for the dashboard
router.get('/', protect, getDashboardData);

export default router;