import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { get, add, update, remove, clear } from './cart.controller';

const router = Router();

// All cart routes require login (no guest cart).
router.use(authenticate);

router.get('/', get);
router.post('/items', add);
router.patch('/items', update);
router.delete('/items/:productId', remove); // ?variantId= for a specific variant
router.delete('/', clear);

export default router;
