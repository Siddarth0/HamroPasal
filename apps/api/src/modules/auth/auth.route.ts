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
  changeMyPassword,
} from './auth.controller';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authLimiter } from '@/shared/middlewares/rate-limit';
import { env } from '@/config/env';
import { isGoogleOAuthConfigured } from './passport'; // side-effect: registers the Google strategy

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', authLimiter, requestPasswordReset);
router.post('/reset-password', authLimiter, submitPasswordReset);
router.post('/change-password', authenticate, changeMyPassword);
router.post('/logout', authenticate, logout);

//------------Google OAuth------------
// Short-circuits with 503 when Google creds aren't configured (strategy unregistered).
const requireGoogleConfigured: import('express').RequestHandler = (_req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    res.status(503).json({ success: false, message: 'Google sign-in is not configured' });
    return;
  }
  next();
};

router.get(
  '/google',
  requireGoogleConfigured,
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  requireGoogleConfigured,
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=google`,
  }),
  googleCallback,
);

export default router;
