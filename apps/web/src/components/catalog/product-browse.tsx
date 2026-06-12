'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import { useProducts, useCategories } from '@/features/catalog/hooks';
import { productToCard, type ProductQuery, type ApiCategory } from '@/features/catalog/api';
import { ProductCard } from '@/components/home/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

type Sort = NonNullable<ProductQuery['sort']>;

const sortOptions: { value: Sort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

const ratingOptions = [
  { value: 0, label: 'Any rating' },
  { value: 4, label: '4★ & up' },
  { value: 3, label: '3★ & up' },
  { value: 2, label: '2★ & up' },
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

/** The filter controls — reused in the desktop rail and the mobile drawer. */
function Filters({
  categories,
  selectedCat,
  onSelectCat,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  onApplyPrice,
  minRating,
  onMinRating,
}: {
  categories: ApiCategory[];
  selectedCat?: string;
  onSelectCat: (id?: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPrice: (v: string) => void;
  onMaxPrice: (v: string) => void;
  onApplyPrice: () => void;
  minRating: number;
  onMinRating: (v: number) => void;
}) {
  const catBtn = (active: boolean) =>
    cn(
      'block w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
      active ? 'bg-brand/10 font-medium text-brand' : 'text-foreground/80 hover:bg-muted',
    );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Categories
        </h3>
        <ul className="space-y-1">
          <li>
            <button className={catBtn(!selectedCat)} onClick={() => onSelectCat(undefined)}>
              All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c._id}>
              <button className={catBtn(selectedCat === c._id)} onClick={() => onSelectCat(c._id)}>
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Price range (Rs.)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPrice(e.target.value)}
            className="h-9 px-3"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPrice(e.target.value)}
            className="h-9 px-3"
          />
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={onApplyPrice}>
          Apply
        </Button>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Rating</h3>
        <div className="space-y-1">
          {ratingOptions.map((r) => (
            <button
              key={r.value}
              onClick={() => onMinRating(r.value)}
              className={cn(
                'flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                minRating === r.value
                  ? 'bg-brand/10 font-medium text-brand'
                  : 'text-foreground/80 hover:bg-muted',
              )}
            >
              {r.value > 0 && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductBrowse({ categoryId, heading }: { categoryId?: string; heading: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const search = params.get('search') ?? undefined;

  const [selectedCat, setSelectedCat] = useState<string | undefined>(categoryId);
  const [sort, setSort] = useState<Sort>(search ? 'relevance' : 'newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [applied, setApplied] = useState<{ min?: number; max?: number }>({});
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keep the category filter in sync if the page's category prop changes.
  useEffect(() => setSelectedCat(categoryId), [categoryId]);
  // Rank by relevance once a search term is present (else fall back to newest).
  useEffect(() => setSort(search ? 'relevance' : 'newest'), [search]);
  // Reset to the first page whenever the result set changes.
  useEffect(() => setPage(1), [search, selectedCat, sort, applied, minRating]);

  const { data, isLoading, isError } = useProducts({
    search,
    categoryId: selectedCat,
    sort,
    minPrice: applied.min,
    maxPrice: applied.max,
    minRating: minRating || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const { data: categories } = useCategories();
  const cats = categories ?? [];

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const applyPrice = () =>
    setApplied({
      min: minPrice ? Number(minPrice) : undefined,
      max: maxPrice ? Number(maxPrice) : undefined,
    });

  const clearPrice = () => {
    setMinPrice('');
    setMaxPrice('');
    setApplied({});
  };

  const clearAll = () => {
    setSelectedCat(categoryId);
    clearPrice();
    setMinRating(0);
    if (search) router.push('/products');
  };

  const catName = (id?: string) => cats.find((c) => c._id === id)?.name;
  const hasPrice = applied.min !== undefined || applied.max !== undefined;
  const priceLabel = `Rs. ${applied.min ?? 0}${applied.max !== undefined ? `–${applied.max}` : '+'}`;

  // Active-filter chips (search + the in-page facets that are set).
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (search) chips.push({ key: 'search', label: `“${search}”`, onRemove: () => router.push('/products') });
  if (selectedCat) chips.push({ key: 'cat', label: catName(selectedCat) ?? 'Category', onRemove: () => setSelectedCat(undefined) });
  if (hasPrice) chips.push({ key: 'price', label: priceLabel, onRemove: clearPrice });
  if (minRating > 0) chips.push({ key: 'rating', label: `${minRating}★ & up`, onRemove: () => setMinRating(0) });

  const showRelevance = !!search;
  const sortChoices = showRelevance
    ? [{ value: 'relevance' as Sort, label: 'Best match' }, ...sortOptions]
    : sortOptions;

  return (
    <div className="container py-6">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{' '}
        / <span className="text-foreground">{heading}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_1fr]">
        {/* Desktop filter rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <Filters
              categories={cats}
              selectedCat={selectedCat}
              onSelectCat={setSelectedCat}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPrice={setMinPrice}
              onMaxPrice={setMaxPrice}
              onApplyPrice={applyPrice}
              minRating={minRating}
              onMinRating={setMinRating}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold">{heading}</h1>
              <p className="text-sm text-muted-foreground">
                {search ? <>Results for “{search}” · </> : null}
                {total} {total === 1 ? 'product' : 'products'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile: open the filter drawer */}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 lg:hidden"
                onClick={() => setDrawerOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {chips.length > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                    {chips.length}
                  </span>
                )}
              </Button>
              <label className="flex items-center gap-2 text-sm">
                <span className="hidden text-muted-foreground sm:inline">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="h-9 rounded-full border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {sortChoices.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground/80 hover:text-brand"
                >
                  {chip.label}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <button onClick={clearAll} className="text-xs font-semibold text-brand hover:underline">
                Clear all
              </button>
            </div>
          )}

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
              {chips.length > 0 && (
                <Button variant="outline" size="sm" className="mt-4" onClick={clearAll}>
                  Clear all filters
                </Button>
              )}
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

      {/* Mobile filter drawer (bottom sheet) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Filters</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Filters
              categories={cats}
              selectedCat={selectedCat}
              onSelectCat={setSelectedCat}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPrice={setMinPrice}
              onMaxPrice={setMaxPrice}
              onApplyPrice={applyPrice}
              minRating={minRating}
              onMinRating={setMinRating}
            />
            <div className="mt-5 flex gap-2">
              {chips.length > 0 && (
                <Button variant="outline" className="flex-1" onClick={clearAll}>
                  Clear all
                </Button>
              )}
              <Button variant="brand" className="flex-1" onClick={() => setDrawerOpen(false)}>
                Show {total} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
