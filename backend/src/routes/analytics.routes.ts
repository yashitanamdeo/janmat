import express from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect, authorize('ADMIN', 'OFFICER'));

router.get('/department-performance', AnalyticsController.getDepartmentPerformance);
router.get('/trends', AnalyticsController.getTrends);

export default router;
