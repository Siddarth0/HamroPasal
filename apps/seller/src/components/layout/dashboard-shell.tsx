'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useAuthStore } from '@/store/auth';

/**
 * Guards the seller area: while the session restores we show a spinner; once
 * resolved, non-sellers are bounced to /login (customers/admins included).
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const allowed = status === 'authenticated' && user?.role === 'SELLER';

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated' && user && user.role !== 'SELLER') router.replace('/login');
  }, [status, user, router]);

  if (!allowed) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:pl-64">
      <Sidebar />
      <Topbar />
      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
