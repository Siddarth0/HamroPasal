import type { PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface ApiImage {
  url: string;
  publicId: string;
}

export interface ApiVariant {
  _id?: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  attributes: Record<string, string>;
}

export interface ApiAttribute {
  name: string;
  values: string[];
}

export interface ApiProduct {
  _id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  images: ApiImage[];
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  variants: ApiVariant[];
  attributes: ApiAttribute[];
  tags: string[];
  isActive: boolean;
  avgRating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by POST/PATCH /products (matches the API's Zod schema). */
export interface ProductInput {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  variants: ApiVariant[];
  attributes: ApiAttribute[];
  tags: string[];
  isActive?: boolean;
}

export async function fetchMyProducts(
  params: { page?: number; limit?: number; search?: string } = {},
): Promise<{ items: ApiProduct[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<ApiProduct[]>>('/products/mine', { params });
  return { items: data.data, meta: data.meta };
}

export async function fetchMyProduct(id: string): Promise<ApiProduct> {
  const { data } = await api.get<ApiEnvelope<ApiProduct>>(`/products/mine/${id}`);
  return data.data;
}

export async function createProduct(input: ProductInput): Promise<ApiProduct> {
  const { data } = await api.post<ApiEnvelope<ApiProduct>>('/products', input);
  return data.data;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<ApiProduct> {
  const { data } = await api.patch<ApiEnvelope<ApiProduct>>(`/products/${id}`, input);
  return data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function addProductImages(id: string, files: File[]): Promise<ApiProduct> {
  const form = new FormData();
  files.forEach((f) => form.append('images', f));
  const { data } = await api.post<ApiEnvelope<ApiProduct>>(`/products/${id}/images`, form);
  return data.data;
}

export async function removeProductImage(id: string, publicId: string): Promise<ApiProduct> {
  // publicId may contain slashes (Cloudinary), so it rides in the body.
  const { data } = await api.delete<ApiEnvelope<ApiProduct>>(`/products/${id}/images`, {
    data: { publicId },
  });
  return data.data;
}
