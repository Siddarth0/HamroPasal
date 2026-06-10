'use client';

import { useConversations } from '@/features/chat/hooks';
import { cn, formatDate } from '@/lib/utils';

export function ConversationList({
  activeId,
  onSelect,
}: {
  activeId?: string | null;
  onSelect: (id: string) => void;
}) {
  const { data, isLoading } = useConversations();
  const conversations = data ?? [];

  if (isLoading) return <p className="p-4 text-sm text-muted-foreground">Loading…</p>;
  if (conversations.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        No conversations yet. Customers can start a chat from your product pages.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((c) => (
        <button
          key={c._id}
          onClick={() => onSelect(c._id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors',
            activeId === c._id ? 'bg-brand/10' : 'hover:bg-muted',
          )}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold">
            {c.counterpart?.name?.[0]?.toUpperCase() ?? 'C'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{c.counterpart?.name ?? 'Customer'}</span>
              {c.unread > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                  {c.unread}
                </span>
              )}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {c.lastMessage
                ? `${c.lastMessage.senderRole === 'SELLER' ? 'You: ' : ''}${c.lastMessage.text}`
                : 'No messages yet'}
            </span>
          </span>
          {c.lastMessage && (
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatDate(c.lastMessage.createdAt)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
