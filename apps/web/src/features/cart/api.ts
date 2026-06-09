import type { CartView } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity?: number;
}

/** All cart endpoints require a logged-in session and return the updated cart view. */

export async function fetchCart(): Promise<CartView> {
  const { data } = await api.get<ApiEnvelope<CartView>>('/cart');
  return data.data;
}

export async function addToCart(input: AddToCartInput): Promise<CartView> {
  const { data } = await api.post<ApiEnvelope<CartView>>('/cart/items', { quantity: 1, ...input });
  return data.data;
}

export async function updateCartItem(input: {
  productId: string;
  variantId?: string;
  quantity: number;
}): Promise<CartView> {
  const { data } = await api.patch<ApiEnvelope<CartView>>('/cart/items', input);
  return data.data;
}

export async function removeCartItem(input: {
  productId: string;
  variantId?: string;
}): Promise<CartView> {
  const { data } = await api.delete<ApiEnvelope<CartView>>(`/cart/items/${input.productId}`, {
    params: input.variantId ? { variantId: input.variantId } : {},
  });
  return data.data;
}

export async function clearCart(): Promise<CartView> {
  const { data } = await api.delete<ApiEnvelope<CartView>>('/cart');
  return data.data;
}
