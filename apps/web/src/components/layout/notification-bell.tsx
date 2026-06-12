'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUnreadCount, useNotifications } from '@/features/notifications/hooks';
import { markAllNotificationsRead } from '@/features/notifications/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  // Close on outside click / Escape (robust across stacking contexts).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);
  const unread = useUnreadCount();
  const { data } = useNotifications();
  const items = (data?.items ?? []).slice(0, 6);

  // Opening the panel counts as "seen" — clear the unread badge immediately
  // (optimistic) and persist it, so users don't have to hit "Mark all read".
  useEffect(() => {
    if (!open || unread === 0) return;
    qc.setQueryData(['notif-unread'], 0);
    markAllNotificationsRead()
      .then(() => qc.invalidateQueries({ queryKey: ['notifications'] }))
      .catch(() => qc.invalidateQueries({ queryKey: ['notif-unread'] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const markAll = async () => {
    await markAllNotificationsRead();
    qc.invalidateQueries({ queryKey: ['notifications'] });
    qc.invalidateQueries({ queryKey: ['notif-unread'] });
  };

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setOpen((o) => !o)}>
        <Bell className="h-5 w-5" />
      </Button>
      {unread > 0 && (
        <span className="pointer-events-none absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
          {unread > 99 ? '99+' : unread}
        </span>
      )}

      {open && (
        <>
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-sm font-semibold">Notifications</span>
              {items.some((n) => !n.isRead) && (
                <button onClick={markAll} className="text-xs text-brand hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No notifications</p>
              ) : (
                items.map((n) => {
                  const orderId = n.data?.orderId as string | undefined;
                  const inner = (
                    <div className={cn('px-4 py-3 hover:bg-muted', !n.isRead && 'bg-brand/5')}>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                  return orderId ? (
                    <Link key={n._id} href={`/orders/${orderId}`} onClick={() => setOpen(false)}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={n._id}>{inner}</div>
                  );
                })
              )}
            </div>

            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-border px-4 py-2.5 text-center text-sm font-medium text-brand hover:bg-muted"
            >
              View all
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
