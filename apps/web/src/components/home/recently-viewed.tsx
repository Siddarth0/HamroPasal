'use client';

import { useRecentlyViewed } from '@/store/recently-viewed';
import { useRecentlyViewedProducts } from '@/features/recommendations/hooks';
import { ProductRail } from '@/components/catalog/product-rail';

/** Rail of products the visitor recently opened (localStorage-backed). */
export function RecentlyViewed() {
  const clear = useRecentlyViewed((s) => s.clear);
  const { data, isLoading } = useRecentlyViewedProducts();

  return (
    <ProductRail
      title="Recently viewed"
      products={data}
      isLoading={isLoading}
      action={
        (data?.length ?? 0) > 0 ? (
          <button
            onClick={clear}
            className="text-sm font-medium text-muted-foreground hover:text-brand"
          >
            Clear
          </button>
        ) : null
      }
    />
  );
}
