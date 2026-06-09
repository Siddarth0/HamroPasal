import type { PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface ApiReview {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  images: { url: string; publicId: string }[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  reviewer: { name: string; avatarUrl: string | null };
}

export async function fetchProductReviews(
  productId: string,
  page = 1,
): Promise<{ items: ApiReview[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<ApiReview[]>>(`/reviews/product/${productId}`, {
    params: { page, limit: 10 },
  });
  return { items: data.data, meta: data.meta };
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}

export async function createReview(input: CreateReviewInput): Promise<void> {
  await api.post('/reviews', input);
}
