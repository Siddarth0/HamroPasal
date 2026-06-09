import type { ShippingQuote } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export type PaymentMethod = 'COD' | 'KHALTI' | 'ESEWA' | 'STRIPE';

export async function getShippingQuotes(input: {
  latitude: number;
  longitude: number;
  storeIds: string[];
}): Promise<ShippingQuote[]> {
  const { data } = await api.post<ApiEnvelope<ShippingQuote[]>>('/shipping/quote', input);
  return data.data;
}

export interface PlaceOrderInput {
  addressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  redeemPoints?: number;
}

export async function placeOrder(input: PlaceOrderInput): Promise<{ id: string }> {
  const { data } = await api.post<ApiEnvelope<{ id: string }>>('/orders/checkout', input);
  return data.data;
}

export interface CouponPreview {
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discount: number;
}

/** Validate a coupon against the user's current cart; returns the discount amount. */
export async function validateCoupon(code: string): Promise<CouponPreview> {
  const { data } = await api.post<ApiEnvelope<CouponPreview>>('/coupons/validate', { code });
  return data.data;
}

export type InitiateResult =
  | { method: 'COD'; message: string }
  | { method: 'KHALTI'; paymentUrl: string; pidx: string }
  | { method: 'ESEWA'; url: string; fields: Record<string, string> }
  | { method: 'STRIPE'; clientSecret: string };

export async function initiatePayment(orderId: string): Promise<InitiateResult> {
  const { data } = await api.post<ApiEnvelope<InitiateResult>>('/payments/initiate', { orderId });
  return data.data;
}
