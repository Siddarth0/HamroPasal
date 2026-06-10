'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, EmptyState } from '@/components/shared/states';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications, useUnreadCount } from '@/features/notifications/hooks';
import {
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from '@/features/notifications/api';
import { cn, formatDateTime } from '@/lib/utils';

function hrefFor(n: AppNotification): string | null {
  if (n.data?.questionId || n.type === 'NEW_QUESTION') return '/questions';
  if (n.data?.conversationId || n.type === 'NEW_MESSAGE') return '/messages';
  if (n.data?.orderId || n.type === 'NEW_ORDER' || n.type === 'ORDER_STATUS') return '/orders';
  return null;
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useNotifications();
  const unread = useUnreadCount();
  const items = data?.items ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
    qc.invalidateQueries({ queryKey: ['notif-unread'] });
  };

  const onRead = async (id: string) => {
    await markNotificationRead(id);
    invalidate();
  };
  const onReadAll = async () => {
    await markAllNotificationsRead();
    invalidate();
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Orders, questions and messages"
        action={
          unread > 0 ? (
            <Button variant="outline" onClick={onReadAll}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {isLoading && <LoadingBlock />}

      {data && items.length === 0 && (
        <EmptyState icon={<Bell className="h-10 w-10" />} title="No notifications yet" />
      )}

      {items.length > 0 && (
        <Card className="divide-y divide-border overflow-hidden">
          {items.map((n) => {
            const href = hrefFor(n);
            const body = (
              <div
                className={cn(
                  'flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40',
                  !n.isRead && 'bg-brand/5',
                )}
              >
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onRead(n._id);
                    }}
                    className="shrink-0 text-xs text-brand hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
            return href ? (
              <Link key={n._id} href={href} onClick={() => !n.isRead && onRead(n._id)}>
                {body}
              </Link>
            ) : (
              <div key={n._id}>{body}</div>
            );
          })}
        </Card>
      )}
    </>
  );
}
