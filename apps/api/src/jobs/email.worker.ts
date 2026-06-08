import { Worker } from 'bullmq';
import { redis } from '@/config/redis';
import { sendEmail } from '@/modules/notifications/email.service';
import type { EmailJob } from '@/config/queue';

// Processes queued transactional emails. Uses a dedicated Redis connection
// (BullMQ workers need their own blocking connection).
export const emailWorker = new Worker<EmailJob>(
  'email',
  async (job) => {
    await sendEmail(job.data);
  },
  { connection: redis.duplicate() as never },
);

emailWorker.on('failed', (job, err) => {
  console.error(`✉️  email job ${job?.id} failed:`, err.message);
});
