'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { NAV, isNavActive } from './nav-items';
import { useChatUnread } from '@/features/chat/hooks';
import { useUnansweredCount } from '@/features/questions/hooks';
import { useMyStore } from '@/features/store/hooks';
import { cn } from '@/lib/utils';

const STATUS_DOT = { ACTIVE: 'bg-emerald-400', PENDING: 'bg-amber-400', SUSPENDED: 'bg-red-400' } as const;

export function Sidebar() {
  const pathname = usePathname();
  const chatUnread = useChatUnread();
  const unanswered = useUnansweredCount();
  const { data: store } = useMyStore();

  const badgeFor = (href: string): number => {
    if (href === '/messages') return chatUnread;
    if (href === '/questions') return unanswered;
    return 0;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy text-navy-foreground lg:flex">
      <div className="px-5 py-5">
        <Logo light />
      </div>

      {store && (
        <Link
          href="/store"
          className="mx-3 mb-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10"
        >
          <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-brand font-display text-sm font-bold text-brand-foreground">
            {store.logoUrl ? (
              <Image src={store.logoUrl} alt={store.name} fill className="object-cover" sizes="36px" />
            ) : (
              store.name.charAt(0)
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{store.name}</span>
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[store.status])} />
              {store.status.charAt(0) + store.status.slice(1).toLowerCase()}
            </span>
          </span>
        </Link>
      )}

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isNavActive(href, pathname);
          const count = badgeFor(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand text-brand-foreground'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold',
                    active ? 'bg-white text-brand' : 'bg-brand text-brand-foreground',
                  )}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-xs text-white/40">HamroPasal · Nepal</div>
    </aside>
  );
}
