'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrderStatus } from 'shared-types';
import { useAuthStore } from '@/store/auth';
import { fetchSellerSubOrders, updateSubOrderStatus } from './api';

export function useSellerSubOrders(params: { page?: number } = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['seller-orders', params],
    queryFn: () => fetchSellerSubOrders(params),
    enabled: status === 'authenticated',
  });
}

export function useUpdateSubOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateSubOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller-orders'] }),
  });
}
