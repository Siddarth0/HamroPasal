import type { Metadata } from 'next';
import { CategoryView } from '@/components/catalog/category-view';
import { JsonLd } from '@/components/seo/json-ld';
import { getCategory, buildMetadata, breadcrumbLd, SITE_NAME } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategory(params.slug);
  if (!category) {
    return buildMetadata({
      title: 'Category not found',
      description: 'This category is no longer available.',
      path: `/category/${params.slug}`,
      noindex: true,
    });
  }

  const description =
    category.description?.slice(0, 155) ??
    `Shop ${category.name} online in Nepal on ${SITE_NAME}. Compare prices from local sellers and order with fast delivery and easy payment.`;

  return buildMetadata({
    title: `${category.name} — Buy Online in Nepal`,
    description,
    path: `/category/${category.slug}`,
    image: category.image?.url ?? null,
    keywords: [category.name, `${category.name} Nepal`, `buy ${category.name} online`],
  });
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);
  const crumbs = category
    ? breadcrumbLd([
        { name: SITE_NAME, path: '/' },
        { name: 'Categories', path: '/categories' },
        { name: category.name, path: `/category/${category.slug}` },
      ])
    : null;

  return (
    <>
      {crumbs && <JsonLd data={crumbs} />}
      <CategoryView slug={params.slug} />
    </>
  );
}
