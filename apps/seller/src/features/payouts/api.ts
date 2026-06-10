import type { Payout, SellerEarnings, PayoutStatus, PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export async function fetchMyPayouts(
  params: { page?: number; limit?: number; status?: PayoutStatus } = {},
): Promise<{ items: Payout[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<Payout[]>>('/payouts', { params });
  return { items: data.data, meta: data.meta };
}

export async function fetchEarnings(): Promise<SellerEarnings> {
  const { data } = await api.get<ApiEnvelope<SellerEarnings>>('/payouts/earnings');
  return data.data;
}
