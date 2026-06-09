import type { PublicUser } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

export async function updateProfile(input: UpdateProfileInput): Promise<PublicUser> {
  const { data } = await api.patch<ApiEnvelope<PublicUser>>('/users/me', input);
  return data.data;
}
