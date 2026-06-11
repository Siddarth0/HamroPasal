'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Star, MapPin, MessageCircle, Package, Store as StoreIcon } from 'lucide-react';
import { useStoreBySlug, useCategories, useProducts } from '@/features/catalog/hooks';
import { productToCard, type ApiProduct } from '@/features/catalog/api';
import { ProductCard } from '@/components/home/product-card';
import { useAuthStore } from '@/store/auth';
import { useChatUI } from '@/store/chat-ui';
import { cn } from '@/lib/utils';

type Sort = 'popular' | 'price_asc' | 'price_desc' | 'rating';
const SORTS: { value: Sort; label: string }[] = [
  { value: 'popular', label: 'Best selling' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

const catIdOf = (p: ApiProduct) =>
  typeof p.categoryId === 'string' ? p.categoryId : p.categoryId?._id;

export function StorePage({ slug }: { slug: string }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const openChat = useChatUI((s) => s.openDraft);

  const { data: store, isLoading, isError } = useStoreBySlug(slug);
  const { data: categories } = useCategories();
  const { data: productData } = useProducts({ storeId: store?.id, limit: 100 });

  const products = useMemo(() => productData?.items ?? [], [productData]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [sort, setSort] = useState<Sort>('popular');

  const catName = useMemo(() => {
    const m = new Map<string, string>();
    categories?.forEach((c) => m.set(c._id, c.name));
    return m;
  }, [categories]);

  // Category chips derived from the store's own products.
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      const id = catIdOf(p);
      if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([id, count]) => ({ id, count, name: catName.get(id) ?? 'Other' }))
      .sort((a, b) => b.count - a.count);
  }, [products, catName]);

  const visible = useMemo(() => {
    const filtered =
      selectedCat === 'all' ? products : products.filter((p) => catIdOf(p) === selectedCat);
    const sorted = [...filtered];
    if (sort === 'price_asc') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') sorted.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    else sorted.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    return sorted;
  }, [products, selectedCat, sort]);

  const avgRating = useMemo(() => {
    const rated = products.filter((p) => (p.avgRating ?? 0) > 0);
    if (!rated.length) return 0;
    return Math.round((rated.reduce((s, p) => s + p.avgRating, 0) / rated.length) * 10) / 10;
  }, [products]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }
  if (isError || !store) {
    return (
      <div className="container py-20 text-center">
        <p className="font-medium">Store not found</p>
        <Link href="/products" className="mt-2 inline-block text-sm text-brand hover:underline">
          Browse all products →
        </Link>
      </div>
    );
  }

  const onChat = () => {
    if (status !== 'authenticated') {
      router.push(`/login?returnUrl=${encodeURIComponent(`/store/${slug}`)}`);
      return;
    }
    openChat({ storeId: store.id });
  };

  return (
    <div className="container py-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-navy">
        {store.coverUrl ? (
          <Image src={store.coverUrl} alt="" fill className="object-cover opacity-40" sizes="100vw" />
        ) : (
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/20 blur-3xl" />
        )}
        <div className="relative flex flex-col gap-4 p-6 text-white sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand font-display text-2xl font-bold text-brand-foreground">
              {store.logoUrl ? (
                <Image src={store.logoUrl} alt={store.name} fill className="object-cover" sizes="64px" />
              ) : (
                store.name.charAt(0)
              )}
            </span>
            <div>
              <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
                {store.name}
                <BadgeCheck className="h-5 w-5 text-brand" />
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
                {avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {avgRating} rating
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {products.length} products
                </span>
                {store.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {store.city}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onChat}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20"
          >
            <MessageCircle className="h-4 w-4" /> Chat with seller
          </button>
        </div>
      </div>

      {store.description && (
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{store.description}</p>
      )}

      {/* Catalog */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Category sidebar */}
        <aside className="hidden h-fit overflow-hidden rounded-2xl border border-border bg-background lg:block">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">Categories</div>
          <ul className="p-2 text-sm">
            <li>
              <button
                onClick={() => setSelectedCat('all')}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors',
                  selectedCat === 'all' ? 'bg-brand/10 font-semibold text-brand' : 'hover:bg-muted',
                )}
              >
                All products <span className="text-xs text-muted-foreground">{products.length}</span>
              </button>
            </li>
            {chips.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelectedCat(c.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors',
                    selectedCat === c.id ? 'bg-brand/10 font-semibold text-brand' : 'hover:bg-muted',
                  )}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          {/* Mobile category chips + sort */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 lg:hidden">
              <button
                onClick={() => setSelectedCat('all')}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium',
                  selectedCat === 'all' ? 'bg-brand text-brand-foreground' : 'bg-muted',
                )}
              >
                All
              </button>
              {chips.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium',
                    selectedCat === c.id ? 'bg-brand text-brand-foreground' : 'bg-muted',
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="ml-auto h-10 w-48 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-20 text-muted-foreground">
              <StoreIcon className="h-10 w-10" />
              <p className="text-sm">No products in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((p) => (
                <ProductCard key={p._id} product={productToCard(p)} mode="rating" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
