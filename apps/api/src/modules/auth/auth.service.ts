import { randomInt } from 'node:crypto';
import { prisma } from '@/config/db.postgres';
import { redis } from '@/config/redis';
import { ApiError } from '@/shared/utils/api-error';
import { comparePassword, hashPassword } from '@/shared/utils/bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/shared/utils/jwt';
import {
  sendOtpEmail,
  sendPasswordResetEmail,
} from '@/modules/notifications/email.service';
import type { Role } from '@/generated/prisma';

/* ------------------------------------------------------------------ */
/* Constants & Redis keys                                             */
/* ------------------------------------------------------------------ */

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days, matches refresh JWT
const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

type OtpPurpose = 'verify' | 'pwreset';

const refreshKey = (userId: string) => `auth:refresh:${userId}`;
const otpKey = (purpose: OtpPurpose, email: string) =>
  `auth:otp:${purpose}:${email.toLowerCase()}`;
const otpAttemptsKey = (purpose: OtpPurpose, email: string) =>
  `auth:otp:attempts:${purpose}:${email.toLowerCase()}`;

// Single source of truth for the user fields safe to return to clients.
const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatarUrl: true,
  role: true,
  isEmailVerified: true,
  createdAt: true,
} as const;

/* ------------------------------------------------------------------ */
/* Session helpers (refresh token lives in Redis, single session)     */
/* ------------------------------------------------------------------ */

/** Issues a fresh access+refresh pair and persists the refresh token in Redis. */
export const createSession = async (userId: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  await redis.set(refreshKey(userId), refreshToken, 'EX', REFRESH_TTL_SECONDS);
  return { accessToken, refreshToken };
};

/* ------------------------------------------------------------------ */
/* OTP helpers                                                        */
/* ------------------------------------------------------------------ */

/** Generates a 6-digit OTP, stores it (with TTL) under the given purpose, and returns it. */
const generateAndStoreOtp = async (
  purpose: OtpPurpose,
  email: string,
): Promise<string> => {
  const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
  await redis.set(otpKey(purpose, email), otp, 'EX', OTP_TTL_SECONDS);
  await redis.del(otpAttemptsKey(purpose, email)); // reset attempt counter on reissue
  return otp;
};

/**
 * Validates an OTP for the given purpose with brute-force protection, then
 * consumes it (deletes the code + attempt counter) on success.
 * Throws ApiError on missing/expired/invalid code or too many attempts.
 */
const consumeOtp = async (
  purpose: OtpPurpose,
  email: string,
  otp: string,
): Promise<void> => {
  const stored = await redis.get(otpKey(purpose, email));
  if (!stored) throw new ApiError('Code expired or not found', 400);

  const attempts = await redis.incr(otpAttemptsKey(purpose, email));
  if (attempts === 1) await redis.expire(otpAttemptsKey(purpose, email), OTP_TTL_SECONDS);
  if (attempts > MAX_OTP_ATTEMPTS) {
    await redis.del(otpKey(purpose, email), otpAttemptsKey(purpose, email));
    throw new ApiError('Too many incorrect attempts. Please request a new code.', 429);
  }

  if (stored !== otp) throw new ApiError('Invalid code', 400);

  await redis.del(otpKey(purpose, email), otpAttemptsKey(purpose, email));
};

/* ------------------------------------------------------------------ */
/* Register                                                           */
/* ------------------------------------------------------------------ */

export const registerUser = async (data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: Role;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ApiError('Email already in use', 409);

  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: publicUserSelect,
  });

  const otp = await generateAndStoreOtp('verify', user.email);
  // sendOtpEmail swallows its own errors, so a mail outage never blocks signup.
  await sendOtpEmail(user.email, otp, OTP_TTL_MINUTES);

  const { accessToken, refreshToken } = await createSession(user.id);

  return { user, accessToken, refreshToken };
};

