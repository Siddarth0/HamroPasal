import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { getPagination } from '@/shared/utils/pagination';
import { getBalance, listTransactions, REDEEM_RATE, EARN_RATE } from './loyalty.service';

export const balance = asyncHandler(async (req, res) => {
  const points = await getBalance(req.user!.userId);
  ApiResponse.success(res, { points, redeemRate: REDEEM_RATE, earnRate: EARN_RATE });
});

export const transactions = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listTransactions(req.user!.userId, pagination);
  ApiResponse.paginated(res, items, meta);
});
