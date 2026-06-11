'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/auth-provider';
import { SocketProvider } from '@/features/realtime/socket-provider';
import { ChatWidget } from '@/components/chat/chat-widget';
import { BackendStatus } from '@/components/layout/backend-status';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <SocketProvider>
          {children}
          <ChatWidget />
          <BackendStatus />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
