import Link from 'next/link';
import { Smartphone } from 'lucide-react';

const left = 'Download the HamroPasal App';
const navLinks = ['Sell on HamroPasal', 'About Us', 'Help Center', 'Promo'];

export function TopBar() {
  return (
    <div className="hidden border-b border-border bg-background md:block">
      <div className="container flex h-9 items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5" />
          {left}
        </span>
        <nav className="flex items-center gap-5">
          {navLinks.map((l) => (
            <Link key={l} href="#" className="hover:text-foreground">
              {l}
            </Link>
          ))}
          <span className="text-border">|</span>
          <Link href="/register" className="font-semibold text-foreground hover:text-brand">
            Sign Up
          </Link>
          <Link href="/login" className="font-semibold text-foreground hover:text-brand">
            Login
          </Link>
        </nav>
      </div>
    </div>
  );
}
