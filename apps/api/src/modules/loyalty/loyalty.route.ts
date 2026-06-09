import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { balance, transactions } from './loyalty.controller';

const router = Router();
router.use(authenticate);

router.get('/balance', balance);
router.get('/transactions', transactions);

export default router;
