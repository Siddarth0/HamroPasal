import { Notification } from '@/models/notification.model';
import { PushSubscription } from '@/models/push-subscription.model';
import { emitToUser } from '@/config/socket';
import { sendPush } from '@/config/webpush';
import { ApiError } from '@/shared/utils/api-error';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';

interface NotificationInput {
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Persists a notification, pushes it to the user's live sockets, and fires a
 * web-push (best-effort). Safe to call from anywhere (fire-and-forget friendly).
 */
export const createNotification = async (userId: string, input: NotificationInput) => {
  const notification = await Notification.create({ userId, ...input });

  emitToUser(userId, 'notification:new', notification);

  // Web push to all of the user's registered subscriptions (best-effort).
  const subs = await PushSubscription.find({ userId });
  await Promise.all(
    subs.map(async (s) => {
      const ok = await sendPush(
        { endpoint: s.endpoint, keys: s.keys },
        { title: input.title, body: input.body, data: input.data },
      );
      if (!ok) await PushSubscription.deleteOne({ _id: s._id }); // prune dead subscriptions
    }),
  );

  return notification;
};

export const listNotifications = async (userId: string, pagination: Pagination) => {
  const [items, total] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.take),
    Notification.countDocuments({ userId }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const unreadCount = (userId: string) =>
  Notification.countDocuments({ userId, isRead: false });

export const markRead = async (userId: string, notificationId: string) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true },
  );
  if (!notification) throw new ApiError('Notification not found', 404);
  return notification;
};

export const markAllRead = async (userId: string) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

/* ------------------------------ Web push subscriptions ------------------------------ */

export const savePushSubscription = async (
  userId: string,
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
) => {
  await PushSubscription.updateOne(
    { endpoint: sub.endpoint },
    { userId, endpoint: sub.endpoint, keys: sub.keys },
    { upsert: true },
  );
};

export const removePushSubscription = (userId: string, endpoint: string) =>
  PushSubscription.deleteOne({ userId, endpoint });
