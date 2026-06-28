import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const variantSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  attributes: z.record(z.string(), z.string()).default({}),
});

const attributeSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string().min(1)).min(1),
});

const dimensionsSchema = z.object({
  length: z.number().min(0),
  width: z.number().min(0),
  height: z.number().min(0),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(1, 'Description is required'),
  categoryId: objectId,
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  variants: z.array(variantSchema).default([]),
  attributes: z.array(attributeSchema).default([]),
  tags: z.array(z.string()).default([]),
  weight: z.number().min(0).optional(),
  dimensions: dimensionsSchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const removeImageSchema = z.object({
  publicId: z.string().min(1, 'publicId is required'),
});

// Public browse filters (query string → coerced).
export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: objectId.optional(),
  storeId: z.string().optional(),
  tag: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z
    .enum(['relevance', 'newest', 'price_asc', 'price_desc', 'rating', 'popular'])
    .optional(),
});

// Autocomplete suggestions (header search type-ahead).
export const suggestQuerySchema = z.object({
  q: z.string().trim().min(1, 'Query is required'),
  limit: z.coerce.number().int().min(1).max(10).default(6),
});

// Recommendation rails (similar / bought-together / recommended).
export const recommendQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

// "Recently viewed" hydration — comma-separated product ids.
export const byIdsQuerySchema = z.object({
  ids: z
    .string()
    .transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 20))
    .pipe(z.array(z.string()).min(1, 'ids is required')),
});
