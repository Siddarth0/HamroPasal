'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useAuthStore } from '@/store/auth';
import { restoreSession } from './api';

/**
 * On first mount, attempt to restore the session from the refresh cookie.
 * Leaves status 'loading' until resolved, then 'authenticated'/'unauthenticated'.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const { setAuth, clear } = useAuthStore.getState();
    restoreSession()
      .then(({ user, accessToken }) => setAuth(user, accessToken))
      .catch(() => clear());
  }, []);

  return <>{children}</>;
}
