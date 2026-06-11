import Link from 'next/link';
import { Facebook, Twitter, Youtube, Instagram, Smartphone } from 'lucide-react';
import { Logo } from './logo';
import { SELLER_URL } from '@/lib/links';

type FooterLink = { label: string; href: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'HamroPasal',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/about' },
      { label: 'Blog', href: '/about' },
      { label: 'Press', href: '/about' },
    ],
  },
  {
    title: 'Buy',
    links: [
      { label: 'How to Buy', href: '/help' },
      { label: 'Payment Options', href: '/help' },
      { label: 'Cash on Delivery', href: '/help' },
      { label: 'Track Your Order', href: '/account/orders' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Sell on HamroPasal', href: SELLER_URL, external: true },
      { label: 'Seller Center', href: SELLER_URL, external: true },
      { label: 'Become a Seller', href: SELLER_URL, external: true },
      { label: 'Seller Help', href: '/help' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
];

const socials = [Facebook, Twitter, Youtube, Instagram];

const payments = ['COD', 'Khalti', 'eSewa', 'Visa', 'Mastercard'];

export function SiteFooter() {
  return (
    <footer className="mt-12 bg-footer text-footer-foreground">
      <div className="container grid grid-cols-2 gap-8 py-12 md:grid-cols-6">
        <div className="col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm text-white/60">
            Nepal’s online marketplace — shop from thousands of trusted local sellers.
          </p>
          <Link
            href="/download"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <Smartphone className="h-4 w-4" /> Get the app
          </Link>
          <div className="mt-5 flex gap-3">
            {socials.map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-brand hover:text-brand-foreground"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-semibold text-white">{col.title}</h4>
            <ul className="space-y-3 text-sm text-white/60">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.href} className="transition-colors hover:text-white">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} HamroPasal. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">We accept</span>
            {payments.map((p) => (
              <span
                key={p}
                className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/70"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
