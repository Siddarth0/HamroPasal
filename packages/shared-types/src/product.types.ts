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

/* ---- MongoDB catalog ---- */

export interface ImageRef {
  url: string;
  publicId: string;
}

export interface ProductVariant {
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  attributes: Record<string, string>;
}

/** Product-level attribute definition (e.g. { name: "Color", values: ["Red","Blue"] }). */
export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  images: ImageRef[];
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  tags: string[];
  isActive: boolean;
  avgRating: number;
  reviewCount: number;
  soldCount: number;
  weight?: number;
  dimensions?: ProductDimensions;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: ImageRef;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
