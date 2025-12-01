import express from 'express';
import { AdminController } from '../controllers/admin.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect, authorize('ADMIN', 'OFFICER'));

router.get('/stats', AdminController.getDashboardStats);
router.get('/analytics', AdminController.getDashboardStats); // Alias for stats
router.get('/complaints', AdminController.getAllComplaints);
router.get('/officers', AdminController.getOfficers);
router.post('/complaints/:id/assign', AdminController.assignComplaint);
router.post('/assign-complaint', AdminController.assignComplaintAlt); // Alternative endpoint
router.get('/reports', AdminController.downloadReport);

// New routes for enhanced functionality
router.get('/feedback', AdminController.getAllFeedback);
router.patch('/officers/:officerId/department', AdminController.updateOfficerDepartment);
router.patch('/complaints/:id/department', AdminController.updateComplaintDepartment);

export default router;

