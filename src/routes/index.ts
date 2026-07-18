import { Router } from 'express';
import healthRoutes from '../modules/health/health.module.js';
import authRoutes from '../modules/auth/auth.module.js';
import companyRoutes from '../modules/company/company.module.js';
import jobRoutes from '../modules/jobs/routes/jobs.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use("/companies", companyRoutes);
router.use("/jobs", jobRoutes);

export default router;