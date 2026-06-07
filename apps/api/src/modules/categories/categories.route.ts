import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { authorize } from '@/shared/middlewares/role.guard';
import { upload } from '@/shared/middlewares/upload';
import {
  getCategories,
  getTree,
  getBySlug,
  create,
  update,
  remove,
  uploadCategoryImage,
  deleteCategoryImage,
} from './categories.controller';

const router = Router();
const admin = [authenticate, authorize('ADMIN')];

/* ------------------------------- Public ------------------------------- */
router.get('/', getCategories);
router.get('/tree', getTree);

/* ------------------------------- Admin -------------------------------- */
router.post('/', ...admin, create);
router.patch('/:id', ...admin, update);
router.delete('/:id', ...admin, remove);
router.post('/:id/image', ...admin, upload.single('image'), uploadCategoryImage);
router.delete('/:id/image', ...admin, deleteCategoryImage);

// Keep the slug catch-all last so it doesn't shadow `/tree`.
router.get('/:slug', getBySlug);

export default router;
