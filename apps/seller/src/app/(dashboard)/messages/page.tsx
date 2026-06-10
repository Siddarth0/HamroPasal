'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock } from '@/components/shared/states';
import { NoStorePrompt } from '@/components/shared/no-store';
import { Card } from '@/components/ui/card';
import { ConversationList } from '@/components/chat/conversation-list';
import { ChatThread } from '@/components/chat/chat-thread';
import { useMyStore } from '@/features/store/hooks';
import { useConversations } from '@/features/chat/hooks';

export default function MessagesPage() {
  const { data: store, isLoading: storeLoading } = useMyStore();
  const { data: conversations } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Default to the first conversation on larger screens.
  useEffect(() => {
    if (!activeId && conversations && conversations.length > 0) {
      setActiveId(conversations[0]._id);
    }
  }, [conversations, activeId]);

  if (storeLoading) return <LoadingBlock />;
  if (!store) {
    return (
      <>
        <PageHeader title="Messages" />
        <NoStorePrompt />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Messages" description="Chat with customers about your products" />

      <Card className="grid h-[calc(100vh-13rem)] grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]">
        <div className="overflow-y-auto border-b border-border p-2 md:border-b-0 md:border-r">
          <ConversationList activeId={activeId} onSelect={setActiveId} />
        </div>
        <div className="min-h-0">
          {activeId ? (
            <ChatThread key={activeId} conversationId={activeId} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10" />
              <p className="text-sm">Select a conversation to start replying.</p>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
