import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import {
  createStore,
  getMine,
  updateMine,
  browseStores,
  getBySlug,
  adminListStores,
  adminUpdateStore,
  getMyZones,
  addZone,
  editZone,
  removeZone,
} from './stores.controller';

const router = Router();

// NOTE: literal routes are declared before the public `/:slug` so they win.

/* ------------------------------- Seller ------------------------------- */
const seller = [authenticate, authorize('SELLER')];

router.post('/', ...seller, createStore);
router.get('/me', ...seller, getMine);
router.patch('/me', ...seller, updateMine);

router.get('/me/delivery-zones', ...seller, getMyZones);
router.post('/me/delivery-zones', ...seller, addZone);
router.patch('/me/delivery-zones/:id', ...seller, editZone);
router.delete('/me/delivery-zones/:id', ...seller, removeZone);

/* ------------------------------- Admin -------------------------------- */
const admin = [authenticate, authorize('ADMIN')];

router.get('/admin', ...admin, adminListStores);
router.patch('/admin/:id', ...admin, adminUpdateStore);

/* ------------------------------- Public ------------------------------- */
router.get('/', browseStores);
router.get('/:slug', getBySlug);

export default router;
