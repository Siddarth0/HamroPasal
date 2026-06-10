import type { PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface AdminProduct {
  _id: string;
  storeId: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: { url: string; publicId: string }[];
  isActive: boolean;
  storeActive?: boolean;
  avgRating: number;
  soldCount: number;
  createdAt: string;
}

export async function fetchProducts(
  params: { page?: number; search?: string; isActive?: boolean } = {},
): Promise<{ items: AdminProduct[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<AdminProduct[]>>('/admin/products', { params });
  return { items: data.data, meta: data.meta };
}

export async function setProductActive(id: string, isActive: boolean): Promise<AdminProduct> {
  const { data } = await api.patch<ApiEnvelope<AdminProduct>>(`/admin/products/${id}`, { isActive });
  return data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/admin/products/${id}`);
}
