import type { SellerStats } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export async function fetchSellerStats(): Promise<SellerStats> {
  const { data } = await api.get<ApiEnvelope<SellerStats>>('/analytics/seller');
  return data.data;
}