/* ------------------------------------------------------------------ */
/* Login                                                              */
/* ------------------------------------------------------------------ */

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...publicUserSelect, password: true, isActive: true },
  });

  if (!user || !user.password) throw new ApiError('Invalid credentials', 401);
  if (!user.isActive) throw new ApiError('Account is suspended', 403);

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new ApiError('Invalid credentials', 401);

  const { accessToken, refreshToken } = await createSession(user.id);

  // Strip password/isActive before returning.
  const { password: _pw, isActive: _active, ...publicUser } = user;
  return { user: publicUser, accessToken, refreshToken };
};

/* ------------------------------------------------------------------ */
/* Refresh (rotation, validated against Redis)                        */
/* ------------------------------------------------------------------ */

export const refreshAccessToken = async (token: string) => {
  let userId: string;
  try {
    ({ userId } = verifyRefreshToken(token));
  } catch {
    throw new ApiError('Invalid or expired refresh token', 401);
  }

  const stored = await redis.get(refreshKey(userId));
  if (!stored || stored !== token) {
    throw new ApiError('Invalid or expired refresh token', 401);
  }

  // createSession overwrites the stored token, invalidating the old one.
  return createSession(userId);
};

/* ------------------------------------------------------------------ */
/* Logout                                                             */
/* ------------------------------------------------------------------ */

export const logoutUser = async (userId: string): Promise<void> => {
  await redis.del(refreshKey(userId));
};

/* ------------------------------------------------------------------ */
/* Email verification via OTP                                         */
/* ------------------------------------------------------------------ */

export const verifyEmailOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isEmailVerified: true },
  });

  // Generic error — never reveal whether the email exists.
  if (!user) throw new ApiError('Invalid or expired verification code', 400);
  if (user.isEmailVerified) return { alreadyVerified: true };

  await consumeOtp('verify', email, otp);

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true },
  });

  return { alreadyVerified: false };
};

export const resendOtp = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isEmailVerified: true },
  });

  // Don't reveal whether the email exists or is already verified.
  if (!user || user.isEmailVerified) return;

  const otp = await generateAndStoreOtp('verify', email);
  await sendOtpEmail(email, otp, OTP_TTL_MINUTES);
};

/* ------------------------------------------------------------------ */
/* Password reset via OTP                                             */
/* ------------------------------------------------------------------ */

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });

  // Silent for non-existent accounts and OAuth-only users (no password to reset).
  if (!user || !user.password) return;

  const otp = await generateAndStoreOtp('pwreset', email);
  await sendPasswordResetEmail(email, otp, OTP_TTL_MINUTES);
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) throw new ApiError('Invalid or expired code', 400);

  await consumeOtp('pwreset', email, otp);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(newPassword) },
  });

  // Invalidate any active session so old refresh tokens stop working.
  await redis.del(refreshKey(user.id));
};

/* ------------------------------------------------------------------ */
/* Google OAuth — upsert user + linked oauth account                  */
/* ------------------------------------------------------------------ */

export const upsertGoogleUser = async (profile: {
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}) => {
  // 1. Already linked? Return that user.
  const linked = await prisma.oAuthAccount.findUnique({
    where: { provider_providerId: { provider: 'GOOGLE', providerId: profile.providerId } },
    select: { user: { select: { id: true, role: true } } },
  });
  if (linked) return linked.user;

  // 2. Email already registered (password account)? Link Google to it.
  const existing = await prisma.user.findUnique({
    where: { email: profile.email },
    select: { id: true, role: true },
  });
  if (existing) {
    await prisma.oAuthAccount.create({
      data: { userId: existing.id, provider: 'GOOGLE', providerId: profile.providerId },
    });
    return existing;
  }

  // 3. Brand-new user — Google emails are pre-verified.
  const created = await prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      isEmailVerified: true,
      oauthAccounts: {
        create: { provider: 'GOOGLE', providerId: profile.providerId },
      },
    },
    select: { id: true, role: true },
  });
  return created;
};
