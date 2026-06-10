'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X, MessageSquare } from 'lucide-react';
import { Logo } from './logo';
import { NAV, isNavActive } from './nav-items';
import { NotificationBell } from './notification-bell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { logout as logoutApi } from '@/features/auth/api';
import { useMyStore } from '@/features/store/hooks';
import { useChatUnread } from '@/features/chat/hooks';
import { cn } from '@/lib/utils';

const STORE_STATUS_VARIANT = {
  ACTIVE: 'success',
  PENDING: 'warning',
  SUSPENDED: 'danger',
} as const;

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const { data: store } = useMyStore();
  const chatUnread = useChatUnread();

  const handleLogout = async () => {
    await logoutApi().catch(() => undefined);
    clear();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-lg hover:bg-muted lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="lg:hidden">
            <Logo />
          </div>
          {store && (
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-sm font-semibold text-foreground">{store.name}</span>
              <Badge variant={STORE_STATUS_VARIANT[store.status]}>{store.status}</Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/messages" className="relative" aria-label="Messages">
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
            {chatUnread > 0 && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                {chatUnread > 99 ? '99+' : chatUnread}
              </span>
            )}
          </Link>
          <NotificationBell />
          {user && (
            <div className="ml-1 hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout} className="ml-1">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="space-y-1 border-t border-border px-3 py-3 lg:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isNavActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  active ? 'bg-brand text-brand-foreground' : 'hover:bg-muted',
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
