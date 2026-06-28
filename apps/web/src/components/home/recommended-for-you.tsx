'use client';

import { useAuthStore } from '@/store/auth';
import { useRecommended } from '@/features/recommendations/hooks';
import { ProductRail } from '@/components/catalog/product-rail';

/** Personalized rail when logged in; "Popular picks" for guests. */
export function RecommendedForYou() {
  const status = useAuthStore((s) => s.status);
  const { data, isLoading } = useRecommended(12);
  const title = status === 'authenticated' ? 'Recommended for you' : 'Popular picks';
  return <ProductRail title={title} products={data} isLoading={isLoading} skeletonCount={6} />;
}
