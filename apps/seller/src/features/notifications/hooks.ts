import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { fetchUnreadCount, fetchNotifications } from './api';

export function useUnreadCount(): number {
  const status = useAuthStore((s) => s.status);
  const { data } = useQuery({
    queryKey: ['notif-unread'],
    queryFn: fetchUnreadCount,
    enabled: status === 'authenticated',
  });
  return data ?? 0;
}

export function useNotifications() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(),
    enabled: status === 'authenticated',
  });
}
