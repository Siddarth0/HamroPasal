'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { NAV, isNavActive } from './nav-items';
import { useChatUnread } from '@/features/chat/hooks';
import { useUnansweredCount } from '@/features/questions/hooks';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const chatUnread = useChatUnread();
  const unanswered = useUnansweredCount();

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
