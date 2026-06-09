'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMe } from '@/features/auth/api';
import { useAuthStore } from '@/store/auth';

function Callback() {
  const router = useRouter();
  const params = useSearchParams();
  const ran = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get('accessToken');
    const { setToken, setAuth, clear } = useAuthStore.getState();
    if (!token) {
      clear();
      router.replace('/login?error=google');
      return;
    }
    setToken(token);
    getMe()
      .then((user) => {
        setAuth(user, token);
        router.replace('/');
      })
      .catch(() => {
        clear();
        setError(true);
        router.replace('/login?error=google');
      });
  }, [params, router]);

  return (
    <div className="container flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">
        {error ? 'Sign-in failed. Redirecting…' : 'Signing you in…'}
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <Callback />
    </Suspense>
  );
}
