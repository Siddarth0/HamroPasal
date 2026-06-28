import type {
  SellerStats,
  SellerTimeseriesPoint,
  SellerTimeseriesRange,
  LowStockProduct,
} from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export async function fetchSellerStats(): Promise<SellerStats> {
  const { data } = await api.get<ApiEnvelope<SellerStats>>('/analytics/seller');
  return data.data;
}

export async function fetchSellerTimeseries(
  range: SellerTimeseriesRange,
): Promise<SellerTimeseriesPoint[]> {
  const { data } = await api.get<ApiEnvelope<SellerTimeseriesPoint[]>>(
    '/analytics/seller/timeseries',
    { params: { range } },
  );
  return data.data;
}

export async function fetchSellerLowStock(threshold = 5): Promise<LowStockProduct[]> {
  const { data } = await api.get<ApiEnvelope<LowStockProduct[]>>('/analytics/seller/low-stock', {
    params: { threshold },
  });
  return data.data;
}
