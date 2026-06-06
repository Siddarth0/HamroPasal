import { Router } from 'express';
import {
  login,
  logout,
  refreshToken,
  register,
  resendVerification,
  verifyEmail,
} from './auth.controller';
import { authenticate } from '@/shared/middlewares/auth.guard';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/logout', authenticate, logout);

export default router;
