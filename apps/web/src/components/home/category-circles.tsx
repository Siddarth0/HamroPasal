'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { categories as mockCategories, img } from '@/lib/mock';
import { useCategories } from '@/features/catalog/hooks';

interface Circle {
  name: string;
  image: string;
  href: string;
}

export function CategoryCircles() {
  const { data } = useCategories();

  const circles: Circle[] = data?.length
    ? data.map((c) => ({
        name: c.name,
        image: c.image?.url ?? img(c.slug, 120),
        href: `/category/${c.slug}`,
      }))
    : mockCategories.map((c) => ({ name: c.name, image: img(c.seed, 120), href: '#' }));

  return (
    <section className="mt-6 border-y border-border bg-background">
      <div className="container flex flex-wrap items-start justify-center gap-x-7 gap-y-5 py-6 md:justify-between">
        {circles.map((c) => (
          <Link key={c.name} href={c.href} className="group flex w-16 flex-col items-center gap-2">
            <span className="h-14 w-14 overflow-hidden rounded-full ring-1 ring-border transition-transform group-hover:scale-105">
              <Image src={c.image} alt={c.name} width={56} height={56} className="h-full w-full object-cover" />
            </span>
            <span className="text-center text-xs font-medium text-muted-foreground group-hover:text-foreground">
              {c.name}
            </span>
          </Link>
        ))}
        <Link href="/categories" className="group flex w-16 flex-col items-center gap-2">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-muted ring-1 ring-border transition-transform group-hover:scale-105">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          </span>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
            All Category
          </span>
        </Link>
      </div>
    </section>
  );
}
