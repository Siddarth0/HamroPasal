import type { Role, Address, PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  store: { id: string; name: string; status: string } | null;
}

export interface AdminUserDetail extends AdminUser {
  addresses: Address[];
}

export async function fetchUsers(
  params: { page?: number; role?: Role; isActive?: boolean; search?: string } = {},
): Promise<{ items: AdminUser[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<AdminUser[]>>('/admin/users', { params });
  return { items: data.data, meta: data.meta };
}

export async function fetchUser(id: string): Promise<AdminUserDetail> {
  const { data } = await api.get<ApiEnvelope<AdminUserDetail>>(`/admin/users/${id}`);
  return data.data;
}

export interface UpdateUserInput {
  isActive?: boolean;
  role?: Role;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
  const { data } = await api.patch<ApiEnvelope<AdminUser>>(`/admin/users/${id}`, input);
  return data.data;
}
