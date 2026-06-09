import { Router } from 'express';
import { authenticate } from '@/shared/middlewares/auth.guard';
import { upload } from '@/shared/middlewares/upload';
import {
  getMe,
  updateMe,
  uploadAvatar,
  getAddresses,
  addAddress,
  editAddress,
  makeDefaultAddress,
  removeAddress,
} from './users.controller';

const router = Router();

// Everything here requires a logged-in user.
router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);

router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.patch('/addresses/:id', editAddress);
router.patch('/addresses/:id/default', makeDefaultAddress);
router.delete('/addresses/:id', removeAddress);

export default router;
