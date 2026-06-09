'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Bell, Heart, ChevronDown } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { useCartCount } from '@/features/cart/hooks';
import { useWishlistCount } from '@/features/wishlist/hooks';
import { useUnreadCount } from '@/features/notifications/hooks';

function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
  };

  return (
    <form onSubmit={onSubmit} className="relative flex flex-1 items-center">
      <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products, brands and shops..."
        className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-[104px] text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      />
      <Button type="submit" variant="brand" className="absolute right-1 h-9 px-5">
        Search
      </Button>
    </form>
  );
}

export function SiteHeader() {
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const unreadCount = useUnreadCount();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-3 md:gap-5">
        <Logo />

        {/* All Category + search */}
        <div className="ml-2 hidden flex-1 items-center gap-2 md:flex">
          <Button asChild variant="outline" size="sm" className="h-11 shrink-0 gap-1.5 px-4 text-muted-foreground">
            <Link href="/categories">
              All Category
              <ChevronDown className="h-4 w-4" />
            </Link>
          </Button>
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/wishlist" className="relative" aria-label="Wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative" aria-label="Cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <Link href="/notifications" className="relative" aria-label="Notifications">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* mobile search */}
      <div className="container pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
