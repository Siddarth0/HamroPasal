import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// Shared axios instance. Access token (kept in memory / Zustand) is attached by
// an interceptor we'll add with the auth slice; refresh uses the httpOnly cookie.
export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
