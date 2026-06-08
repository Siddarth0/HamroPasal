export type ChatRole = 'CUSTOMER' | 'SELLER';

export interface ChatProductRef {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: ChatRole;
  text: string;
  product?: ChatProductRef;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationSummary {
  _id: string;
  storeId: string;
  lastMessage?: { text: string; senderRole: ChatRole; createdAt: string };
  unread: number;
  counterpart: Record<string, unknown>;
  updatedAt: string;
}
