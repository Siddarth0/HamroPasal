import { Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import { flashSale } from '@/lib/mock';
import { ProductCard } from './product-card';

const timer = ['08', '17', '56'];

export function FlashSale() {
  return (
    <section className="container mt-8">
      <div className="rounded-2xl bg-background p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground">
              <Zap className="h-4 w-4 fill-current" />
            </span>
            <h2 className="font-display text-xl font-bold">Flash Sale</h2>
            <div className="flex items-center gap-1">
              {timer.map((t, i) => (
                <span key={t} className="flex items-center gap-1">
                  <span className="grid h-7 min-w-7 place-items-center rounded-full bg-brand px-1.5 text-xs font-semibold tabular-nums text-brand-foreground">
                    {t}
                  </span>
                  {i < timer.length - 1 && <span className="font-bold text-brand">:</span>}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-lg border border-border transition-colors hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-brand-foreground transition-colors hover:bg-brand/90">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="no-scrollbar grid auto-cols-[minmax(190px,1fr)] grid-flow-col gap-4 overflow-x-auto md:grid-flow-row md:auto-cols-auto md:grid-cols-5">
          {flashSale.map((p) => (
            <ProductCard key={p.id} product={p} mode="flash" />
          ))}
        </div>
      </div>
    </section>
  );
}
