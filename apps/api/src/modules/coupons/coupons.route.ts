import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import { create, mine, adminList, update, validate } from './coupons.controller';

const router = Router();

// Customer: validate a code against their cart.
router.post('/validate', authenticate, validate);

// Seller/Admin management.
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), create);
router.get('/mine', authenticate, authorize('SELLER'), mine);
router.get('/admin', authenticate, authorize('ADMIN'), adminList);
router.patch('/:id', authenticate, authorize('SELLER', 'ADMIN'), update);

export default router;
