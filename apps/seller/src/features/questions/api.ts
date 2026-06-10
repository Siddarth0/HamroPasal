import type { PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface SellerQuestion {
  _id: string;
  productId: string;
  storeId: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
  asker: { name: string };
  product: { _id: string; name: string; slug: string; image?: string } | null;
}

export async function fetchSellerQuestions(
  params: { page?: number; answered?: boolean } = {},
): Promise<{ items: SellerQuestion[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<SellerQuestion[]>>('/questions/seller', { params });
  return { items: data.data, meta: data.meta };
}

export async function answerQuestion(id: string, answer: string): Promise<SellerQuestion> {
  const { data } = await api.post<ApiEnvelope<SellerQuestion>>(`/questions/${id}/answer`, { answer });
  return data.data;
}
