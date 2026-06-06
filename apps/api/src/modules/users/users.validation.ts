import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(7).max(20),
    avatarUrl: z.url(),
  })
  .partial();

const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);

export const createAddressSchema = z.object({
  label: z.string().min(1).default('Home'),
  fullName: z.string().min(2),
  phone: z.string().min(7).max(20),
  addressLine: z.string().min(3),
  city: z.string().min(2),
  district: z.string().min(2),
  latitude: latitude.optional(),
  longitude: longitude.optional(),
  isDefault: z.boolean().optional(),
});

// All fields optional for PATCH.
export const updateAddressSchema = createAddressSchema.partial();
