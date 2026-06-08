import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { upload } from '@/shared/middlewares/upload';
import {
  create,
  productReviews,
  myReviews,
  update,
  remove,
  addImages,
  removeImage,
} from './reviews.controller';

const router = Router();

// Public: a product's reviews.
router.get('/product/:productId', productReviews);

// Authenticated (any logged-in user).
router.post('/', authenticate, create);
router.get('/mine', authenticate, myReviews);
router.patch('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);
router.post('/:id/images', authenticate, upload.array('images', 5), addImages);
router.delete('/:id/images', authenticate, removeImage); // publicId in body

export default router;
