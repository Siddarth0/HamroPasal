import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from './cart.service';
import { addItemSchema, updateItemSchema } from './cart.validation';

export const get = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user!.userId);
  ApiResponse.success(res, cart);
});

export const add = asyncHandler(async (req, res) => {
  const data = addItemSchema.parse(req.body);
  const cart = await addItem(req.user!.userId, data);
  ApiResponse.success(res, cart, 'Item added to cart');
});

export const update = asyncHandler(async (req, res) => {
  const data = updateItemSchema.parse(req.body);
  const cart = await updateItem(req.user!.userId, data);
  ApiResponse.success(res, cart, 'Cart updated');
});

export const remove = asyncHandler(async (req, res) => {
  const variantId =
    typeof req.query.variantId === 'string' ? req.query.variantId : undefined;
  const cart = await removeItem(req.user!.userId, {
    productId: String(req.params.productId),
    variantId,
  });
  ApiResponse.success(res, cart, 'Item removed');
});

export const clear = asyncHandler(async (req, res) => {
  const cart = await clearCart(req.user!.userId);
  ApiResponse.success(res, cart, 'Cart cleared');
});
