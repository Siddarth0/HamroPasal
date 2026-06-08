import { z } from 'zod';

export const updatePayoutSchema = z.object({
  status: z.enum(['PROCESSING', 'COMPLETED', 'FAILED', 'PENDING']),
  method: z.string().max(50).optional(),
  reference: z.string().max(200).optional(),
});
