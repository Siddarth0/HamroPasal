import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { initiate, khaltiCallback, esewaCallback, stripeWebhook } from './payments.controller';

const router = Router();

// Unified initiation (buyer must own the order).
router.post('/initiate', authenticate, initiate);

// Gateway callbacks/webhook (no user auth — verified server-side by the gateway).
router.get('/khalti/callback', khaltiCallback);
router.get('/esewa/callback', esewaCallback);
// Stripe webhook needs the raw body — express.raw is applied for this path in app.ts.
router.post('/stripe/webhook', stripeWebhook);

export default router;
