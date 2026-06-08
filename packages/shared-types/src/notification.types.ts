export interface AppNotification {
  _id: string;
  userId: string;
  type: string; // ORDER_PLACED | NEW_ORDER | ORDER_STATUS | PAYMENT_RECEIVED | ...
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}
