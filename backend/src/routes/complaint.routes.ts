import express from 'express';
import { ComplaintController } from '../controllers/complaint.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';

const router = express.Router();

router.post('/', protect, upload.array('files', 5), ComplaintController.create);
router.get('/', protect, ComplaintController.getMyComplaints);
router.get('/my-complaints', protect, ComplaintController.getMyComplaints);
router.get('/:id', protect, ComplaintController.getComplaint);
router.put('/:id', protect, ComplaintController.updateComplaint);
router.delete('/:id', protect, ComplaintController.deleteComplaint);
router.patch('/:id/status', protect, authorize('OFFICER', 'ADMIN'), ComplaintController.updateStatus);

export default router;
