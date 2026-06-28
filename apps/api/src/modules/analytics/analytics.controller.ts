import type { Request } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import {
  getPlatformStats,
  getSellerStats,
  getSellerTimeseries,
  getSellerLowStock,
} from './analytics.service';

const timeseriesQuery = z.object({
  range: z.enum(['30d', '90d', '12m']).default('30d'),
});

const lowStockQuery = z.object({
  threshold: z.coerce.number().int().min(0).max(1000).default(5),
});

// Resolve the requesting seller's store id or fail.
const requireStoreId = (req: Request): string => {
  const storeId = req.user!.storeId;
  if (!storeId) throw new ApiError('You do not have a store', 403);
  return storeId;
};

export const platform = asyncHandler(async (_req, res) => {
  ApiResponse.success(res, await getPlatformStats());
});

export const seller = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await getSellerStats(requireStoreId(req)));
});

export const sellerTimeseries = asyncHandler(async (req, res) => {
  const { range } = timeseriesQuery.parse(req.query);
  ApiResponse.success(res, await getSellerTimeseries(requireStoreId(req), range));
});

export const sellerLowStock = asyncHandler(async (req, res) => {
  const { threshold } = lowStockQuery.parse(req.query);
  ApiResponse.success(res, await getSellerLowStock(requireStoreId(req), threshold));
});
