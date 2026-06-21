import type { Metadata } from 'next';
import { ProductDetail } from '@/components/catalog/product-detail';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getProduct,
  buildMetadata,
  productLd,
  breadcrumbLd,
  SITE_NAME,
} from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return buildMetadata({
      title: 'Product not found',
      description: 'This product is no longer available.',
      path: `/product/${params.slug}`,
      noindex: true,
    });
  }

  const off =
    product.comparePrice && product.comparePrice > product.price
      ? ` Save ${Math.round((1 - product.price / product.comparePrice) * 100)}%.`
      : '';
  const description =
    product.description?.slice(0, 155) ??
    `Buy ${product.name} online in Nepal — Rs. ${product.price}.${off} Delivered to your door. Pay with eSewa, Khalti, card or COD.`;

  return buildMetadata({
    title: product.name,
    description,
    path: `/product/${product.slug}`,
    image: product.images?.[0]?.url ?? null,
    type: 'article',
    keywords: [product.name, ...(product.tags ?? []), `buy ${product.name} Nepal`],
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  const category =
    product && typeof product.categoryId === 'object' ? product.categoryId : undefined;
  const crumbs = product
    ? breadcrumbLd([
        { name: SITE_NAME, path: '/' },
        ...(category?.slug && category?.name
          ? [{ name: category.name, path: `/category/${category.slug}` }]
          : []),
        { name: product.name, path: `/product/${product.slug}` },
      ])
    : null;

  return (
    <>
      {product && <JsonLd data={[productLd(product), ...(crumbs ? [crumbs] : [])]} />}
      <ProductDetail slug={params.slug} />
    </>
  );
}
