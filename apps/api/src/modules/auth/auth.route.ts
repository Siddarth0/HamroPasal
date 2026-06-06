import { Router } from 'express';
import passport from 'passport';
import {
  login,
  logout,
  refreshToken,
  register,
  resendVerification,
  verifyEmail,
  googleCallback,
  requestPasswordReset,
  submitPasswordReset,
} from './auth.controller';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { env } from '@/config/env';
import './passport'; // side-effect: registers the Google strategy

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', submitPasswordReset);
router.post('/logout', authenticate, logout);

//------------Google OAuth------------
router.get(
  '/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=google`,
  }),
  googleCallback,
);

export default router;
