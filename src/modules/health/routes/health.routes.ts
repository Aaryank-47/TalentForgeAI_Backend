import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';

const router = Router();

router.get('/server', HealthController.serverHealth);
router.get('/database', HealthController.databaseHealth);

export default router;