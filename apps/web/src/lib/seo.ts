import type { Metadata } from 'next';

/* ---------------------------------------------------------------------------
 * Central SEO config + server-side helpers.
 *
 * Everything here runs on the SERVER (sitemap, robots, generateMetadata,
 * JSON-LD). It deliberately does NOT use the authed axios client in
 * `lib/api.ts` (that touches the Zustand store / browser-only refresh cookie).
 * Instead it hits the PUBLIC API endpoints with native `fetch` so Next can
 * cache + dedupe the calls.
 * ------------------------------------------------------------------------- */

export const SITE_NAME = 'HamroPasal';

/** Canonical origin of the storefront (no trailing slash). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hamropasal-alpha.vercel.app'
).replace(/\/$/, '');

export const SITE_DESCRIPTION =
  'Shop from thousands of local sellers across Nepal. Fashion, electronics, home & more — at the best prices, delivered to your door. Pay with eSewa, Khalti, cards or cash on delivery.';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

/** Build an absolute URL from a site-relative path. */
export const abs = (path = '/'): string => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/* ---- Server-side public fetcher --------------------------------------- */

interface Envelope<T> {
  data: T;
  meta?: { hasNextPage?: boolean; totalPages?: number };
}

async function apiGet<T>(path: string, revalidate = 3600): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as Envelope<T>;
    return json.data;
  } catch {
    return null;
  }
}

/**
 * Fetches every page of a paginated list endpoint (the API caps `limit` at 100),
 * so the sitemap covers the whole catalog rather than just the first page.
 * Capped at MAX_PAGES as a runaway guard.
 */
async function apiGetAll<T>(path: string, revalidate = 21600): Promise<T[]> {
  const MAX_PAGES = 50;
  const sep = path.includes('?') ? '&' : '?';
  const out: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const res = await fetch(`${API_URL}${path}${sep}page=${page}&limit=100`, {
        next: { revalidate },
      });
      if (!res.ok) break;
      const json = (await res.json()) as Envelope<T[]>;
      out.push(...(json.data ?? []));
      if (!json.meta?.hasNextPage) break;
    } catch {
      break;
    }
  }
  return out;
}

/* ---- Minimal wire shapes (server-only; mirror features/catalog/api) ---- */

interface SeoImage {
  url: string;
}

export interface SeoProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock?: number;
  images?: SeoImage[];
  avgRating?: number;
  reviewCount?: number;
  tags?: string[];
  categoryId?: { name?: string; slug?: string } | string;
  store?: { name?: string; slug?: string } | null;
}

export interface SeoCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: SeoImage;
}

export interface SeoStore {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  city?: string | null;
}

export const getProduct = (slug: string) => apiGet<SeoProduct>(`/products/${slug}`);
export const getCategory = (slug: string) => apiGet<SeoCategory>(`/categories/${slug}`);
export const getStore = (slug: string) => apiGet<SeoStore>(`/stores/${slug}`);

export const listProducts = () => apiGetAll<SeoProduct>('/products?sort=newest');
export const listCategories = () => apiGet<SeoCategory[]>('/categories', 21600).then((r) => r ?? []);
export const listStores = () => apiGetAll<SeoStore>('/stores');

/* ---- Metadata helper -------------------------------------------------- */

interface BuildMetaArgs {
  title: string;
  description: string;
  /** Site-relative path, e.g. `/product/cool-shoes`. Used for canonical + OG url. */
  path: string;
  image?: string | null;
  /** `product` for PDPs, otherwise `website`. */
  type?: 'website' | 'article';
  noindex?: boolean;
  keywords?: string[];
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex,
  keywords,
}: BuildMetaArgs): Metadata {
  const url = abs(path);
  const ogImage = image ?? abs('/og-default.png');
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

/* ---- JSON-LD builders ------------------------------------------------- */

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs('/icon-512.png'),
    description: SITE_DESCRIPTION,
    areaServed: 'NP',
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function productLd(p: SeoProduct) {
  const category = typeof p.categoryId === 'object' ? p.categoryId?.name : undefined;
  const inStock = (p.stock ?? 1) > 0;
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: (p.description ?? SITE_DESCRIPTION).slice(0, 5000),
    image: (p.images ?? []).map((i) => i.url),
    sku: p._id,
    ...(category ? { category } : {}),
    ...(p.store?.name ? { brand: { '@type': 'Brand', name: p.store.name } } : {}),
    offers: {
      '@type': 'Offer',
      url: abs(`/product/${p.slug}`),
      priceCurrency: 'NPR',
      price: p.price,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      ...(p.store?.name ? { seller: { '@type': 'Organization', name: p.store.name } } : {}),
    },
  };
  if (p.avgRating && p.reviewCount) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.avgRating,
      reviewCount: p.reviewCount,
    };
  }
  return ld;
}

export function storeLd(s: SeoStore) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: s.name,
    url: abs(`/store/${s.slug}`),
    ...(s.description ? { description: s.description } : {}),
    ...(s.logoUrl ? { image: s.logoUrl } : {}),
    ...(s.city ? { address: { '@type': 'PostalAddress', addressLocality: s.city, addressCountry: 'NP' } } : {}),
  };
}
