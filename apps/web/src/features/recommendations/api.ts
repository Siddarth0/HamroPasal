import { api, type ApiEnvelope } from '@/lib/api';
import type { ApiProduct } from '@/features/catalog/api';

/** All recommendation endpoints return a flat array of product cards. */
async function fetchList(url: string, params?: Record<string, unknown>): Promise<ApiProduct[]> {
  const { data } = await api.get<ApiEnvelope<ApiProduct[]>>(url, { params });
  return data.data ?? [];
}

export const fetchSimilar = (productId: string, limit = 8) =>
  fetchList(`/products/${productId}/similar`, { limit });

export const fetchBoughtTogether = (productId: string, limit = 8) =>
  fetchList(`/products/${productId}/bought-together`, { limit });

export const fetchRecommended = (limit = 12) =>
  fetchList('/products/recommended', { limit });

export const fetchProductsByIds = (ids: string[]) =>
  ids.length ? fetchList('/products/by-ids', { ids: ids.join(',') }) : Promise.resolve([]);
