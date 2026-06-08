import { z } from 'zod';
import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { getPagination } from '@/shared/utils/pagination';
import { env } from '@/config/env';
import {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
  savePushSubscription,
  removePushSubscription,
} from './notifications.service';

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export const list = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listNotifications(req.user!.userId, pagination);
  ApiResponse.paginated(res, items, meta);
});

export const unread = asyncHandler(async (req, res) => {
  ApiResponse.success(res, { count: await unreadCount(req.user!.userId) });
});

export const read = asyncHandler(async (req, res) => {
  const notification = await markRead(req.user!.userId, String(req.params.id));
  ApiResponse.success(res, notification, 'Marked as read');
});

export const readAll = asyncHandler(async (req, res) => {
  await markAllRead(req.user!.userId);
  ApiResponse.success(res, undefined, 'All marked as read');
});

/* ------------------------------ Web push ------------------------------ */

export const pushPublicKey = asyncHandler(async (_req, res) => {
  ApiResponse.success(res, { publicKey: env.VAPID_PUBLIC_KEY || null });
});

export const subscribe = asyncHandler(async (req, res) => {
  const sub = subscriptionSchema.parse(req.body);
  await savePushSubscription(req.user!.userId, sub);
  ApiResponse.success(res, undefined, 'Subscribed to push notifications');
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = z.object({ endpoint: z.string().url() }).parse(req.body);
  await removePushSubscription(req.user!.userId, endpoint);
  ApiResponse.success(res, undefined, 'Unsubscribed');
});
