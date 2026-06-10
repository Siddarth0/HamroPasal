'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PayoutStatus } from 'shared-types';
import { useAuthStore } from '@/store/auth';
import { fetchPayouts, generatePayouts, updatePayout, type UpdatePayoutInput } from './api';

export function usePayouts(params: { page?: number; status?: PayoutStatus } = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['admin-payouts', params],
    queryFn: () => fetchPayouts(params),
    enabled: status === 'authenticated',
  });
}

export function usePayoutActions() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-payouts'] });
    qc.invalidateQueries({ queryKey: ['platform-stats'] });
  };

  const generate = useMutation({ mutationFn: generatePayouts, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePayoutInput }) => updatePayout(id, input),
    onSuccess: invalidate,
  });

  return { generate, update };
}
