import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Citizen routes
router.post('/complaints/:id/feedback', protect, authorize('CITIZEN'), FeedbackController.submitFeedback);
router.put('/complaints/:id/feedback', protect, authorize('CITIZEN'), FeedbackController.updateFeedback);

// Public routes (authenticated users)
router.get('/complaints/:id/feedback', protect, FeedbackController.getFeedback);

// Admin/Officer routes
router.get('/feedbacks', protect, authorize('ADMIN', 'OFFICER'), FeedbackController.getAllFeedbacks);
router.get('/feedbacks/stats', protect, authorize('ADMIN', 'OFFICER'), FeedbackController.getFeedbackStats);

export default router;
