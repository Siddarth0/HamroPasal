'use client';

import { ProductCard } from '@/components/home/product-card';
import { ProductCardSkeleton } from '@/components/home/skeletons';
import { productToCard, type ApiProduct } from '@/features/catalog/api';

interface ProductRailProps {
  title: string;
  products?: ApiProduct[];
  isLoading?: boolean;
  /** Items to show as skeletons while loading. */
  skeletonCount?: number;
  /** Optional right-aligned node (e.g. a "View all" link or "Clear"). */
  action?: React.ReactNode;
}

/**
 * Horizontal, snap-scrolling rail of product cards. Used for recommendation
 * sections (similar / bought-together / recommended / recently viewed).
 * Renders nothing when there's no data and we're not loading.
 */
export function ProductRail({
  title,
  products,
  isLoading,
  skeletonCount = 6,
  action,
}: ProductRailProps) {
  const hasItems = (products?.length ?? 0) > 0;
  if (!isLoading && !hasItems) return null;

  return (
    <section className="container mt-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold md:text-2xl">{title}</h2>
        {action}
      </div>

      <div className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
        {isLoading && !hasItems
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="w-40 shrink-0 snap-start sm:w-48">
                <ProductCardSkeleton />
              </div>
            ))
          : products!.map((p) => (
              <div key={p._id} className="w-40 shrink-0 snap-start sm:w-48">
                <ProductCard product={productToCard(p)} mode="rating" />
              </div>
            ))}
      </div>
    </section>
  );
}
