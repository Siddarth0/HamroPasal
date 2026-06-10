import type { Metadata } from 'next';
import { Poppins, Dancing_Script } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Providers } from './providers';

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
  title: 'HamroPasal — Seller Center',
  description: 'Manage your store, products, orders and payouts on HamroPasal.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${poppins.variable} ${dancing.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
