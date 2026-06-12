'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCategories } from '@/features/catalog/hooks';

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const cats = data ?? [];

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-bold">All Categories</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : cats.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {cats.map((c) => (
            <Link
              key={c._id}
              href={`/category/${c.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md"
            >
              <div className="mx-auto mb-3 grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-muted font-display text-2xl font-bold text-muted-foreground ring-1 ring-border">
                {c.image?.url ? (
                  <Image
                    src={c.image.url}
                    alt={c.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  c.name.charAt(0)
                )}
              </div>
              <p className="text-sm font-medium group-hover:text-brand">{c.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
