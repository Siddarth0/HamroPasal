'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/account', label: 'Profile', icon: User },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/loyalty', label: 'Loyalty Points', icon: Sparkles },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);

  if (status === 'loading') {
    return <div className="container py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to manage your account.</p>
        <Button asChild variant="brand" className="mt-5">
          <Link href="/login?returnUrl=/account">Log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-colors lg:gap-3',
                    active
                      ? 'bg-brand/10 font-medium text-brand'
                      : 'bg-muted text-foreground/80 hover:bg-muted lg:bg-transparent',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
