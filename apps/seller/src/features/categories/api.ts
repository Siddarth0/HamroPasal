import { api, type ApiEnvelope } from '@/lib/api';

export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const { data } = await api.get<ApiEnvelope<ApiCategory[]>>('/categories');
  return data.data;
}
