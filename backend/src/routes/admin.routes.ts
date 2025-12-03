import express from 'express';
import { AdminController } from '../controllers/admin.controller';
import { QuickActionsController } from '../controllers/quickActions.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect, authorize('ADMIN', 'OFFICER'));

// Dashboard stats
router.get('/stats', AdminController.getDashboardStats);
router.get('/analytics', AdminController.getDashboardStats); // Alias for stats

// Complaint management
router.get('/complaints', AdminController.getAllComplaints);
router.post('/complaints/:id/assign', AdminController.assignComplaint);
router.post('/assign-complaint', AdminController.assignComplaintAlt); // Alternative endpoint
router.patch('/complaints/:id/department', AdminController.updateComplaintDepartment);
router.post('/complaints/search', AdminController.advancedSearch);

// Officer management
router.get('/officers', AdminController.getOfficers);
router.post('/officers', AdminController.createOfficer);
router.put('/officers/:id', AdminController.updateOfficer);
router.patch('/officers/:officerId/department', AdminController.updateOfficerDepartment);

// Department management
router.get('/departments', AdminController.getDepartments);

// Reports
router.get('/reports/weekly', AdminController.getWeeklyReport);
router.get('/reports', AdminController.downloadReport);

// Feedback
router.get('/feedback', AdminController.getAllFeedback);

// Quick Actions
router.post('/quick-actions/assign-urgent', QuickActionsController.autoAssignUrgent);
router.post('/quick-actions/balance-workload', QuickActionsController.balanceWorkload);
router.post('/quick-actions/send-reminders', QuickActionsController.sendReminders);
router.post('/quick-actions/escalate-overdue', QuickActionsController.escalateOverdue);
router.post('/quick-actions/archive-resolved', QuickActionsController.archiveResolved);

export default router;
