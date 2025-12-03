import express from 'express';
import { LeaveController } from '../controllers/leave.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Officer routes
router.post('/apply', LeaveController.applyLeave);
router.get('/my-leaves', LeaveController.getMyLeaves);
router.delete('/:id', LeaveController.cancelLeave);

// Admin routes
router.get('/all', authorize('ADMIN'), LeaveController.getAllLeaves);
router.post('/:id/approve', authorize('ADMIN'), LeaveController.approveLeave);
router.post('/:id/reject', authorize('ADMIN'), LeaveController.rejectLeave);

export default router;
