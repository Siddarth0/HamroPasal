import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import { platform, seller, sellerTimeseries, sellerLowStock } from './analytics.controller';

const router = Router();
const sellerOnly = [authenticate, authorize('SELLER')];

router.get('/admin', authenticate, authorize('ADMIN'), platform);
router.get('/seller', ...sellerOnly, seller);
router.get('/seller/timeseries', ...sellerOnly, sellerTimeseries);
router.get('/seller/low-stock', ...sellerOnly, sellerLowStock);

export default router;
