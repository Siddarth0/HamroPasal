import { ProductDetail } from '@/components/catalog/product-detail';

export default function ProductPage({ params }: { params: { slug: string } }) {
  return <ProductDetail slug={params.slug} />;
}
