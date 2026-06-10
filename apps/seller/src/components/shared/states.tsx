import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return <Loader2 className={`animate-spin text-brand ${className}`} />;
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Spinner className="h-5 w-5" />
      {label}
    </div>
  );
}

export function ErrorBlock({ message = 'Something went wrong' }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-700">
      {message}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div>
        <p className="font-display text-lg font-semibold">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
