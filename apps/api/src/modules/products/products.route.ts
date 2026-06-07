import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
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
  getBySlug,
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
// Keep the slug catch-all last so it doesn't shadow `/mine`.
router.get('/:slug', getBySlug);

export default router;
