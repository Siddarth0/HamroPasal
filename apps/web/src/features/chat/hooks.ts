import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { fetchConversations } from './api';

export function useConversations() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['chat-conversations'],
    queryFn: fetchConversations,
    enabled: status === 'authenticated',
  });
}

/** Total unread chat messages across conversations — for the header badge. */
export function useChatUnread(): number {
  const { data } = useConversations();
  return (data ?? []).reduce((sum, c) => sum + (c.unread || 0), 0);
}
