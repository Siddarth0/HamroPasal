'use client';

import { useQuery } from '@tanstack/react-query';
import type { PayoutStatus } from 'shared-types';
import { useAuthStore } from '@/store/auth';
import { fetchMyPayouts, fetchEarnings } from './api';

export function useMyPayouts(params: { page?: number; status?: PayoutStatus } = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['my-payouts', params],
    queryFn: () => fetchMyPayouts(params),
    enabled: status === 'authenticated',
  });
}

export function useEarnings() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['earnings'],
    queryFn: fetchEarnings,
    enabled: status === 'authenticated',
  });
}
