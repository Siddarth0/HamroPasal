import Link from 'next/link';
import { Facebook, Twitter, Youtube, Instagram } from 'lucide-react';
import { Logo } from './logo';

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'HamroPasal',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Press', href: '#' },
    ],
  },
  {
    title: 'Buy',
    links: [
      { label: 'How to Buy', href: '#' },
      { label: 'Payment Options', href: '#' },
      { label: 'Cash on Delivery', href: '#' },
      { label: 'Track Your Order', href: '/account/orders' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Sell on HamroPasal', href: '#' },
      { label: 'Seller Center', href: '#' },
      { label: 'Become a Seller', href: '#' },
      { label: 'Seller Help', href: '#' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Contact Us', href: '#' },
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
                  <Link href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
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
