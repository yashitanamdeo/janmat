import express from 'express';
import { OfficerController } from '../controllers/officer.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect, authorize('OFFICER', 'ADMIN'));

router.get('/assigned-complaints', OfficerController.getAssignedComplaints);
router.patch('/update-status/:id', OfficerController.updateComplaintStatus);

export default router;
