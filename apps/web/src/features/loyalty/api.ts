import type { PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface LoyaltyBalance {
  points: number;
  redeemRate: number; // points → 1 currency unit
  earnRate: number; // spend per 1 point earned
}

export async function fetchLoyaltyBalance(): Promise<LoyaltyBalance> {
  const { data } = await api.get<ApiEnvelope<LoyaltyBalance>>('/loyalty/balance');
  return data.data;
}

export interface LoyaltyTxn {
  id: string;
  points: number;
  type: string;
  description?: string | null;
  createdAt: string;
}

export async function fetchLoyaltyTransactions(
  page = 1,
): Promise<{ items: LoyaltyTxn[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<LoyaltyTxn[]>>('/loyalty/transactions', {
    params: { page, limit: 20 },
  });
  return { items: data.data, meta: data.meta };
}
