import type { Metadata } from 'next';
import { Poppins, Dancing_Script } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Providers } from './providers';
import { TopBar } from '@/components/layout/top-bar';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { JsonLd } from '@/components/seo/json-ld';
import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
  organizationLd,
  websiteLd,
} from '@/lib/seo';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Nepal’s Online Marketplace`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'online shopping Nepal',
    'buy online Nepal',
    'ecommerce Nepal',
    'marketplace Nepal',
    'HamroPasal',
    'eSewa',
    'Khalti',
    'cash on delivery',
    'electronics',
    'fashion',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Nepal’s Online Marketplace`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_NP',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Nepal’s Online Marketplace`,
    description: SITE_DESCRIPTION,
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  verification: { google: 'MHv931FFXlO-K5NjjOgBl4kioGEtTQwRl8wuhmvtKJw' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${poppins.variable} ${dancing.variable}`}>
      <body>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <Providers>
          <TopBar />
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
          {/* Clears the fixed mobile bottom nav so the footer isn't hidden behind it. */}
          <div aria-hidden className="h-14 md:hidden" />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
