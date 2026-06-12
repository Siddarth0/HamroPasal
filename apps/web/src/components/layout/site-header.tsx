'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, MessageCircle, Heart, ChevronDown, Tag } from 'lucide-react';
import { Logo } from './logo';
import { NotificationBell } from './notification-bell';
import { Button } from '@/components/ui/button';
import { useCartCount } from '@/features/cart/hooks';
import { useWishlistCount } from '@/features/wishlist/hooks';
import { useChatUnread } from '@/features/chat/hooks';
import { useSuggestions } from '@/features/catalog/hooks';
import { useChatUI } from '@/store/chat-ui';
import { cn, formatPrice } from '@/lib/utils';

function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // keyboard-highlighted row (-1 = none)
  const ref = useRef<HTMLFormElement>(null);

  // Debounce the query that hits the suggest endpoint.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 200);
    return () => clearTimeout(t);
  }, [q]);

  const { data } = useSuggestions(debounced);
  const products = data?.products ?? [];
  const categories = data?.categories ?? [];
  // Flat list (products first, then categories) for arrow-key navigation.
  const flat = [
    ...products.map((p) => ({ kind: 'product' as const, slug: p.slug })),
    ...categories.map((c) => ({ kind: 'category' as const, slug: c.slug })),
  ];
  const showDropdown = open && q.trim().length >= 2 && flat.length > 0;

  // Reset the highlight whenever the result set changes.
  useEffect(() => setActive(-1), [debounced]);

  // Close on outside click.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const goSearch = (term: string) => {
    setOpen(false);
    router.push(term.trim() ? `/products?search=${encodeURIComponent(term.trim())}` : '/products');
  };

  const select = (item: { kind: 'product' | 'category'; slug: string }) => {
    setOpen(false);
    setQ('');
    router.push(item.kind === 'product' ? `/product/${item.slug}` : `/category/${item.slug}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showDropdown && active >= 0 && flat[active]) {
      select(flat[active]);
      return;
    }
    goSearch(q);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(flat.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <form ref={ref} onSubmit={onSubmit} role="search" className="relative flex flex-1 items-center">
      <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search products, brands and shops..."
        aria-label="Search"
        autoComplete="off"
        className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-[104px] text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      />
      <Button type="submit" variant="brand" className="absolute right-1 h-9 px-5">
        Search
      </Button>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card py-1 shadow-xl">
          {products.map((p, i) => (
            <button
              key={p._id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select({ kind: 'product', slug: p.slug })}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 text-left',
                active === i ? 'bg-muted' : 'hover:bg-muted',
              )}
            >
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-md bg-muted object-cover"
                />
              ) : (
                <span className="h-9 w-9 shrink-0 rounded-md bg-muted" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
              <span className="shrink-0 text-xs font-semibold text-brand">{formatPrice(p.price)}</span>
            </button>
          ))}

          {categories.length > 0 && (
            <div className="mt-1 border-t border-border pt-1">
              {categories.map((c, ci) => {
                const i = products.length + ci;
                return (
                  <button
                    key={c._id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select({ kind: 'category', slug: c.slug })}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left',
                      active === i ? 'bg-muted' : 'hover:bg-muted',
                    )}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">Category</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

export function SiteHeader() {
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const chatUnread = useChatUnread();
  const openChat = useChatUI((s) => s.openList);

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
          {/* Wishlist + cart live in the bottom nav on mobile to keep the header uncluttered. */}
          <Link href="/wishlist" className="relative hidden md:block" aria-label="Wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative hidden md:block" aria-label="Cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Messages" onClick={openChat}>
              <MessageCircle className="h-5 w-5" />
            </Button>
            {chatUnread > 0 && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                {chatUnread > 99 ? '99+' : chatUnread}
              </span>
            )}
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* mobile search */}
      <div className="container pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
