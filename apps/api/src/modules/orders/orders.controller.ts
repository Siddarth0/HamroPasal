import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import { getPagination } from '@/shared/utils/pagination';
import {
  checkout,
  listMyOrders,
  getMyOrder,
  cancelMyOrder,
  listStoreSubOrders,
  updateSubOrderStatus,
} from './orders.service';
import { checkoutSchema, updateSubOrderStatusSchema } from './orders.validation';

/* ------------------------------- Customer ------------------------------- */

export const placeOrder = asyncHandler(async (req, res) => {
  const data = checkoutSchema.parse(req.body);
  const order = await checkout(req.user!.userId, data);
  ApiResponse.created(res, order, 'Order placed');
});

export const myOrders = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listMyOrders(req.user!.userId, pagination);
  ApiResponse.paginated(res, items, meta);
});

export const myOrder = asyncHandler(async (req, res) => {
  const order = await getMyOrder(req.user!.userId, String(req.params.id));
  ApiResponse.success(res, order);
});

export const cancel = asyncHandler(async (req, res) => {
  const order = await cancelMyOrder(req.user!.userId, String(req.params.id));
  ApiResponse.success(res, order, 'Order cancelled');
});

/* ------------------------------- Seller ------------------------------- */

const requireStore = (storeId?: string): string => {
  if (!storeId) throw new ApiError('You do not have a store', 403);
  return storeId;
};

export const sellerSubOrders = asyncHandler(async (req, res) => {
  const storeId = requireStore(req.user!.storeId);
  const pagination = getPagination(req.query);
  const { items, meta } = await listStoreSubOrders(storeId, pagination);
  ApiResponse.paginated(res, items, meta);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const storeId = requireStore(req.user!.storeId);
  const { status } = updateSubOrderStatusSchema.parse(req.body);
  const subOrder = await updateSubOrderStatus(storeId, String(req.params.id), status);
  ApiResponse.success(res, subOrder, 'Sub-order status updated');
});
