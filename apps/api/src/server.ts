import path from 'node:path';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '../../../.env') });

import http from 'http';
import app from './app';
import { connectMongo, disconnectMongo } from './config/db.mongo';
import { prisma } from './config/db.postgres';
import { disconnectRedis } from './config/redis';
import { initSocket, closeSocket } from './config/socket';
import { registerChatSocket } from './modules/chat/chat.socket';
import { emailWorker } from './jobs/email.worker';

const PORT = process.env.PORT ?? 4000;

async function bootstrap(): Promise<void> {
  await connectMongo();
  await prisma.$connect();
  console.log('✅ PostgreSQL connected');

  const httpServer = http.createServer(app);

  // Real-time: Socket.io + chat handlers.
  const io = initSocket(httpServer);
  registerChatSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV ?? 'development'}`);
  });

  //---------
  const shutdown = async (signal: string) => {
    console.log(`\n⚠️  ${signal} — shutting down...`);
    httpServer.close(async () => {
      await Promise.allSettled([
        closeSocket(),
        emailWorker.close(),
        prisma.$disconnect(),
        disconnectMongo(),
        disconnectRedis(),
      ]);
      console.log('✅ Connections closed. Exiting.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});
