import webpush from 'web-push';
import { env } from './env';

export const isPushConfigured = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);

if (isPushConfigured) {
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
} else {
  console.warn('⚠️  Web Push disabled (VAPID keys not set)');
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Sends a push payload; resolves false on failure (e.g. expired subscription). */
export const sendPush = async (
  sub: PushSubscriptionInput,
  payload: { title: string; body: string; data?: Record<string, unknown> },
): Promise<boolean> => {
  if (!isPushConfigured) return false;
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
};

export { webpush };
