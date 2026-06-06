import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import { comparePassword, hashPassword } from '@/shared/utils/bcrypt';
import {
  generateAccessToken,
  generateEmailVerifyToken,
  generateRefreshToken,
  verifyEmailVerifyToken,
  verifyRefreshToken,
} from '@/shared/utils/jwt';
import { sendVerificationEmail } from '@/modules/notifications/email.service';

//-----Register----------
export const registerUser = async (data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new ApiError('Email already in use', 409);

  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatarUrl: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  // Fire-and-forget: sendVerificationEmail swallows its own errors, so a
  // mail outage never blocks signup.
  await sendVerificationEmail(user.email, generateEmailVerifyToken(user.id));

  return { user, accessToken, refreshToken };
};

//---Login-----------
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true, isActive: true },
  });

  if (!user || !user.password) throw new ApiError('Invalid credentials', 401);
  if (!user.isActive) throw new ApiError('Account is suspended', 403);

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new ApiError('Invalid credentials', 401);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { user: { id: user.id }, accessToken, refreshToken };
};

//---refresh----------
export const refreshAccessToken = async (token: string) => {
  const { userId } = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.refreshToken !== token) {
    throw new ApiError('Invalid refresh Token', 401);
  }

  const accessToken = generateAccessToken(user.id);
  const newrefreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newrefreshToken },
  });

  return { accessToken, refreshToken: newrefreshToken };
};

//---verify email----------
export const verifyEmail = async (token: string) => {
  let payload: { userId: string; type: string };
  try {
    payload = verifyEmailVerifyToken(token);
  } catch {
    throw new ApiError('Invalid or expired verification link', 400);
  }

  if (payload.type !== 'email-verify') {
    throw new ApiError('Invalid verification token', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, isEmailVerified: true },
  });
  if (!user) throw new ApiError('User not found', 404);

  if (user.isEmailVerified) return { alreadyVerified: true };

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true },
  });

  return { alreadyVerified: false };
};

//---resend verification----------
export const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, isEmailVerified: true },
  });

  // Don't reveal whether the email exists or is already verified.
  if (!user || user.isEmailVerified) return;

  await sendVerificationEmail(user.email, generateEmailVerifyToken(user.id));
};

//---logout----------------
export const logoutUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};
