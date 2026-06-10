'use client';

import { useQuery } from '@tanstack/react-query';
import type { OrderStatus, PaymentStatus } from 'shared-types';
import { useAuthStore } from '@/store/auth';
import { fetchOrders, fetchOrder } from './api';

export function useOrders(
  params: { page?: number; status?: OrderStatus; paymentStatus?: PaymentStatus } = {},
) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => fetchOrders(params),
    enabled: status === 'authenticated',
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => fetchOrder(id as string),
    enabled: !!id,
  });
}
