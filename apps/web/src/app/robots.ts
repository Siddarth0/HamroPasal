import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private / transactional surfaces — no SEO value, keep out of the index.
      disallow: [
        '/account',
        '/cart',
        '/checkout',
        '/orders',
        '/wishlist',
        '/messages',
        '/notifications',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/auth',
        '/payment',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
