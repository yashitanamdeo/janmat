import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// All analytics routes are protected and for Admin/Officer only
router.use(protect, authorize('ADMIN', 'OFFICER'));

router.get('/trends', AnalyticsController.getComplaintTrends);
router.get('/department-performance', AnalyticsController.getDepartmentPerformance);
router.get('/status-distribution', AnalyticsController.getStatusDistribution);
router.get('/urgency-distribution', AnalyticsController.getUrgencyDistribution);

export default router;
