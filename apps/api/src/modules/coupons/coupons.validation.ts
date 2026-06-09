import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(3).max(40),
  description: z.string().max(500).optional(),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  storeId: z.string().optional(), // admin only; sellers are forced to their own store
});

export const updateCouponSchema = z
  .object({
    description: z.string().max(500),
    isActive: z.boolean(),
    usageLimit: z.number().int().positive(),
    expiresAt: z.coerce.date(),
  })
  .partial();

export const validateCouponSchema = z.object({
  code: z.string().min(1),
});
