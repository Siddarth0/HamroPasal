import type { AuthResponse, PublicUser } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', input);
  return data.data;
}

export async function getMe(): Promise<PublicUser> {
  const { data } = await api.get<ApiEnvelope<PublicUser>>('/users/me');
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

/** Restore a session on app load: refresh the access token, then load the user. */
export async function restoreSession(): Promise<{ user: PublicUser; accessToken: string }> {
  const { data } = await api.post<ApiEnvelope<{ accessToken: string }>>('/auth/refresh');
  const accessToken = data.data.accessToken;
  useAuthStore.getState().setToken(accessToken);
  return { accessToken, user: await getMe() };
}
