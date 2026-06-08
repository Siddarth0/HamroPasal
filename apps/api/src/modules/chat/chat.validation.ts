import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const sendMessageSchema = z
  .object({
    text: z.string().min(1).max(2000),
    conversationId: objectId.optional(),
    storeId: z.string().optional(),
    productId: objectId.optional(),
  })
  .refine((d) => d.conversationId || d.storeId, {
    message: 'conversationId or storeId is required',
  });
