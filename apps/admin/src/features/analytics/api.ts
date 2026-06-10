import type { PlatformStats } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const { data } = await api.get<ApiEnvelope<PlatformStats>>('/analytics/admin');
  return data.data;
}
