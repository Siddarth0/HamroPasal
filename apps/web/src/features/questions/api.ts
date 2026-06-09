import type { PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface ApiQuestion {
  _id: string;
  productId: string;
  userId: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
  asker: { name: string };
}

export async function fetchProductQuestions(
  productId: string,
  page = 1,
): Promise<{ items: ApiQuestion[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<ApiQuestion[]>>(`/questions/product/${productId}`, {
    params: { page, limit: 10 },
  });
  return { items: data.data, meta: data.meta };
}

export async function askQuestion(input: { productId: string; question: string }): Promise<void> {
  await api.post('/questions', input);
}

/** Seller/admin answers a question (used by the seller app). */
export async function answerQuestion(id: string, answer: string): Promise<void> {
  await api.post(`/questions/${id}/answer`, { answer });
}
