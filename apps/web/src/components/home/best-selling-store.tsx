'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, ArrowRight, Store } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useStores, useProducts } from '@/features/catalog/hooks';
import type { ApiStore } from '@/features/catalog/api';
import { StoreCardSkeleton } from './skeletons';

function RealStoreCard({ store }: { store: ApiStore }) {
  const { data } = useProducts({ storeId: store.id, sort: 'popular', limit: 3 });
  const items = data?.items ?? [];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
      <Link href={`/store/${store.slug}`} className="group/store mb-3 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-navy font-display text-sm font-bold text-white">
          {store.logoUrl ? (
            <Image src={store.logoUrl} alt={store.name} width={44} height={44} className="h-full w-full object-cover" />
          ) : (
            store.name[0]
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-semibold group-hover/store:text-brand">
            <span className="truncate">{store.name}</span>
            <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />
          </p>
          <p className="truncate text-xs italic text-muted-foreground">
            {store.description ?? 'Verified seller on HamroPasal'}
          </p>
        </div>
      </Link>
      <div className="grid grid-cols-3 gap-2">
        {items.map((p) => (
          <Link
            key={p._id}
            href={`/product/${p.slug}`}
            className="overflow-hidden rounded-lg bg-muted ring-1 ring-transparent transition-all hover:ring-brand/30"
          >
            <div className="relative aspect-square">
              {p.images?.[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="120px" />}
            </div>
            <p className="px-1.5 py-1 text-[11px] font-bold text-brand">{formatPrice(p.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BestSellingStore() {
  const { data, isLoading } = useStores({ limit: 4 });
  const stores = data?.items ?? [];

  // Nothing to show and nothing loading → hide the whole section.
  if (!isLoading && stores.length === 0) return null;

  return (
    <section className="container mt-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Best Selling Stores</h2>
          <p className="mt-1 text-sm text-muted-foreground">Top-rated sellers shoppers love</p>
        </div>
        <Link href="/products" className="hidden items-center gap-1 text-sm font-semibold text-brand hover:underline sm:flex">
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Featured mall — on-brand gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-brand">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex h-full min-h-[150px] flex-col justify-end p-5 md:min-h-[300px] md:p-6">
            <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Store className="h-3.5 w-3.5" />
              Official Mall
            </span>
            <h3 className="font-display text-lg font-bold text-white md:text-xl">HamroPasal Mall</h3>
            <p className="mt-1 text-xs text-white/80 md:text-sm">
              Thousands of verified sellers across Nepal — all in one place.
            </p>
          </div>
        </div>

        {/* Real stores */}
        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
          {isLoading && stores.length === 0
            ? Array.from({ length: 4 }).map((_, i) => <StoreCardSkeleton key={i} />)
            : stores.map((s) => <RealStoreCard key={s.id} store={s} />)}
        </div>
      </div>
    </section>
  );
}
