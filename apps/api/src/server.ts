import 'dotenv/config';
import http from 'http';
import app from './app';
import { connectMongo } from './config/db.mongo';
import { prisma } from './config/db.postgres';

const PORT = process.env.PORT ?? 4000;

async function bootstrap(): Promise<void> {
  await connectMongo();
  await prisma.$connect();
  console.log('✅ PostgreSQL connected');

  const httpServer = http.createServer(app);

  httpServer.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV ?? 'development'}`);
  });

  //---------
  const shutdown = async (signal: string) => {
    console.log(`\n⚠️  ${signal} — shutting down...`);
    httpServer.close(async () => {
      await prisma.$disconnect();
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
