import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import {
  myPayouts,
  earnings,
  adminListPayouts,
  adminGenerate,
  adminUpdate,
} from './payouts.controller';

const router = Router();
const seller = [authenticate, authorize('SELLER')];
const admin = [authenticate, authorize('ADMIN')];

/* ------------------------------- Seller -------------------------------- */
router.get('/', ...seller, myPayouts);
router.get('/earnings', ...seller, earnings);

/* ------------------------------- Admin --------------------------------- */
router.get('/admin', ...admin, adminListPayouts);
router.post('/admin/generate', ...admin, adminGenerate);
router.patch('/admin/:id', ...admin, adminUpdate);

export default router;
