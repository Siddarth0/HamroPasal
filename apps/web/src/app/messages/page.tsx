'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import type { ChatDraft } from '@/features/chat/api';
import { useConversations } from '@/features/chat/hooks';
import { ChatThread } from '@/components/chat/chat-thread';
import { ConversationList } from '@/components/chat/conversation-list';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Messages() {
  const params = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ChatDraft | null>(null);
  const { data: convos } = useConversations();

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

  const activeConvo = convos?.find((c) => c._id === activeId);
  const title = draft ? 'New message' : activeConvo?.counterpart?.name ?? 'Chat';
  const hasThread = !!activeId || !!draft;

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-bold">Messages</h1>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className={cn(hasThread && 'hidden lg:block')}>
          <ConversationList
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id);
              setDraft(null);
            }}
          />
        </aside>

        <div className={cn(!hasThread && 'hidden lg:block')}>
          {hasThread ? (
            <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <button
                  onClick={() => {
                    setActiveId(null);
                    setDraft(null);
                  }}
                  className="text-muted-foreground hover:text-foreground lg:hidden"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold">{title}</span>
              </div>
              <div className="min-h-0 flex-1">
                <ChatThread
                  conversationId={activeId ?? undefined}
                  draft={draft}
                  onCreated={(id) => {
                    setActiveId(id);
                    setDraft(null);
                  }}
                />
              </div>
            </div>
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
