import {
  LayoutDashboard,
  Store,
  Users,
  ClipboardList,
  Package,
  FolderTree,
  Ticket,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/stores', label: 'Stores', icon: Store },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/categories', label: 'Categories', icon: FolderTree },
  { href: '/coupons', label: 'Coupons', icon: Ticket },
  { href: '/payouts', label: 'Payouts', icon: Wallet },
];

export const isNavActive = (href: string, pathname: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
