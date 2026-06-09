import { z } from 'zod';

export const checkoutSchema = z.object({
  addressId: z.string().min(1, 'addressId is required'),
  paymentMethod: z.enum(['COD', 'KHALTI', 'ESEWA', 'STRIPE']),
  couponCode: z.string().optional(),
  redeemPoints: z.number().int().min(0).optional(),
});

// Statuses a seller may set on a sub-order.
export const updateSubOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});
