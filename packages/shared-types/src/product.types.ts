/**
 * Catalog + store contracts.
 *
 * `Store` mirrors the Prisma `stores` table. The MongoDB-backed shapes
 * (`Product`, `Category`) are provisional and will be firmed up in Phase 3 when
 * the Mongoose models are built.
 */

export const STORE_STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED'] as const;
export type StoreStatus = (typeof STORE_STATUSES)[number];

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  email: string | null;
  addressLine: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  status: StoreStatus;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  storeId: string;
  name: string;
  distanceKm: number;
  shippingFee: number;
  isActive: boolean;
  createdAt: string;
}

/** Per-store shipping estimate returned by POST /api/shipping/quote. */
export interface ShippingQuote {
  storeId: string;
  deliverable: boolean;
  distanceKm: number | null;
  shippingFee: number | null;
  zoneName?: string;
  reason?: string;
}

/* ---- MongoDB catalog (provisional — refined in Phase 3) ---- */

export interface ProductImage {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface ProductVariant {
  sku?: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId?: string;
  name: string;
  slug: string;
  description?: string;
  images: ProductImage[];
  attributes?: Record<string, unknown>;
  variants: ProductVariant[];
  price: number;
  stock: number;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
