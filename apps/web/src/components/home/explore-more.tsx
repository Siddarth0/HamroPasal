'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from './product-card';
import { ProductCardSkeletonRow } from './skeletons';
import { useProducts } from '@/features/catalog/hooks';
import { productToCard } from '@/features/catalog/api';

export function ExploreMore() {
  const { data, isLoading } = useProducts({ sort: 'newest', limit: 18 });
  const products = (data?.items ?? []).map(productToCard);

  // Hide entirely only once we know there's genuinely nothing.
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="container mt-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Explore More</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fresh finds across every category</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading && products.length === 0 ? (
          <ProductCardSkeletonRow count={12} />
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} mode="rating" />)
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
        >
          See all products
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
