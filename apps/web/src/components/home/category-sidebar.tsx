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
    <aside className={cn('rounded-2xl border border-border bg-background p-2', className)}>
      <ul className="text-sm">
        {items.map(({ name, icon: Icon }) => (
          <li key={name}>
            <a
              href="#"
              className="group flex items-center gap-3 rounded-xl px-3 py-[9px] text-foreground/80 transition-colors hover:bg-muted hover:text-brand"
            >
              <Icon className="h-[18px] w-[18px] text-muted-foreground transition-colors group-hover:text-brand" />
              <span className="flex-1 font-medium">{name}</span>
              <ChevronRight className="h-4 w-4 text-transparent transition-colors group-hover:text-brand" />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
