import { api } from '@/lib/api';

export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity?: number;
}

/** Add an item to the authenticated user's cart. Requires a logged-in session. */
export async function addToCart(input: AddToCartInput): Promise<void> {
  await api.post('/cart/items', { quantity: 1, ...input });
}
