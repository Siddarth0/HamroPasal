import type { PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

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
  senderRole: 'CUSTOMER' | 'SELLER';
  text: string;
  product?: ChatProductRef;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  storeId: string;
  lastMessage?: { text: string; senderRole: string; createdAt: string };
  unread: number;
  // For the seller view the counterpart is the customer.
  counterpart: { type: string; id?: string; name?: string; avatarUrl?: string | null };
  updatedAt: string;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const { data } = await api.get<ApiEnvelope<Conversation[]>>('/chat/conversations');
  return data.data;
}

export async function fetchMessages(
  conversationId: string,
  page = 1,
): Promise<{ items: ChatMessage[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<ChatMessage[]>>(
    `/chat/conversations/${conversationId}/messages`,
    { params: { page, limit: 50 } },
  );
  return { items: data.data, meta: data.meta };
}

/** Sellers can only reply within an existing conversation (customers start threads). */
export async function sendChatMessage(input: {
  text: string;
  conversationId: string;
}): Promise<ChatMessage> {
  const { data } = await api.post<ApiEnvelope<ChatMessage>>('/chat/messages', input);
  return data.data;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await api.post(`/chat/conversations/${conversationId}/read`);
}
