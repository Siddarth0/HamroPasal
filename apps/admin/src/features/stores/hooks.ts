'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { StoreStatus } from 'shared-types';
import { useAuthStore } from '@/store/auth';
import { fetchStores, updateStore, type UpdateStoreInput } from './api';

export function useStores(params: { page?: number; status?: StoreStatus } = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['admin-stores', params],
    queryFn: () => fetchStores(params),
    enabled: status === 'authenticated',
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStoreInput }) => updateStore(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-stores'] });
      qc.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}
