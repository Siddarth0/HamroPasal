'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Bell, ChevronDown } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';

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
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-3 md:gap-5">
        <Logo />

        {/* All Category + search */}
        <div className="ml-2 hidden flex-1 items-center gap-2 md:flex">
          <Button variant="outline" size="sm" className="h-11 shrink-0 gap-1.5 px-4 text-muted-foreground">
            All Category
            <ChevronDown className="h-4 w-4" />
          </Button>
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* mobile search */}
      <div className="container pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
