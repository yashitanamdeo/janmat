import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (authenticated users can view departments)
router.get('/', protect, DepartmentController.getAllDepartments);
router.get('/:id', protect, DepartmentController.getDepartment);
router.get('/:id/officers', protect, DepartmentController.getDepartmentOfficers);

// Admin-only routes
router.post('/', protect, authorize('ADMIN'), DepartmentController.createDepartment);
router.put('/:id', protect, authorize('ADMIN'), DepartmentController.updateDepartment);
router.delete('/:id', protect, authorize('ADMIN'), DepartmentController.deleteDepartment);
router.post('/assign-officer', protect, authorize('ADMIN'), DepartmentController.assignOfficerToDepartment);

export default router;
