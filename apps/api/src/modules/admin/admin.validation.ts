import { z } from 'zod';

export const updateUserSchema = z
  .object({
    isActive: z.boolean(),
    role: z.enum(['CUSTOMER', 'SELLER', 'ADMIN']),
  })
  .partial()
  .refine((d) => d.isActive !== undefined || d.role !== undefined, {
    message: 'Provide isActive and/or role',
  });

export const setProductActiveSchema = z.object({
  isActive: z.boolean(),
});
