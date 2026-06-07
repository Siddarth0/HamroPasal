import { z } from 'zod';
import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from './wishlist.service';

const addSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id'),
});

export const get = asyncHandler(async (req, res) => {
  const products = await getWishlist(req.user!.userId);
  ApiResponse.success(res, products);
});

export const add = asyncHandler(async (req, res) => {
  const { productId } = addSchema.parse(req.body);
  const products = await addToWishlist(req.user!.userId, productId);
  ApiResponse.success(res, products, 'Added to wishlist');
});

export const remove = asyncHandler(async (req, res) => {
  const products = await removeFromWishlist(req.user!.userId, String(req.params.productId));
  ApiResponse.success(res, products, 'Removed from wishlist');
});
