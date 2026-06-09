import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

// Clean header lockup echoing the HamroPasal logo (navy + orange, script wordmark).
// Swap for the real asset by dropping a transparent SVG/PNG in /public.
export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'grid h-8 w-8 place-items-center rounded-lg',
          dark ? 'bg-white' : 'bg-navy',
        )}
        aria-hidden
      >
        <ShoppingBag className="h-[18px] w-[18px] text-brand" />
      </span>
      <span
        className={cn(
          'font-script text-[26px] font-bold leading-none',
          dark ? 'text-white' : 'text-navy',
        )}
      >
        HamroPasal
      </span>
    </Link>
  );
}
