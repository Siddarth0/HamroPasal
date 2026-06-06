/** Domain enums kept in sync with the Prisma `Role` / `OauthProvider` enums. */
export const ROLES = ['CUSTOMER', 'SELLER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const OAUTH_PROVIDERS = ['GOOGLE'] as const;
export type OauthProvider = (typeof OAUTH_PROVIDERS)[number];

/** Public user shape returned by the API (never includes password/refreshToken). */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  isEmailVerified: boolean;
  createdAt: string;
}

/** The principal attached to `req.user` by the auth guard. */
export interface AuthPrincipal {
  userId: string;
  role: Role;
  storeId?: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
}

/* ---- Auth request/response payloads ---- */

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Body returned on register/login (`accessToken` in body, refresh token in cookie). */
export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}
