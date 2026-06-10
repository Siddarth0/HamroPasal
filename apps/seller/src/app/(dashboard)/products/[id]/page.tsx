'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock } from '@/components/shared/states';
import { ProductForm } from '@/components/products/product-form';
import { ImageManager } from '@/components/products/image-manager';
import { useMyProduct } from '@/features/products/hooks';

function CreatedBanner() {
  const created = useSearchParams().get('created');
  if (!created) return null;
  return (
    <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
      <CheckCircle2 className="h-5 w-5" />
      Product created. Add some images below to make it shine.
    </div>
  );
}

export default function EditProductPage() {
  const id = String(useParams().id);
  const { data: product, isLoading, isError } = useMyProduct(id);

  if (isLoading) return <LoadingBlock />;
  if (isError || !product) return <ErrorBlock message="Product not found." />;

  return (
    <>
      <PageHeader title="Edit product" description={product.name} />
      <Suspense fallback={null}>
        <CreatedBanner />
      </Suspense>
      <div className="space-y-6">
        <ImageManager productId={product._id} images={product.images} />
        <ProductForm key={product.updatedAt} product={product} />
      </div>
    </>
  );
}
