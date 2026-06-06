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
import { sendOtpEmail } from '@/modules/notifications/email.service';
import type { Role } from '@/generated/prisma';

/* ------------------------------------------------------------------ */
/* Constants & Redis keys                                             */
/* ------------------------------------------------------------------ */

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days, matches refresh JWT
const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const refreshKey = (userId: string) => `auth:refresh:${userId}`;
const otpKey = (email: string) => `auth:otp:${email.toLowerCase()}`;
const otpAttemptsKey = (email: string) => `auth:otp:attempts:${email.toLowerCase()}`;

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

const issueOtp = async (email: string): Promise<void> => {
  const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
  await redis.set(otpKey(email), otp, 'EX', OTP_TTL_SECONDS);
  await redis.del(otpAttemptsKey(email));
  // sendOtpEmail swallows its own errors, so a mail outage never blocks signup.
  await sendOtpEmail(email, otp, OTP_TTL_MINUTES);
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

  await issueOtp(user.email);
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

  const stored = await redis.get(otpKey(email));
  if (!stored) throw new ApiError('Verification code expired or not found', 400);

  const attempts = await redis.incr(otpAttemptsKey(email));
  if (attempts === 1) await redis.expire(otpAttemptsKey(email), OTP_TTL_SECONDS);
  if (attempts > MAX_OTP_ATTEMPTS) {
    await redis.del(otpKey(email), otpAttemptsKey(email));
    throw new ApiError('Too many incorrect attempts. Please request a new code.', 429);
  }

  if (stored !== otp) throw new ApiError('Invalid verification code', 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true },
  });
  await redis.del(otpKey(email), otpAttemptsKey(email));

  return { alreadyVerified: false };
};

export const resendOtp = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isEmailVerified: true },
  });

  // Don't reveal whether the email exists or is already verified.
  if (!user || user.isEmailVerified) return;

  await issueOtp(email);
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
