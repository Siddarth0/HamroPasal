'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Smartphone } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { logout as logoutApi } from '@/features/auth/api';
import { SELLER_URL } from '@/lib/links';

const navLinks: { label: string; href: string; external?: boolean }[] = [
  { label: 'Sell on HamroPasal', href: SELLER_URL, external: true },
  { label: 'About Us', href: '/about' },
  { label: 'Help Center', href: '/help' },
  { label: 'Promo', href: '/products?sort=popular' },
];

export function TopBar() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const onLogout = async () => {
    try {
      await logoutApi();
    } catch {
      /* clear locally regardless */
    }
    clear();
    router.replace('/');
  };

  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="hidden border-b border-border bg-background md:block">
      <div className="container flex h-9 items-center justify-between text-xs text-muted-foreground">
        <Link href="/download" className="flex items-center gap-1.5 hover:text-foreground">
          <Smartphone className="h-3.5 w-3.5" />
          Download the HamroPasal App
        </Link>
        <nav className="flex items-center gap-5">
          {navLinks.map((l) =>
            l.external ? (
              <a key={l.label} href={l.href} className="hover:text-foreground">
                {l.label}
              </a>
            ) : (
              <Link key={l.label} href={l.href} className="hover:text-foreground">
                {l.label}
              </Link>
            ),
          )}
          <span className="text-border">|</span>

          {status === 'authenticated' ? (
            <>
              <Link href="/account" className="font-medium text-foreground hover:text-brand">
                Hi, {firstName}
              </Link>
              <Link href="/account/orders" className="hover:text-foreground">
                Orders
              </Link>
              <button onClick={onLogout} className="font-semibold text-foreground hover:text-brand">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="font-semibold text-foreground hover:text-brand">
                Sign Up
              </Link>
              <Link href="/login" className="font-semibold text-foreground hover:text-brand">
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
