'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { flashSale, mockToCard } from '@/lib/mock';
import { ProductCard } from './product-card';
import { ProductCardSkeleton } from './skeletons';
import { useProducts } from '@/features/catalog/hooks';
import { productToCard } from '@/features/catalog/api';

/** Live countdown to the end of the current day (resets the "flash" each day). */
function useEndOfDayCountdown() {
  const [parts, setParts] = useState<string[]>(['00', '00', '00']);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      let diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      const h = Math.floor(diff / 3600);
      diff %= 3600;
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setParts([h, m, s].map((n) => String(n).padStart(2, '0')));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return parts;
}

export function FlashSale() {
  const { data, isLoading } = useProducts({ sort: 'popular', limit: 10 });
  const live = data?.items ?? [];
  const showSkeleton = isLoading && live.length === 0;
  const products = live.length ? live.map(productToCard) : flashSale.map(mockToCard);
  const countdown = useEndOfDayCountdown();
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className="container mt-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-background p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground shadow-md shadow-brand/30">
              <Zap className="h-4 w-4 fill-current" />
            </span>
            <h2 className="font-display text-xl font-bold">Flash Sale</h2>
            <span className="hidden text-sm text-muted-foreground sm:inline">Ends in</span>
            <div className="flex items-center gap-1">
              {countdown.map((t, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-navy px-1.5 text-xs font-semibold tabular-nums text-white">
                    {t}
                  </span>
                  {i < countdown.length - 1 && <span className="font-bold text-brand">:</span>}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className="grid h-9 w-9 place-items-center rounded-lg border border-border transition-colors hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-brand-foreground transition-colors hover:bg-brand/90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1"
        >
          {showSkeleton
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[46%] shrink-0 sm:w-[220px]">
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((p) => (
                <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[220px]">
                  <ProductCard product={p} mode="flash" />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
