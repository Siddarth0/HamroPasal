import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';
import { stores, img } from '@/lib/mock';
import { formatPrice } from '@/lib/utils';

export function BestSellingStore() {
  return (
    <section className="container mt-12">
      <h2 className="mb-6 text-center font-display text-2xl font-bold">Best Selling Store</h2>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Featured mall */}
        <div className="overflow-hidden rounded-2xl bg-muted p-6">
          <div className="relative mb-5 h-44 overflow-hidden rounded-xl">
            <Image src={img('hamro-mall', 600)} alt="HamroPasal Mall" fill className="object-cover" />
          </div>
          <h3 className="font-display text-xl font-bold text-muted-foreground">HamroPasal Mall</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover thousands of verified sellers across Nepal — all in one place.
          </p>
        </div>

        {/* Store grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
          {stores.map((s) => (
            <div key={s.name} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted font-display text-sm font-bold">
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
                      <Image src={img(it.seed, 160)} alt="" fill className="object-cover" />
                    </div>
                    <p className="px-1.5 py-1 text-[11px] font-medium">{formatPrice(it.price)}</p>
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
