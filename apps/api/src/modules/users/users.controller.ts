import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  listAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from './users.service';
import { updateProfileSchema, createAddressSchema, updateAddressSchema } from './users.validation';

// All routes are mounted behind `authenticate`, so req.user is guaranteed.

//-----Profile----------
export const getMe = asyncHandler(async (req, res) => {
  const user = await getProfile(req.user!.userId);
  ApiResponse.success(res, user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const data = updateProfileSchema.parse(req.body);
  const user = await updateProfile(req.user!.userId, data);
  ApiResponse.success(res, user, 'Profile updated');
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError('No image file provided', 400);
  const user = await updateAvatar(req.user!.userId, req.file.buffer);
  ApiResponse.success(res, user, 'Avatar updated');
});

//-----Addresses----------
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await listAddresses(req.user!.userId);
  ApiResponse.success(res, addresses);
});

export const addAddress = asyncHandler(async (req, res) => {
  const data = createAddressSchema.parse(req.body);
  const address = await createAddress(req.user!.userId, data);
  ApiResponse.created(res, address, 'Address added');
});

export const editAddress = asyncHandler(async (req, res) => {
  const data = updateAddressSchema.parse(req.body);
  const address = await updateAddress(req.user!.userId, String(req.params.id), data);
  ApiResponse.success(res, address, 'Address updated');
});

export const makeDefaultAddress = asyncHandler(async (req, res) => {
  const address = await setDefaultAddress(req.user!.userId, String(req.params.id));
  ApiResponse.success(res, address, 'Default address set');
});

export const removeAddress = asyncHandler(async (req, res) => {
  await deleteAddress(req.user!.userId, String(req.params.id));
  ApiResponse.success(res, undefined, 'Address removed');
});
