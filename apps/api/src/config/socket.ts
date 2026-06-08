import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import { verifyAccessToken } from '@/shared/utils/jwt';
import { env } from './env';

let io: Server | null = null;

const userRoom = (userId: string) => `user:${userId}`;

/** Initializes Socket.io with JWT auth; every socket joins its own user room. */
export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, env.SELLER_URL, env.ADMIN_URL],
      credentials: true,
    },
  });

  // Authenticate via access token in the handshake (auth.token).
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Unauthorized'));
      const { userId } = verifyAccessToken(token);
      socket.data.userId = userId;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(userRoom(socket.data.userId as string));
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

/** Emits an event to all of a user's connected sockets (no-op if io not ready). */
export const emitToUser = (userId: string, event: string, payload: unknown): void => {
  io?.to(userRoom(userId)).emit(event, payload);
};

export const closeSocket = async (): Promise<void> => {
  await io?.close();
};
