import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import { requireVerifiedEmail } from '@/shared/middlewares/verified.guard';
import {
  placeOrder,
  myOrders,
  myOrder,
  cancel,
  sellerSubOrders,
  updateStatus,
} from './orders.controller';

const router = Router();

// Checkout requires a verified email (per access rules).
router.post('/checkout', authenticate, requireVerifiedEmail, placeOrder);

/* ------------------------------- Seller ------------------------------- */
// Declared before `/:id` so the literals win.
router.get('/seller', authenticate, authorize('SELLER'), sellerSubOrders);
router.patch(
  '/seller/sub-orders/:id/status',
  authenticate,
  authorize('SELLER'),
  updateStatus,
);

/* ------------------------------- Customer ----------------------------- */
router.get('/', authenticate, myOrders);
router.get('/:id', authenticate, myOrder);
router.post('/:id/cancel', authenticate, cancel);

export default router;
