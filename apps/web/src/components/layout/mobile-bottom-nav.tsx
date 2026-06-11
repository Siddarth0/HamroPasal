'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Heart, ShoppingCart, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useCartCount } from '@/features/cart/hooks';
import { useWishlistCount } from '@/features/wishlist/hooks';
import { cn } from '@/lib/utils';

/** App-style bottom tab bar for mobile (hidden on md+). Also the only place to
 *  reach account/login on small screens, since the top utility bar is desktop-only. */
export function MobileBottomNav() {
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const cart = useCartCount();
  const wish = useWishlistCount();

  const tabs = [
    { href: '/', label: 'Home', icon: Home, badge: 0 },
    { href: '/categories', label: 'Categories', icon: LayoutGrid, badge: 0 },
    { href: '/wishlist', label: 'Wishlist', icon: Heart, badge: wish },
    { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: cart },
    {
      href: status === 'authenticated' ? '/account' : '/login',
      label: 'Account',
      icon: User,
      badge: 0,
    },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              isActive(href) ? 'text-brand' : 'text-muted-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
            {badge > 0 && (
              <span className="absolute right-[calc(50%-1.4rem)] top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[9px] font-bold text-brand-foreground">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
