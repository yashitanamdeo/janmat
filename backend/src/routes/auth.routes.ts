import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/verify', AuthController.verify);
router.post('/login', AuthController.login);
router.get('/profile', protect, AuthController.getProfile);
router.put('/profile', protect, AuthController.updateProfile);

export default router;
