import type { Metadata } from 'next';
import { StorePage } from '@/components/store/store-page';
import { JsonLd } from '@/components/seo/json-ld';
import { getStore, buildMetadata, storeLd, breadcrumbLd, SITE_NAME } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const store = await getStore(params.slug);
  if (!store) {
    return buildMetadata({
      title: 'Store not found',
      description: 'This store is no longer available.',
      path: `/store/${params.slug}`,
      noindex: true,
    });
  }

  const where = store.city ? ` in ${store.city}` : '';
  const description =
    store.description?.slice(0, 155) ??
    `Shop ${store.name}${where} on ${SITE_NAME}. Browse products and order online with fast delivery across Nepal.`;

  return buildMetadata({
    title: store.name,
    description,
    path: `/store/${store.slug}`,
    image: store.coverUrl ?? store.logoUrl ?? null,
    keywords: [store.name, `${store.name} online`, `${store.name} Nepal`],
  });
}

export default async function Page({ params }: { params: { slug: string } }) {
  const store = await getStore(params.slug);
  const crumbs = store
    ? breadcrumbLd([
        { name: SITE_NAME, path: '/' },
        { name: store.name, path: `/store/${store.slug}` },
      ])
    : null;

  return (
    <>
      {store && <JsonLd data={[storeLd(store), ...(crumbs ? [crumbs] : [])]} />}
      <StorePage slug={params.slug} />
    </>
  );
}
