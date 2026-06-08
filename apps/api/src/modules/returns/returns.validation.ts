import { z } from 'zod';

export const createReturnSchema = z.object({
  subOrderId: z.string().min(1, 'subOrderId is required'),
  reason: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
});

// Seller/admin resolution.
export const updateReturnSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'COMPLETED']),
  refundAmount: z.number().min(0).optional(),
});
