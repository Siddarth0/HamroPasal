'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { API_URL } from '@/lib/api';

const SocketContext = createContext<Socket | null>(null);

/** The shared Socket.io connection (null when not connected). */
export const useSocket = () => useContext(SocketContext);

// Socket.io attaches at the server root, not the /api prefix.
const SOCKET_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function SocketProvider({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !token) return;

    const s = io(SOCKET_ORIGIN, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    setSocket(s);

    s.on('notification:new', () => {
      qc.invalidateQueries({ queryKey: ['notif-unread'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    });

    s.on('chat:message', (payload: { conversationId: string }) => {
      qc.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (payload?.conversationId) {
        qc.invalidateQueries({ queryKey: ['chat-messages', payload.conversationId] });
      }
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [status, token, qc]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
