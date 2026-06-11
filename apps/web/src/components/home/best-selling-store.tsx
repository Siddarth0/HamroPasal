'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, ArrowRight, Store } from 'lucide-react';
import { stores as mockStores, img } from '@/lib/mock';
import { formatPrice } from '@/lib/utils';
import { useStores, useProducts } from '@/features/catalog/hooks';
import type { ApiStore } from '@/features/catalog/api';

function RealStoreCard({ store }: { store: ApiStore }) {
  const { data } = useProducts({ storeId: store.id, sort: 'popular', limit: 3 });
  const items = data?.items ?? [];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
      <Link href={`/store/${store.slug}`} className="mb-3 flex items-center gap-3 group/store">
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
  const { data } = useStores({ limit: 4 });
  const liveStores = data?.items ?? [];

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
        {/* Featured mall */}
        <div className="group relative overflow-hidden rounded-2xl">
          <Image
            src={img('hamro-mall', 700)}
            alt="HamroPasal Mall"
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
          <div className="relative flex h-full min-h-[300px] flex-col justify-end p-6">
            <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground">
              <Store className="h-3.5 w-3.5" />
              Official Mall
            </span>
            <h3 className="font-display text-xl font-bold text-white">HamroPasal Mall</h3>
            <p className="mt-1 text-sm text-white/70">
              Thousands of verified sellers across Nepal — all in one place.
            </p>
          </div>
        </div>

        {/* Real stores (fallback to mock styling if none yet) */}
        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
          {liveStores.length > 0
            ? liveStores.map((s) => <RealStoreCard key={s.id} store={s} />)
            : mockStores.map((s) => (
                <div key={s.name} className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy font-display text-sm font-bold text-white">
                      {s.name[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 text-sm font-semibold">
                        <span className="truncate">{s.name}</span>
                        <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />
                      </p>
                      <p className="truncate text-xs italic text-muted-foreground">{s.tagline}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {s.items.map((it) => (
                      <div key={it.seed} className="overflow-hidden rounded-lg bg-muted">
                        <div className="relative aspect-square">
                          <Image src={img(it.seed, 200)} alt="" fill className="object-cover" />
                        </div>
                        <p className="px-1.5 py-1 text-[11px] font-bold text-brand">{formatPrice(it.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
