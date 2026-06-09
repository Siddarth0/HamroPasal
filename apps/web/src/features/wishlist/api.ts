import { api, type ApiEnvelope } from '@/lib/api';

export interface WishlistProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { url: string; publicId: string }[];
  avgRating: number;
  storeId: string;
  isActive: boolean;
}

export async function fetchWishlist(): Promise<WishlistProduct[]> {
  const { data } = await api.get<ApiEnvelope<WishlistProduct[]>>('/wishlist');
  return data.data;
}

export async function addToWishlist(productId: string): Promise<WishlistProduct[]> {
  const { data } = await api.post<ApiEnvelope<WishlistProduct[]>>('/wishlist/items', { productId });
  return data.data;
}

export async function removeFromWishlist(productId: string): Promise<WishlistProduct[]> {
  const { data } = await api.delete<ApiEnvelope<WishlistProduct[]>>(`/wishlist/items/${productId}`);
  return data.data;
}
