import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import {
  users,
  user,
  updateUserById,
  orders,
  order,
  products,
  toggleProduct,
  removeProduct,
} from './admin.controller';

const router = Router();

// Everything here is admin-only.
router.use(authenticate, authorize('ADMIN'));

router.get('/users', users);
router.get('/users/:id', user);
router.patch('/users/:id', updateUserById);

router.get('/orders', orders);
router.get('/orders/:id', order);

router.get('/products', products);
router.patch('/products/:id', toggleProduct);
router.delete('/products/:id', removeProduct);

export default router;
