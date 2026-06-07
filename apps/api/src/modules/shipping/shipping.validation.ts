import { z } from 'zod';

export const shippingQuoteSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  storeIds: z.array(z.string().min(1)).min(1, 'At least one storeId is required'),
});
