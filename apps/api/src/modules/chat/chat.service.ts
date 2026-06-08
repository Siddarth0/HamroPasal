import { Conversation, type IConversation } from '@/models/conversation.model';
import { Message } from '@/models/message.model';
import { Product } from '@/models/product.model';
import { prisma } from '@/config/db.postgres';
import { emitToUser } from '@/config/socket';
import { ApiError } from '@/shared/utils/api-error';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';

type ChatRole = 'CUSTOMER' | 'SELLER';

const isParticipant = (convo: IConversation, userId: string) =>
  convo.customerId === userId || convo.sellerId === userId;

const getOrCreateConversation = async (customerId: string, storeId: string) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, ownerId: true },
  });
  if (!store) throw new ApiError('Store not found', 404);
  if (store.ownerId === customerId) throw new ApiError('You cannot chat with your own store', 400);

  const existing = await Conversation.findOne({ customerId, storeId });
  return existing ?? Conversation.create({ customerId, storeId, sellerId: store.ownerId });
};

/* ------------------------------- Send ------------------------------- */

export const sendMessage = async (params: {
  senderId: string;
  text: string;
  conversationId?: string;
  storeId?: string;
  productId?: string;
}) => {
  const text = params.text?.trim();
  if (!text) throw new ApiError('Message text is required', 400);

  let convo: IConversation | null;
  if (params.conversationId) {
    convo = await Conversation.findById(params.conversationId);
    if (!convo) throw new ApiError('Conversation not found', 404);
  } else if (params.storeId) {
    // Only a customer starts a thread from a store/product page.
    convo = await getOrCreateConversation(params.senderId, params.storeId);
  } else {
    throw new ApiError('conversationId or storeId is required', 400);
  }

  let senderRole: ChatRole;
  let recipientId: string;
  if (params.senderId === convo.customerId) {
    senderRole = 'CUSTOMER';
    recipientId = convo.sellerId;
  } else if (params.senderId === convo.sellerId) {
    senderRole = 'SELLER';
    recipientId = convo.customerId;
  } else {
    throw new ApiError('You are not part of this conversation', 403);
  }

  // Snapshot the attached product (so the card survives later product edits).
  let product;
  if (params.productId) {
    const p = await Product.findById(params.productId).select('name slug images price').lean();
    if (p) {
      product = {
        productId: String(p._id),
        name: p.name,
        slug: p.slug,
        image: p.images?.[0]?.url,
        price: p.price,
      };
    }
  }

  const message = await Message.create({
    conversationId: convo._id,
    senderId: params.senderId,
    senderRole,
    text,
    product,
  });

  convo.lastMessage = { text, senderRole, createdAt: message.createdAt };
  if (senderRole === 'CUSTOMER') convo.sellerUnread += 1;
  else convo.customerUnread += 1;
  await convo.save();

  // Real-time delivery to the recipient + echo to the sender's other devices.
  const payload = { message, conversationId: String(convo._id) };
  emitToUser(recipientId, 'chat:message', payload);
  emitToUser(params.senderId, 'chat:message', payload);

  return { message, conversation: convo, recipientId };
};

/* ------------------------------- Inbox ------------------------------- */

export const listConversations = async (userId: string) => {
  const convos = await Conversation.find({ $or: [{ customerId: userId }, { sellerId: userId }] })
    .sort({ updatedAt: -1 })
    .lean();

  // Enrich each thread with the counterpart (store for the customer view,
  // customer for the seller view) + the unread count relevant to this viewer.
  const storeIds = [...new Set(convos.map((c) => c.storeId))];
  const customerIds = [...new Set(convos.map((c) => c.customerId))];

  const [stores, customers] = await Promise.all([
    prisma.store.findMany({ where: { id: { in: storeIds } }, select: { id: true, name: true, slug: true, logoUrl: true } }),
    prisma.user.findMany({ where: { id: { in: customerIds } }, select: { id: true, name: true, avatarUrl: true } }),
  ]);
  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  return convos.map((c) => {
    const viewerIsCustomer = c.customerId === userId;
    return {
      _id: String(c._id),
      storeId: c.storeId,
      lastMessage: c.lastMessage,
      unread: viewerIsCustomer ? c.customerUnread : c.sellerUnread,
      counterpart: viewerIsCustomer
        ? { type: 'store', ...storeMap.get(c.storeId) }
        : { type: 'customer', ...customerMap.get(c.customerId) },
      updatedAt: (c as any).updatedAt,
    };
  });
};

/* ------------------------------- History ------------------------------- */

export const getMessages = async (
  userId: string,
  conversationId: string,
  pagination: Pagination,
) => {
  const convo = await Conversation.findById(conversationId);
  if (!convo) throw new ApiError('Conversation not found', 404);
  if (!isParticipant(convo, userId)) throw new ApiError('Not allowed', 403);

  const [items, total] = await Promise.all([
    Message.find({ conversationId }).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.take),
    Message.countDocuments({ conversationId }),
  ]);

  await markConversationRead(convo, userId);

  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

const markConversationRead = async (convo: IConversation, userId: string) => {
  if (convo.customerId === userId) {
    if (convo.customerUnread === 0) return;
    convo.customerUnread = 0;
    await Promise.all([
      convo.save(),
      Message.updateMany({ conversationId: convo._id, senderRole: 'SELLER', isRead: false }, { isRead: true }),
    ]);
  } else if (convo.sellerId === userId) {
    if (convo.sellerUnread === 0) return;
    convo.sellerUnread = 0;
    await Promise.all([
      convo.save(),
      Message.updateMany({ conversationId: convo._id, senderRole: 'CUSTOMER', isRead: false }, { isRead: true }),
    ]);
  }
};

export const markRead = async (userId: string, conversationId: string) => {
  const convo = await Conversation.findById(conversationId);
  if (!convo) throw new ApiError('Conversation not found', 404);
  if (!isParticipant(convo, userId)) throw new ApiError('Not allowed', 403);
  await markConversationRead(convo, userId);
};
