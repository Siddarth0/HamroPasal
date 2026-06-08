import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import { getPagination } from '@/shared/utils/pagination';
import {
  requestReturn,
  listMyReturns,
  getMyReturn,
  listStoreReturns,
  resolveReturn,
} from './returns.service';
import { createReturnSchema, updateReturnSchema } from './returns.validation';

/* ------------------------------- Customer ------------------------------- */

export const create = asyncHandler(async (req, res) => {
  const data = createReturnSchema.parse(req.body);
  const ret = await requestReturn(req.user!.userId, data);
  ApiResponse.created(res, ret, 'Return requested');
});

export const myReturns = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listMyReturns(req.user!.userId, pagination);
  ApiResponse.paginated(res, items, meta);
});

export const myReturn = asyncHandler(async (req, res) => {
  const ret = await getMyReturn(req.user!.userId, String(req.params.id));
  ApiResponse.success(res, ret);
});

/* ------------------------------- Seller -------------------------------- */

const requireStore = (storeId?: string): string => {
  if (!storeId) throw new ApiError('You do not have a store', 403);
  return storeId;
};

export const storeReturns = asyncHandler(async (req, res) => {
  const storeId = requireStore(req.user!.storeId);
  const pagination = getPagination(req.query);
  const { items, meta } = await listStoreReturns(storeId, pagination);
  ApiResponse.paginated(res, items, meta);
});

export const resolve = asyncHandler(async (req, res) => {
  const storeId = requireStore(req.user!.storeId);
  const data = updateReturnSchema.parse(req.body);
  const ret = await resolveReturn(storeId, String(req.params.id), data);
  ApiResponse.success(res, ret, 'Return updated');
});
