import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { send, conversations, messages, read } from './chat.controller';

const router = Router();
router.use(authenticate);

// Send a message (start a thread with { storeId, productId } or reply with { conversationId }).
router.post('/messages', send);

// Inbox + history
router.get('/conversations', conversations);
router.get('/conversations/:id/messages', messages);
router.post('/conversations/:id/read', read);

export default router;
