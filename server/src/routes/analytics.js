import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/overview', analyticsController.overview);
router.get('/sources', analyticsController.leadsBySource);
router.get('/funnel', analyticsController.conversionFunnel);
router.get('/revenue', analyticsController.revenue);
router.get('/team', analyticsController.teamPerformance);
router.get('/trends', analyticsController.leadsTrend);

export default router;
