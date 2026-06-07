import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id');

export const addItemSchema = z.object({
  productId: objectId,
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
});

export const updateItemSchema = z.object({
  productId: objectId,
  variantId: z.string().optional(),
  quantity: z.number().int().min(0), // 0 removes the line
});
