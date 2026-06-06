import { z } from 'zod';

// Public registration may only create CUSTOMER or SELLER accounts.
// Each Next.js app sends its own role; ADMIN is never self-registerable.
export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'SELLER']).default('CUSTOMER'),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const verifyEmailSchema = z.object({
  email: z.email(),
  otp: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const resendVerificationSchema = z.object({
  email: z.email(),
});
