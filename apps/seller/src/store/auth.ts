import { create } from 'zustand';
import type { PublicUser } from 'shared-types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: PublicUser | null;
  /** Access token kept in memory only; the refresh token lives in an httpOnly cookie. */
  accessToken: string | null;
  status: AuthStatus;
  setAuth: (user: PublicUser, accessToken: string) => void;
  setUser: (user: PublicUser) => void;
  setToken: (accessToken: string) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'loading',
  setAuth: (user, accessToken) => set({ user, accessToken, status: 'authenticated' }),
  setUser: (user) => set({ user }),
  setToken: (accessToken) => set({ accessToken }),
  setStatus: (status) => set({ status }),
  clear: () => set({ user: null, accessToken: null, status: 'unauthenticated' }),
}));

/** Read the current token outside React (used by the axios interceptor). */
export const getAccessToken = () => useAuthStore.getState().accessToken;
