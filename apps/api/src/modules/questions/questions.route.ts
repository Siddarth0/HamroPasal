import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { ask, productQuestions, answer, remove } from './questions.controller';

const router = Router();

// Public: a product's Q&A.
router.get('/product/:productId', productQuestions);

// Authenticated.
router.post('/', authenticate, ask); // any logged-in user asks
router.post('/:id/answer', authenticate, answer); // store owner or admin answers
router.delete('/:id', authenticate, remove); // asker or admin deletes

export default router;
