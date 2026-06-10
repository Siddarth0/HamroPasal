import type { Coupon, DiscountType } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

/** Create payload — sellers are forced to their own store server-side. */
export interface CreateCouponInput {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
}

export interface UpdateCouponInput {
  description?: string;
  isActive?: boolean;
  usageLimit?: number;
  expiresAt?: string;
}

export async function fetchMyCoupons(): Promise<Coupon[]> {
  // `/coupons/mine` is paginated; pull a generous page so the list shows everything.
  const { data } = await api.get<ApiEnvelope<Coupon[]>>('/coupons/mine', {
    params: { limit: 100 },
  });
  return data.data;
}

export async function createCoupon(input: CreateCouponInput): Promise<Coupon> {
  const { data } = await api.post<ApiEnvelope<Coupon>>('/coupons', input);
  return data.data;
}

export async function updateCoupon(id: string, input: UpdateCouponInput): Promise<Coupon> {
  const { data } = await api.patch<ApiEnvelope<Coupon>>(`/coupons/${id}`, input);
  return data.data;
}
