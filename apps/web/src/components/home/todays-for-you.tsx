'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { tabs, recommended, mockToCard } from '@/lib/mock';
import { ProductCard } from './product-card';
import { ProductCardSkeletonRow } from './skeletons';
import { useProducts } from '@/features/catalog/hooks';
import { productToCard, type ProductQuery } from '@/features/catalog/api';

// Each tab maps to a sort; "Best Seller" lands first.
const tabSort: NonNullable<ProductQuery['sort']>[] = [
  'popular',
  'newest',
  'price_asc',
  'rating',
  'popular',
];

export function TodaysForYou() {
  const [active, setActive] = useState(0);
  const { data, isLoading } = useProducts({ sort: tabSort[active] ?? 'newest', limit: 12 });
  const live = data?.items ?? [];
  const showSkeleton = isLoading && live.length === 0;
  const products = live.length ? live.map(productToCard) : recommended.map(mockToCard);

  return (
    <section className="container mt-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-display text-2xl font-bold">Todays For You!</h2>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActive(i)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                i === active
                  ? 'bg-brand text-brand-foreground'
                  : 'border border-border bg-background text-muted-foreground hover:bg-muted',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {showSkeleton ? (
          <ProductCardSkeletonRow count={12} />
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} mode="rating" />)
        )}
      </div>
    </section>
  );
}
