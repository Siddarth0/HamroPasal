import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { get, add, remove } from './wishlist.controller';

const router = Router();

// Wishlist requires login.
router.use(authenticate);

router.get('/', get);
router.post('/items', add);
router.delete('/items/:productId', remove);

export default router;
