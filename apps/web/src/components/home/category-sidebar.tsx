import Link from 'next/link';
import {
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  ShoppingBasket,
  Dumbbell,
  Watch,
  Car,
  ToyBrick,
  BookOpen,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { name: 'Fashion', icon: Shirt },
  { name: 'Electronics', icon: Smartphone },
  { name: 'Home & Living', icon: Home },
  { name: 'Health & Beauty', icon: Sparkles },
  { name: 'Groceries', icon: ShoppingBasket },
  { name: 'Sports & Outdoor', icon: Dumbbell },
  { name: 'Watches & Bags', icon: Watch },
  { name: 'Automobile', icon: Car },
  { name: 'Toys & Baby', icon: ToyBrick },
  { name: 'Books & Stationery', icon: BookOpen },
];

export function CategorySidebar({ className }: { className?: string }) {
  return (
    <aside className={cn('overflow-hidden rounded-2xl border border-border bg-background', className)}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <LayoutGrid className="h-4 w-4 text-brand" />
        <span className="text-sm font-semibold">Categories</span>
      </div>
      <ul className="p-2 text-sm">
        {items.map(({ name, icon: Icon }) => (
          <li key={name}>
            <Link
              href={`/products?search=${encodeURIComponent(name)}`}
              className="group flex items-center gap-3 rounded-xl px-3 py-[9px] text-foreground/80 transition-colors hover:bg-muted hover:text-brand"
            >
              <Icon className="h-[18px] w-[18px] text-muted-foreground transition-colors group-hover:text-brand" />
              <span className="flex-1 font-medium">{name}</span>
              <ChevronRight className="h-4 w-4 -translate-x-1 text-brand opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/categories"
        className="flex items-center justify-center gap-1 border-t border-border py-3 text-sm font-semibold text-brand transition-colors hover:bg-muted"
      >
        View all categories
        <ChevronRight className="h-4 w-4" />
      </Link>
    </aside>
  );
}
