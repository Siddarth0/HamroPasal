import type { MetadataRoute } from 'next';
import { SITE_URL, listProducts, listCategories, listStores } from '@/lib/seo';

// Revalidate the sitemap every 6h so newly added products/stores get indexed
// without rebuilding the whole site.
export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, stores] = await Promise.all([
    listProducts(),
    listCategories(),
    listStores(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/products',
    '/categories',
    '/about',
    '/contact',
    '/help',
    '/terms',
    '/privacy',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const storeRoutes: MetadataRoute.Sitemap = stores.map((s) => ({
    url: `${SITE_URL}/store/${s.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...storeRoutes, ...productRoutes];
}
