import type { Server } from 'socket.io';
import { emitToUser } from '@/config/socket';
import { sendMessage, markRead } from './chat.service';

// Registers real-time chat events. `sendMessage` itself emits `chat:message`
// to the recipient + sender, so the ack just confirms to the originator.
export const registerChatSocket = (io: Server): void => {
  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;

    socket.on('chat:send', async (data, ack?: (res: unknown) => void) => {
      try {
        const { message } = await sendMessage({ senderId: userId, ...data });
        ack?.({ ok: true, message });
      } catch (err) {
        ack?.({ ok: false, error: (err as Error).message });
      }
    });

    socket.on('chat:read', async (data: { conversationId?: string }) => {
      if (data?.conversationId) {
        await markRead(userId, data.conversationId).catch(() => undefined);
      }
    });

    // Transient typing indicator relayed to the counterpart.
    socket.on('chat:typing', (data: { recipientId?: string; conversationId?: string }) => {
      if (data?.recipientId) {
        emitToUser(data.recipientId, 'chat:typing', {
          conversationId: data.conversationId,
          from: userId,
        });
      }
    });
  });
};
