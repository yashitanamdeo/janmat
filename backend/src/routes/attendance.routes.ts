import express from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Officer routes
router.post('/check-in', AttendanceController.checkIn);
router.post('/check-out', AttendanceController.checkOut);
router.get('/my-attendance', AttendanceController.getMyAttendance);
router.get('/today', AttendanceController.getTodayStatus);

// Admin routes
router.get('/all', authorize('ADMIN'), AttendanceController.getAllAttendance);

export default router;
