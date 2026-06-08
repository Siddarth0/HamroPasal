import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { sendMessage, listConversations, getMessages, markRead } from './chat.service';
import { sendMessageSchema } from './chat.validation';
import { getPagination } from '@/shared/utils/pagination';

export const send = asyncHandler(async (req, res) => {
  const data = sendMessageSchema.parse(req.body);
  const { message } = await sendMessage({ senderId: req.user!.userId, ...data });
  ApiResponse.created(res, message, 'Message sent');
});

export const conversations = asyncHandler(async (req, res) => {
  const list = await listConversations(req.user!.userId);
  ApiResponse.success(res, list);
});

export const messages = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await getMessages(req.user!.userId, String(req.params.id), pagination);
  ApiResponse.paginated(res, items, meta);
});

export const read = asyncHandler(async (req, res) => {
  await markRead(req.user!.userId, String(req.params.id));
  ApiResponse.success(res, undefined, 'Conversation marked as read');
});
