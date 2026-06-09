import Link from 'next/link';
import { Facebook, Twitter, Youtube, Instagram } from 'lucide-react';
import { Logo } from './logo';

const columns = [
  { title: 'HamroPasal', links: ['About Us', 'Careers', 'Blog', 'Press'] },
  { title: 'Buy', links: ['How to Buy', 'Payment Options', 'Cash on Delivery', 'Track Your Order'] },
  { title: 'Sell', links: ['Sell on HamroPasal', 'Seller Center', 'Become a Seller', 'Seller Help'] },
  { title: 'Help', links: ['Help Center', 'Terms & Conditions', 'Privacy Policy', 'Contact Us'] },
];

const socials = [Facebook, Twitter, Youtube, Instagram];

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
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
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
                <li key={l}>
                  <Link href="#" className="hover:text-white">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} HamroPasal. All rights reserved.
      </div>
    </footer>
  );
}
