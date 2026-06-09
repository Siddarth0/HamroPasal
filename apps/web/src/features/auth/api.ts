import type { AuthResponse, PublicUser, Role } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post<ApiEnvelope<AuthResponse>>('/auth/register', input);
  return data.data;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', input);
  return data.data;
}

export async function verifyEmail(input: { email: string; otp: string }): Promise<void> {
  await api.post('/auth/verify-email', input);
}

export async function resendVerification(email: string): Promise<void> {
  await api.post('/auth/resend-verification', { email });
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(input: {
  email: string;
  otp: string;
  password: string;
}): Promise<void> {
  await api.post('/auth/reset-password', input);
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
  // Seed the token so getMe's request interceptor sends it.
  useAuthStore.getState().setToken(accessToken);
  return { accessToken, user: await getMe() };
}
