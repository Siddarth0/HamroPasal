import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import { create, myReturns, myReturn, storeReturns, resolve } from './returns.controller';

const router = Router();

// Seller routes first so `/seller` isn't captured by `/:id`.
router.get('/seller', authenticate, authorize('SELLER'), storeReturns);
router.patch('/seller/:id', authenticate, authorize('SELLER'), resolve);

// Customer
router.post('/', authenticate, create);
router.get('/', authenticate, myReturns);
router.get('/:id', authenticate, myReturn);

export default router;
