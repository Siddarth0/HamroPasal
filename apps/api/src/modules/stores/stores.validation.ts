import { z } from 'zod';

const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);

export const createStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  description: z.string().max(2000).optional(),
  phone: z.string().min(7).max(20).optional(),
  email: z.email().optional(),
  addressLine: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  latitude: latitude.optional(),
  longitude: longitude.optional(),
});

// Seller-editable profile fields (logo/cover are URLs for now; Cloudinary upload in Phase 3).
export const updateStoreSchema = z
  .object({
    name: z.string().min(2),
    description: z.string().max(2000),
    phone: z.string().min(7).max(20),
    email: z.email(),
    addressLine: z.string().min(3),
    city: z.string().min(2),
    latitude,
    longitude,
    logoUrl: z.url(),
    coverUrl: z.url(),
  })
  .partial();

// Admin: approve/suspend and set commission.
export const adminUpdateStoreSchema = z
  .object({
    status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']),
    commissionRate: z.number().min(0).max(100),
  })
  .partial()
  .refine((d) => d.status !== undefined || d.commissionRate !== undefined, {
    message: 'Provide status and/or commissionRate',
  });

/* ----------------------------- Delivery zones ----------------------------- */

export const createZoneSchema = z.object({
  name: z.string().min(1),
  distanceKm: z.number().positive('distanceKm must be greater than 0'),
  shippingFee: z.number().min(0),
  isActive: z.boolean().optional(),
});

export const updateZoneSchema = createZoneSchema.partial();
