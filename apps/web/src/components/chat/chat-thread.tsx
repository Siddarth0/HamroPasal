'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import {
  fetchMessages,
  sendChatMessage,
  markConversationRead,
} from '@/features/chat/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

export interface ChatDraft {
  storeId: string;
  productId?: string;
  pname?: string;
  pimg?: string;
}

export function ChatThread({
  conversationId,
  draft,
  title,
  onCreated,
}: {
  conversationId?: string;
  draft?: ChatDraft | null;
  title?: string;
  onCreated: (id: string) => void;
}) {
  const qc = useQueryClient();
  const myId = useAuthStore((s) => s.user?.id);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
  });

  const messages = [...(data?.items ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const count = messages.length;

  // Mark read on open / when new messages land.
  useEffect(() => {
    if (!conversationId) return;
    markConversationRead(conversationId)
      .then(() => {
        qc.invalidateQueries({ queryKey: ['chat-conversations'] });
        qc.invalidateQueries({ queryKey: ['notif-unread'] });
      })
      .catch(() => undefined);
  }, [conversationId, count, qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [count]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setError(null);
    setSending(true);
    try {
      const msg = await sendChatMessage({
        text: t,
        conversationId,
        storeId: conversationId ? undefined : draft?.storeId,
        productId: conversationId ? undefined : draft?.productId,
      });
      setText('');
      qc.invalidateQueries({ queryKey: ['chat-messages', conversationId ?? msg.conversationId] });
      qc.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (!conversationId) onCreated(msg.conversationId);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send message'));
    } finally {
      setSending(false);
    }
  };

  const showProductChip = !conversationId && !!draft?.pname;

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3 text-sm font-semibold">{title ?? 'Chat'}</div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {count === 0 && !showProductChip && (
          <p className="pt-10 text-center text-sm text-muted-foreground">Start the conversation…</p>
        )}
        {messages.map((m) => {
          const own = m.senderId === myId;
          return (
            <div key={m._id} className={cn('flex', own ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[78%] rounded-2xl px-3 py-2 text-sm',
                  own ? 'bg-brand text-brand-foreground' : 'bg-muted',
                )}
              >
                {m.product && (
                  <Link
                    href={`/product/${m.product.slug}`}
                    className={cn('mb-2 flex gap-2 rounded-lg p-2', own ? 'bg-white/15' : 'bg-background')}
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {m.product.image && <Image src={m.product.image} alt="" fill className="object-cover" />}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-1 text-xs font-medium">{m.product.name}</span>
                      <span className="block text-xs">{formatPrice(m.product.price)}</span>
                    </span>
                  </Link>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
                <p className={cn('mt-1 text-[10px]', own ? 'text-white/70' : 'text-muted-foreground')}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {showProductChip && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2 text-xs">
          {draft?.pimg && (
            <span className="relative h-8 w-8 overflow-hidden rounded">
              <Image src={draft.pimg} alt="" fill className="object-cover" />
            </span>
          )}
          <span className="line-clamp-1">
            Asking about: <span className="font-medium">{draft?.pname}</span>
          </span>
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" variant="brand" size="icon" disabled={sending} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {error && <p className="px-4 pb-2 text-xs text-brand">{error}</p>}
    </div>
  );
}
