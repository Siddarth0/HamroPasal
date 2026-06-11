import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Star, ArrowRight, Store } from 'lucide-react';
import { stores, img } from '@/lib/mock';
import { formatPrice } from '@/lib/utils';

export function BestSellingStore() {
  return (
    <section className="container mt-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Best Selling Stores</h2>
          <p className="mt-1 text-sm text-muted-foreground">Top-rated sellers shoppers love</p>
        </div>
        <Link
          href="/products"
          className="hidden items-center gap-1 text-sm font-semibold text-brand hover:underline sm:flex"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Featured mall — image with overlaid copy */}
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

        {/* Store grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
          {stores.map((s) => (
            <div
              key={s.name}
              className="rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy font-display text-sm font-bold text-white">
                  {s.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-sm font-semibold">
                    <span className="truncate">{s.name}</span>
                    <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />
                  </p>
                  <p className="truncate text-xs italic text-muted-foreground">{s.tagline}</p>
                </div>
                <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  4.9
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {s.items.map((it) => (
                  <div
                    key={it.seed}
                    className="overflow-hidden rounded-lg bg-muted ring-1 ring-transparent transition-all hover:ring-brand/30"
                  >
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
