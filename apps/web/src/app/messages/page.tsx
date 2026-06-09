'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { fetchConversations } from '@/features/chat/api';
import { ChatThread, type ChatDraft } from '@/components/chat/chat-thread';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Messages() {
  const params = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ChatDraft | null>(null);

  useEffect(() => {
    const storeId = params.get('storeId');
    if (storeId) {
      setDraft({
        storeId,
        productId: params.get('productId') ?? undefined,
        pname: params.get('pname') ?? undefined,
        pimg: params.get('pimg') ?? undefined,
      });
      setActiveId(null);
    }
  }, [params]);

  const { data: convos } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: fetchConversations,
    enabled: status === 'authenticated',
  });

  if (status === 'loading') {
    return <div className="container py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (status === 'unauthenticated') {
    return (
      <div className="container py-20 text-center">
        <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">Messages</h1>
        <Button asChild variant="brand" className="mt-5">
          <Link href="/login?returnUrl=/messages">Log in</Link>
        </Button>
      </div>
    );
  }

  const conversations = convos ?? [];
  const activeConvo = conversations.find((c) => c._id === activeId);
  const title = draft ? 'New message' : activeConvo?.counterpart?.name ?? 'Chat';
  const hasThread = !!activeId || !!draft;

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-bold">Messages</h1>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className={cn('space-y-1', hasThread && 'hidden lg:block')}>
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => {
                  setActiveId(c._id);
                  setDraft(null);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
                  activeId === c._id ? 'bg-brand/10' : 'hover:bg-muted',
                )}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold">
                  {c.counterpart?.name?.[0]?.toUpperCase() ?? 'S'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{c.counterpart?.name ?? 'Store'}</span>
                    {c.unread > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                        {c.unread}
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c.lastMessage?.text ?? 'No messages yet'}
                  </span>
                </span>
              </button>
            ))
          )}
        </aside>

        <div className={cn(!hasThread && 'hidden lg:block')}>
          {hasThread ? (
            <>
              <button
                onClick={() => {
                  setActiveId(null);
                  setDraft(null);
                }}
                className="mb-2 flex items-center gap-1 text-sm text-muted-foreground lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <ChatThread
                conversationId={activeId ?? undefined}
                draft={draft}
                title={title}
                onCreated={(id) => {
                  setActiveId(id);
                  setDraft(null);
                }}
              />
            </>
          ) : (
            <div className="grid h-[70vh] place-items-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="mx-auto h-10 w-10" />
                <p className="mt-2">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <Messages />
    </Suspense>
  );
}
