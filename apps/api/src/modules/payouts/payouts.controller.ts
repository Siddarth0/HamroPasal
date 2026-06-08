import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import { getPagination } from '@/shared/utils/pagination';
import {
  listStorePayouts,
  getSellerEarnings,
  listAllPayouts,
  generatePayouts,
  updatePayout,
} from './payouts.service';
import { updatePayoutSchema } from './payouts.validation';
import type { PayoutStatus } from '@/generated/prisma';

const requireStore = (storeId?: string): string => {
  if (!storeId) throw new ApiError('You do not have a store', 403);
  return storeId;
};

const statusParam = (q: unknown) => (typeof q === 'string' ? (q as PayoutStatus) : undefined);

/* ------------------------------- Seller -------------------------------- */

export const myPayouts = asyncHandler(async (req, res) => {
  const storeId = requireStore(req.user!.storeId);
  const pagination = getPagination(req.query);
  const { items, meta } = await listStorePayouts(storeId, pagination, statusParam(req.query.status));
  ApiResponse.paginated(res, items, meta);
});

export const earnings = asyncHandler(async (req, res) => {
  const storeId = requireStore(req.user!.storeId);
  const summary = await getSellerEarnings(storeId);
  ApiResponse.success(res, summary);
});

/* ------------------------------- Admin --------------------------------- */

export const adminListPayouts = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listAllPayouts(pagination, {
    status: statusParam(req.query.status),
    storeId: typeof req.query.storeId === 'string' ? req.query.storeId : undefined,
  });
  ApiResponse.paginated(res, items, meta);
});

export const adminGenerate = asyncHandler(async (_req, res) => {
  const result = await generatePayouts();
  ApiResponse.success(res, result, `${result.created} payout(s) generated`);
});

export const adminUpdate = asyncHandler(async (req, res) => {
  const data = updatePayoutSchema.parse(req.body);
  const payout = await updatePayout(String(req.params.id), data);
  ApiResponse.success(res, payout, 'Payout updated');
});
