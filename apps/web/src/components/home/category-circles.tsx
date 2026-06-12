'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { useCategories } from '@/features/catalog/hooks';
import { CategoryCircleSkeleton } from './skeletons';

export function CategoryCircles() {
  const { data, isLoading } = useCategories();
  const cats = data ?? [];
  const showSkeleton = isLoading && cats.length === 0;

  // No categories and nothing loading → hide the strip.
  if (!isLoading && cats.length === 0) return null;

  return (
    <section className="mt-6 border-y border-border bg-background">
      <div className="container flex flex-wrap items-start justify-center gap-x-7 gap-y-5 py-6 md:justify-between">
        {showSkeleton &&
          Array.from({ length: 9 }).map((_, i) => <CategoryCircleSkeleton key={i} />)}

        {!showSkeleton &&
          cats.map((c) => (
            <Link key={c._id} href={`/category/${c.slug}`} className="group flex w-16 flex-col items-center gap-2">
              <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-muted font-display text-lg font-bold text-muted-foreground ring-1 ring-border transition-transform group-hover:scale-105">
                {c.image?.url ? (
                  <Image src={c.image.url} alt={c.name} width={56} height={56} className="h-full w-full object-cover" />
                ) : (
                  c.name.charAt(0)
                )}
              </span>
              <span className="text-center text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {c.name}
              </span>
            </Link>
          ))}

        {!showSkeleton && (
          <Link href="/categories" className="group flex w-16 flex-col items-center gap-2">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-muted ring-1 ring-border transition-transform group-hover:scale-105">
              <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            </span>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
              All Category
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
