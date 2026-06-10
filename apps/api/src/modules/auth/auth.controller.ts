import { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import { env } from '@/config/env';
import type { Audience } from '@/shared/utils/jwt';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  verifyEmailOtp,
  resendOtp,
  logoutUser,
  createSession,
  forgotPassword,
  resetPassword,
  changePassword,
} from './auth.service';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.validation';

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// Per-app cookie name so the three front-ends don't share one refresh token.
const cookieName = (scope: Audience): string => `rt_${scope}`;

// Map the (browser-set, unspoofable) Origin to an app audience. Unknown/missing
// origin → 'web' (least privilege), so a stray request can never act as admin.
const ORIGIN_TO_AUDIENCE: Record<string, Audience> = {
  [env.CLIENT_URL]: 'web',
  [env.SELLER_URL]: 'seller',
  [env.ADMIN_URL]: 'admin',
};

const audienceFromRequest = (req: Request): Audience => {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  return ORIGIN_TO_AUDIENCE[origin] ?? 'web';
};

const setRefreshCookie = (res: Response, token: string, scope: Audience): void => {
  res.cookie(cookieName(scope), token, {
    ...refreshCookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

//-----Register----------
export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const scope = audienceFromRequest(req);
  const { user, accessToken, refreshToken } = await registerUser(data, scope);

  setRefreshCookie(res, refreshToken, scope);
  ApiResponse.created(
    res,
    { user, accessToken },
    'Registration successful. Check your email for the verification code.'
  );
});

//-----Login----------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const scope = audienceFromRequest(req);
  const { user, accessToken, refreshToken } = await loginUser(email, password, scope);

  setRefreshCookie(res, refreshToken, scope);
  ApiResponse.success(res, { user, accessToken }, 'Login successful');
});

//-----Refresh----------
export const refreshToken = asyncHandler(async (req, res) => {
  const scope = audienceFromRequest(req);
  const token = req.cookies?.[cookieName(scope)] ?? req.body?.refreshToken;
  if (!token) throw new ApiError('Refresh token not provided', 401);

  const { accessToken, refreshToken: rotated } = await refreshAccessToken(token, scope);

  setRefreshCookie(res, rotated, scope);
  ApiResponse.success(res, { accessToken }, 'Token refreshed');
});

//-----Verify email (OTP)----------
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = verifyEmailSchema.parse(req.body);
  const { alreadyVerified } = await verifyEmailOtp(email, otp);

  ApiResponse.success(
    res,
    undefined,
    alreadyVerified ? 'Email is already verified' : 'Email verified successfully'
  );
});

//-----Resend verification (OTP)----------
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = resendVerificationSchema.parse(req.body);
  await resendOtp(email);

  ApiResponse.success(
    res,
    undefined,
    'If an account exists for that email, a verification code has been sent.'
  );
});

//-----Forgot password (sends reset OTP)----------
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  await forgotPassword(email);

  ApiResponse.success(
    res,
    undefined,
    'If an account exists for that email, a password reset code has been sent.'
  );
});

//-----Reset password (with OTP)----------
export const submitPasswordReset = asyncHandler(async (req, res) => {
  const { email, otp, password } = resetPasswordSchema.parse(req.body);
  await resetPassword(email, otp, password);

  // Reset revokes all sessions — clear this app's now-stale refresh cookie.
  res.clearCookie(cookieName(audienceFromRequest(req)), refreshCookieOptions);
  ApiResponse.success(res, undefined, 'Password reset successfully. Please log in.');
});

//-----Change password (authenticated)----------
export const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  await changePassword(req.user!.userId, currentPassword, newPassword);

  // Sessions were revoked — clear this app's now-stale refresh cookie.
  res.clearCookie(cookieName(audienceFromRequest(req)), refreshCookieOptions);
  ApiResponse.success(res, undefined, 'Password changed. Please log in again.');
});

//-----Logout----------
export const logout = asyncHandler(async (req, res) => {
  const scope = audienceFromRequest(req);
  if (req.user) await logoutUser(req.user.userId, scope);

  res.clearCookie(cookieName(scope), refreshCookieOptions);
  ApiResponse.success(res, undefined, 'Logged out successfully');
});

//-----Google OAuth callback----------
// Reached after passport validates the Google handshake and sets req.user.
// Issues our own session, drops the refresh cookie, and bounces back to the
// customer app with the access token.
export const googleCallback = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError('Google authentication failed', 401);

  // Google OAuth is the customer storefront flow → always the 'web' audience.
  const { accessToken, refreshToken } = await createSession(req.user.userId, 'web');
  setRefreshCookie(res, refreshToken, 'web');

  res.redirect(`${env.CLIENT_URL}/auth/callback?accessToken=${accessToken}`);
});
