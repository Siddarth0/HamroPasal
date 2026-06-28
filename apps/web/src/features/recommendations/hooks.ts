import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { useRecentlyViewed } from '@/store/recently-viewed';
import {
  fetchSimilar,
  fetchBoughtTogether,
  fetchRecommended,
  fetchProductsByIds,
} from './api';

export function useSimilar(productId: string | undefined, limit = 8) {
  return useQuery({
    queryKey: ['rec-similar', productId, limit],
    queryFn: () => fetchSimilar(productId!, limit),
    enabled: !!productId,
    staleTime: 5 * 60_000,
  });
}

export function useBoughtTogether(productId: string | undefined, limit = 8) {
  return useQuery({
    queryKey: ['rec-bought', productId, limit],
    queryFn: () => fetchBoughtTogether(productId!, limit),
    enabled: !!productId,
    staleTime: 5 * 60_000,
  });
}

/** Personalized when logged in (token sent by the axios interceptor), popular otherwise. */
export function useRecommended(limit = 12) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    // Key on auth status so the rail refetches after login/logout.
    queryKey: ['rec-recommended', status, limit],
    queryFn: () => fetchRecommended(limit),
    enabled: status !== 'loading',
    staleTime: 5 * 60_000,
  });
}

/** Hydrates the locally-stored recently-viewed ids, optionally excluding one. */
export function useRecentlyViewedProducts(excludeId?: string) {
  const ids = useRecentlyViewed((s) => s.ids);
  const filtered = excludeId ? ids.filter((id) => id !== excludeId) : ids;
  return useQuery({
    queryKey: ['rec-recently-viewed', filtered],
    queryFn: () => fetchProductsByIds(filtered),
    enabled: filtered.length > 0,
    staleTime: 60_000,
  });
}
