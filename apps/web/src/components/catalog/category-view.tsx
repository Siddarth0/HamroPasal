'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useCategory } from '@/features/catalog/hooks';
import { ProductBrowse } from '@/components/catalog/product-browse';

function CategoryInner({ slug }: { slug: string }) {
  const { data, isLoading, isError } = useCategory(slug);

  if (isError) {
    return (
      <div className="container py-20 text-center">
        <p className="font-medium">Category not found</p>
        <Link href="/products" className="mt-2 inline-block text-sm text-brand hover:underline">
          Browse all products →
        </Link>
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="container py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return <ProductBrowse categoryId={data._id} heading={data.name} />;
}

export function CategoryView({ slug }: { slug: string }) {
  return (
    <Suspense>
      <CategoryInner slug={slug} />
    </Suspense>
  );
}
