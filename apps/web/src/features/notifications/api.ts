import type { PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export async function fetchNotifications(
  page = 1,
): Promise<{ items: AppNotification[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<AppNotification[]>>('/notifications', {
    params: { page, limit: 20 },
  });
  return { items: data.data, meta: data.meta };
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<ApiEnvelope<{ count: number }>>('/notifications/unread-count');
  return data.data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/notifications/read-all');
}
