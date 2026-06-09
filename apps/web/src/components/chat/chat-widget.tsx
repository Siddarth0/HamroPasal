'use client';

import Link from 'next/link';
import { X, ArrowLeft, MessageCircle, Maximize2 } from 'lucide-react';
import { useChatUI } from '@/store/chat-ui';
import { useAuthStore } from '@/store/auth';
import { useConversations } from '@/features/chat/hooks';
import { ChatThread } from './chat-thread';
import { ConversationList } from './conversation-list';

export function ChatWidget() {
  const status = useAuthStore((s) => s.status);
  const { open, view, conversationId, draft, openConversation, setConversation, back, close } =
    useChatUI();
  const { data: conversations } = useConversations();

  if (!open) return null;

  const activeConvo = conversations?.find((c) => c._id === conversationId);
  const threadTitle = draft ? 'New message' : activeConvo?.counterpart?.name ?? 'Chat';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {view === 'thread' && (
            <button onClick={back} aria-label="Back to conversations" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <span className="truncate text-sm font-semibold">
            {view === 'thread' ? threadTitle : 'Messages'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Link href="/messages" onClick={close} aria-label="Open full inbox" className="rounded p-1 hover:text-foreground">
            <Maximize2 className="h-4 w-4" />
          </Link>
          <button onClick={close} aria-label="Close chat" className="rounded p-1 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {status !== 'authenticated' ? (
          <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
            <div>
              <MessageCircle className="mx-auto h-8 w-8" />
              <p className="mt-2">Log in to chat with sellers.</p>
              <Link href="/login" onClick={close} className="mt-1 inline-block font-medium text-brand hover:underline">
                Log in
              </Link>
            </div>
          </div>
        ) : view === 'list' ? (
          <div className="h-full overflow-y-auto p-2">
            <ConversationList activeId={conversationId} onSelect={openConversation} />
          </div>
        ) : (
          <ChatThread
            conversationId={conversationId ?? undefined}
            draft={draft}
            onCreated={setConversation}
          />
        )}
      </div>
    </div>
  );
}
