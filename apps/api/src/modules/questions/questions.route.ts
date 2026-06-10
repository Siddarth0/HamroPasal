import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import { ask, productQuestions, storeQuestions, answer, remove } from './questions.controller';

const router = Router();

// Public: a product's Q&A.
router.get('/product/:productId', productQuestions);

// Seller inbox: questions across the seller's products (?answered=true|false).
router.get('/seller', authenticate, authorize('SELLER'), storeQuestions);

// Authenticated.
router.post('/', authenticate, ask); // any logged-in user asks
router.post('/:id/answer', authenticate, answer); // store owner or admin answers
router.delete('/:id', authenticate, remove); // asker or admin deletes

export default router;
