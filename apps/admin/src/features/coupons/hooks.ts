'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  type CreateCouponInput,
  type UpdateCouponInput,
} from './api';

export function useCoupons(params: { page?: number; isActive?: boolean } = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['admin-coupons', params],
    queryFn: () => fetchCoupons(params),
    enabled: status === 'authenticated',
  });
}

export function useCouponMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-coupons'] });

  const create = useMutation({
    mutationFn: (input: CreateCouponInput) => createCoupon(input),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCouponInput }) => updateCoupon(id, input),
    onSuccess: invalidate,
  });

  return { create, update };
}
