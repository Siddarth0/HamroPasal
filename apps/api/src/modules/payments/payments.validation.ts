import { z } from 'zod';

export const initiateSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
});
