import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import { getPlatformStats, getSellerStats } from './analytics.service';

export const platform = asyncHandler(async (_req, res) => {
  ApiResponse.success(res, await getPlatformStats());
});

export const seller = asyncHandler(async (req, res) => {
  const storeId = req.user!.storeId;
  if (!storeId) throw new ApiError('You do not have a store', 403);
  ApiResponse.success(res, await getSellerStats(storeId));
});
