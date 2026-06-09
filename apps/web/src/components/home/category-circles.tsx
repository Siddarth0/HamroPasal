import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';
import { categories, img } from '@/lib/mock';

export function CategoryCircles() {
  return (
    <section className="mt-6 border-y border-border bg-background">
      <div className="container flex flex-wrap items-start justify-center gap-x-7 gap-y-5 py-6 md:justify-between">
        {categories.map((c) => (
          <a key={c.name} href="#" className="group flex w-16 flex-col items-center gap-2">
            <span className="h-14 w-14 overflow-hidden rounded-full ring-1 ring-border transition-transform group-hover:scale-105">
              <Image
                src={img(c.seed, 120)}
                alt={c.name}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
              {c.name}
            </span>
          </a>
        ))}
        <a href="#" className="group flex w-16 flex-col items-center gap-2">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-muted ring-1 ring-border transition-transform group-hover:scale-105">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          </span>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
            All Category
          </span>
        </a>
      </div>
    </section>
  );
}
