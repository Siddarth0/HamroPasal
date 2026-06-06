import Redis from 'ioredis';
import { env } from './env';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required for BullMQ later
    lazyConnect: false,
  });

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err.message));

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export const disconnectRedis = async (): Promise<void> => {
  await redis.quit();
};
