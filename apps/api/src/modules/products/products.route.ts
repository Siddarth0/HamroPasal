import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import { upload } from '@/shared/middlewares/upload';
import {
  create,
  listMine,
  getMine,
  update,
  remove,
  addImages,
  removeImage,
  browse,
  suggest,
  getBySlug,
  similar,
  boughtTogether,
  recommended,
  byIds,
} from './products.controller';

const router = Router();
const seller = [authenticate, authorize('SELLER')];

/* ------------------------------- Seller ------------------------------- */
router.post('/', ...seller, create);
router.get('/mine', ...seller, listMine);
router.get('/mine/:id', ...seller, getMine);
router.patch('/:id', ...seller, update);
router.delete('/:id', ...seller, remove);
router.post('/:id/images', ...seller, upload.array('images', 8), addImages);
router.delete('/:id/images', ...seller, removeImage); // publicId in body (Cloudinary ids contain slashes)

/* ------------------------------- Public ------------------------------- */
router.get('/', browse);
router.get('/suggest', suggest);
router.get('/recommended', optionalAuthenticate, recommended); // personalized if logged in
router.get('/by-ids', byIds); // hydrate client-stored "recently viewed" ids
router.get('/:id/similar', similar);
router.get('/:id/bought-together', boughtTogether);
// Keep the slug catch-all last so it doesn't shadow `/mine`, `/suggest`, etc.
router.get('/:slug', getBySlug);

export default router;
