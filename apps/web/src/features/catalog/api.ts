import type { PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';
import type { CardProduct } from '@/components/home/product-card';

/* ---- Wire shapes (Mongo catalog serializes `_id`; stores are Postgres `id`) ---- */

export interface ApiImage {
  url: string;
  publicId: string;
}

export interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: ApiImage[];
  avgRating: number;
  reviewCount: number;
  soldCount: number;
}

export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  image?: ApiImage;
}

export interface ApiStore {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  storeId?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
  minPrice?: number;
  maxPrice?: number;
}

/* ---- Fetchers ---- */

export async function fetchProducts(
  params: ProductQuery = {},
): Promise<{ items: ApiProduct[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<ApiProduct[]>>('/products', { params });
  return { items: data.data, meta: data.meta };
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const { data } = await api.get<ApiEnvelope<ApiCategory[]>>('/categories');
  return data.data;
}

export async function fetchStores(
  params: { page?: number; limit?: number; search?: string } = {},
): Promise<{ items: ApiStore[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<ApiStore[]>>('/stores', { params });
  return { items: data.data, meta: data.meta };
}

export interface ApiVariant {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  attributes: Record<string, string>;
}

export interface ApiProductDetail extends ApiProduct {
  description: string;
  stock: number;
  storeId: string;
  variants: ApiVariant[];
  attributes: { name: string; values: string[] }[];
  tags: string[];
  // populated with { _id, name, slug } on the detail endpoint
  categoryId: { _id: string; name: string; slug: string } | string;
}

export async function fetchProductBySlug(slug: string): Promise<ApiProductDetail> {
  const { data } = await api.get<ApiEnvelope<ApiProductDetail>>(`/products/${slug}`);
  return data.data;
}

export async function fetchCategoryBySlug(slug: string): Promise<ApiCategory> {
  const { data } = await api.get<ApiEnvelope<ApiCategory>>(`/categories/${slug}`);
  return data.data;
}

/* ---- Mapping to the card shape ---- */

const soldLabel = (n: number): string => {
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`;
  if (n >= 100) return `${Math.floor(n / 100) * 100}+`;
  return String(n);
};

const placeholder = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400?grayscale`;

export function productToCard(p: ApiProduct): CardProduct {
  const sold = p.soldCount ?? 0;
  return {
    id: p._id,
    name: p.name,
    price: p.price,
    comparePrice: p.comparePrice,
    rating: p.avgRating || undefined,
    sold: sold > 0 ? soldLabel(sold) : undefined,
    image: p.images?.[0]?.url ?? placeholder(p.slug),
    href: `/product/${p.slug}`,
    // No live "sold vs stock" ratio yet — derive a stable bar from soldCount.
    soldPercent: Math.min(95, 30 + (sold % 65)),
  };
}
