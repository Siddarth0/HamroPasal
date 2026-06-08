import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import { platform, seller } from './analytics.controller';

const router = Router();

router.get('/admin', authenticate, authorize('ADMIN'), platform);
router.get('/seller', authenticate, authorize('SELLER'), seller);

export default router;
