import express from 'express';
import {
  register,
  login,
  getMe,
  getDemoAccounts,
  resetDemoData,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/demo-accounts', getDemoAccounts);
router.post('/reset-demo', resetDemoData);

export default router;
