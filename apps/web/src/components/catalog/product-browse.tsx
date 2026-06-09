'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useProducts, useCategories } from '@/features/catalog/hooks';
import { productToCard, type ProductQuery } from '@/features/catalog/api';
import { ProductCard } from '@/components/home/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

const sortOptions: { value: NonNullable<ProductQuery['sort']>; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProductBrowse({ categoryId, heading }: { categoryId?: string; heading: string }) {
  const params = useSearchParams();
  const search = params.get('search') ?? undefined;

  const [sort, setSort] = useState<NonNullable<ProductQuery['sort']>>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [applied, setApplied] = useState<{ min?: number; max?: number }>({});
  const [page, setPage] = useState(1);

  // Reset to the first page whenever the result set changes.
  useEffect(() => setPage(1), [search, categoryId, sort, applied]);

  const { data, isLoading, isError } = useProducts({
    search,
    categoryId,
    sort,
    minPrice: applied.min,
    maxPrice: applied.max,
    page,
    limit: PAGE_SIZE,
  });

  const { data: categories } = useCategories();

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const applyPrice = () =>
    setApplied({
      min: minPrice ? Number(minPrice) : undefined,
      max: maxPrice ? Number(maxPrice) : undefined,
    });

  return (
    <div className="container py-6">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{' '}
        / <span className="text-foreground">{heading}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        {/* Filter rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4" /> Categories
              </h3>
              <ul className="space-y-1 text-sm">
                {(categories ?? []).map((c) => (
                  <li key={c._id}>
                    <Link
                      href={`/category/${c.slug}`}
                      className="block rounded-lg px-2 py-1.5 text-foreground/80 hover:bg-muted hover:text-brand"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Price range (Rs.)</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 px-3"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 px-3"
                />
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={applyPrice}>
                Apply
              </Button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold">{heading}</h1>
              <p className="text-sm text-muted-foreground">
                {search ? <>Results for “{search}” · </> : null}
                {total} {total === 1 ? 'product' : 'products'}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as NonNullable<ProductQuery['sort']>)}
                className="h-9 rounded-full border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Couldn’t load products. Please try again.
            </p>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p._id} product={productToCard(p)} mode="rating" />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border disabled:opacity-40 hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={cn(
                      'h-9 min-w-9 rounded-lg border px-2 text-sm',
                      n === page
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border disabled:opacity-40 hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
