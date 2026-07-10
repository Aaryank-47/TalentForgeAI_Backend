import { Router } from 'express';
import healthRoutes from '../modules/health/health.module.js';
import authRoutes from '../modules/auth/auth.module.js';
import companyRoutes from '../modules/company/company.module.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use("/companies", companyRoutes);

export default router;