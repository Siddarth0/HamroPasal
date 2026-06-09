'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/features/notifications/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const qc = useQueryClient();
  const status = useAuthStore((s) => s.status);
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(),
    enabled: status === 'authenticated',
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
    qc.invalidateQueries({ queryKey: ['notif-unread'] });
  };
  const readOne = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const readAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });

  if (status === 'loading') {
    return <div className="container py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (status === 'unauthenticated') {
    return (
      <div className="container py-20 text-center">
        <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">Notifications</h1>
        <Button asChild variant="brand" className="mt-5">
          <Link href="/login?returnUrl=/notifications">Log in</Link>
        </Button>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        {items.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => readAll.mutate()}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No notifications yet</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const orderId = (n.data?.orderId as string | undefined) ?? undefined;
            const body = (
              <div
                className={cn(
                  'rounded-2xl border p-4 transition-colors',
                  n.isRead ? 'border-border bg-card' : 'border-brand/30 bg-brand/5',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                </div>
              </div>
            );
            return (
              <li key={n._id} onClick={() => !n.isRead && readOne.mutate(n._id)}>
                {orderId ? <Link href={`/orders/${orderId}`}>{body}</Link> : body}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
