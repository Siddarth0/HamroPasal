'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import {
  fetchMyCoupons,
  createCoupon,
  updateCoupon,
  type CreateCouponInput,
  type UpdateCouponInput,
} from './api';

export function useMyCoupons() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['my-coupons'],
    queryFn: fetchMyCoupons,
    enabled: status === 'authenticated',
  });
}

export function useCouponMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['my-coupons'] });

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
