import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createReviewSchema = z.object({
  productId: objectId,
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(1).max(2000),
});

export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    title: z.string().max(120),
    comment: z.string().min(1).max(2000),
  })
  .partial();

export const removeReviewImageSchema = z.object({
  publicId: z.string().min(1, 'publicId is required'),
});
