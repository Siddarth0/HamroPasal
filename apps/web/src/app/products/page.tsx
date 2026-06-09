import { Suspense } from 'react';
import { ProductBrowse } from '@/components/catalog/product-browse';

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductBrowse heading="All Products" />
    </Suspense>
  );
}
