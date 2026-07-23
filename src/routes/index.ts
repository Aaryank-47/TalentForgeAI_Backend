import { Router } from 'express';
import healthRoutes from '../modules/health/health.module.js';
import authRoutes from '../modules/auth/auth.module.js';
import companyRoutes from '../modules/company/company.module.js';
import jobRoutes from '../modules/jobs/routes/jobs.routes.js';
import candidateRoutes from '../modules/candidate/routes/candidate.routes.js';
import candidatesRoutes from '../modules/candidate/routes/candidates.routes.js';
import applicationRoutes from '../modules/application/routes/application.C.routes.js';
const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use("/companies", companyRoutes);
router.use("/jobs", jobRoutes);
router.use("/candidate", candidateRoutes);
router.use("/candidates", candidatesRoutes);
router.use("/applications", applicationRoutes)

export default router;