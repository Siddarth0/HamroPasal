import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Store,
  Ticket,
  Wallet,
  Truck,
  MessageSquare,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/questions', label: 'Questions', icon: HelpCircle },
  { href: '/coupons', label: 'Coupons', icon: Ticket },
  { href: '/payouts', label: 'Payouts', icon: Wallet },
  { href: '/zones', label: 'Delivery Zones', icon: Truck },
  { href: '/store', label: 'Store Profile', icon: Store },
];

export const isNavActive = (href: string, pathname: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
