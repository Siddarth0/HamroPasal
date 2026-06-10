import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

/** HamroPasal Seller wordmark — navy mark + orange bag, script wordmark. */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-foreground">
        <ShoppingBag className="h-4 w-4" />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            'block font-script text-xl font-bold',
            light ? 'text-white' : 'text-navy',
          )}
        >
          HamroPasal
        </span>
        <span
          className={cn(
            'block text-[10px] font-semibold uppercase tracking-[0.2em]',
            light ? 'text-white/60' : 'text-muted-foreground',
          )}
        >
          Seller Center
        </span>
      </span>
    </div>
  );
}
