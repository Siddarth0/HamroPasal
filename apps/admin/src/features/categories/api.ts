import { api, type ApiEnvelope } from '@/lib/api';

export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: { url: string; publicId: string };
  isActive: boolean;
  sortOrder: number;
}

export interface CategoryInput {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export async function fetchCategories(): Promise<AdminCategory[]> {
  const { data } = await api.get<ApiEnvelope<AdminCategory[]>>('/categories');
  return data.data;
}

export async function createCategory(input: CategoryInput): Promise<AdminCategory> {
  const { data } = await api.post<ApiEnvelope<AdminCategory>>('/categories', input);
  return data.data;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<AdminCategory> {
  const { data } = await api.patch<ApiEnvelope<AdminCategory>>(`/categories/${id}`, input);
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export async function uploadCategoryImage(id: string, file: File): Promise<AdminCategory> {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post<ApiEnvelope<AdminCategory>>(`/categories/${id}/image`, form);
  return data.data;
}
