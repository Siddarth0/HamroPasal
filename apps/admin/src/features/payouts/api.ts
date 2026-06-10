import type { Payout, PayoutStatus, PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface AdminPayout extends Payout {
  store: { id: string; name: string } | null;
}

export async function fetchPayouts(
  params: { page?: number; status?: PayoutStatus } = {},
): Promise<{ items: AdminPayout[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<AdminPayout[]>>('/payouts/admin', { params });
  return { items: data.data, meta: data.meta };
}

export async function generatePayouts(): Promise<{ created: number }> {
  const { data } = await api.post<ApiEnvelope<{ created: number }>>('/payouts/admin/generate');
  return data.data;
}

export interface UpdatePayoutInput {
  status: PayoutStatus;
  method?: string;
  reference?: string;
}

export async function updatePayout(id: string, input: UpdatePayoutInput): Promise<AdminPayout> {
  const { data } = await api.patch<ApiEnvelope<AdminPayout>>(`/payouts/admin/${id}`, input);
  return data.data;
}
