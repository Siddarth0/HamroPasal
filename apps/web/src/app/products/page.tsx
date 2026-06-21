import { Suspense } from 'react';
import { ProductBrowse } from '@/components/catalog/product-browse';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'All Products — Online Shopping in Nepal',
  description:
    'Browse thousands of products from local sellers across Nepal. Filter by category, price and rating. Order online with eSewa, Khalti, card or cash on delivery.',
  path: '/products',
  keywords: ['online shopping Nepal', 'buy products online Nepal', 'best prices Nepal'],
});

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductBrowse heading="All Products" />
    </Suspense>
  );
}
