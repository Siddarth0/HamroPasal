import type { Store, StoreStatus, PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export async function fetchStores(
  params: { page?: number; status?: StoreStatus } = {},
): Promise<{ items: Store[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<Store[]>>('/stores/admin', { params });
  return { items: data.data, meta: data.meta };
}

export interface UpdateStoreInput {
  status?: StoreStatus;
  commissionRate?: number;
}

export async function updateStore(id: string, input: UpdateStoreInput): Promise<Store> {
  const { data } = await api.patch<ApiEnvelope<Store>>(`/stores/admin/${id}`, input);
  return data.data;
}
