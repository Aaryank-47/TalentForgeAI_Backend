import { Router } from 'express';
import healthRoutes from '../modules/health/health.module.js';
import authRoutes from '../modules/auth/auth.module.js';
const router = Router();
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
export default router;
//# sourceMappingURL=index.js.map