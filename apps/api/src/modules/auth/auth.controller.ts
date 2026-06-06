import { Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import { env } from '@/config/env';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  verifyEmail as verifyEmailToken,
  resendVerificationEmail,
  logoutUser,
} from './auth.service';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from './auth.validation';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE, token, {
    ...refreshCookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

//-----Register----------
export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await registerUser(data);

  setRefreshCookie(res, refreshToken);
  ApiResponse.created(
    res,
    { user, accessToken },
    'Registration successful. Please check your email to verify your account.'
  );
});

//-----Login----------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await loginUser(email, password);

  setRefreshCookie(res, refreshToken);
  ApiResponse.success(res, { user, accessToken }, 'Login successful');
});

//-----Refresh----------
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
  if (!token) throw new ApiError('Refresh token not provided', 401);

  const { accessToken, refreshToken: rotated } = await refreshAccessToken(token);

  setRefreshCookie(res, rotated);
  ApiResponse.success(res, { accessToken }, 'Token refreshed');
});

//-----Verify email----------
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = verifyEmailSchema.parse(req.body);
  const { alreadyVerified } = await verifyEmailToken(token);

  ApiResponse.success(
    res,
    undefined,
    alreadyVerified ? 'Email is already verified' : 'Email verified successfully'
  );
});

//-----Resend verification----------
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = resendVerificationSchema.parse(req.body);
  await resendVerificationEmail(email);

  ApiResponse.success(
    res,
    undefined,
    'If an account exists for that email, a verification link has been sent.'
  );
});

//-----Logout----------
export const logout = asyncHandler(async (req, res) => {
  if (req.user) await logoutUser(req.user.userId);

  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
  ApiResponse.success(res, undefined, 'Logged out successfully');
});
