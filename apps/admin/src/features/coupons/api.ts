import type { Coupon, DiscountType, PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export async function fetchCoupons(
  params: { page?: number; storeId?: string; isActive?: boolean } = {},
): Promise<{ items: Coupon[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<Coupon[]>>('/coupons/admin', { params });
  return { items: data.data, meta: data.meta };
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: string;
  storeId?: string; // optional → platform-wide
}

export interface UpdateCouponInput {
  description?: string;
  isActive?: boolean;
  usageLimit?: number;
  expiresAt?: string;
}

export async function createCoupon(input: CreateCouponInput): Promise<Coupon> {
  const { data } = await api.post<ApiEnvelope<Coupon>>('/coupons', input);
  return data.data;
}

export async function updateCoupon(id: string, input: UpdateCouponInput): Promise<Coupon> {
  const { data } = await api.patch<ApiEnvelope<Coupon>>(`/coupons/${id}`, input);
  return data.data;
}
