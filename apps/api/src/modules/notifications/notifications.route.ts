import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import {
  list,
  unread,
  read,
  readAll,
  pushPublicKey,
  subscribe,
  unsubscribe,
} from './notifications.controller';

const router = Router();
router.use(authenticate);

router.get('/', list);
router.get('/unread-count', unread);
router.post('/read-all', readAll);
router.patch('/:id/read', read);

// Web push
router.get('/push/public-key', pushPublicKey);
router.post('/push/subscribe', subscribe);
router.post('/push/unsubscribe', unsubscribe);

export default router;
