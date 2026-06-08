import { Queue } from 'bullmq';
import { redis } from './redis';

// Shared BullMQ connection (our ioredis client already sets
// maxRetriesPerRequest: null, which BullMQ requires). Cast bypasses the
// duplicate-ioredis-package nominal type mismatch — same instance at runtime.
export const emailQueue = new Queue('email', { connection: redis as never });

export interface EmailJob {
  to: string;
  subject: string;
  html: string;
}

/** Enqueues a transactional email to be sent by the worker. */
export const enqueueEmail = (data: EmailJob) =>
  emailQueue.add('send', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: 100,
  });
