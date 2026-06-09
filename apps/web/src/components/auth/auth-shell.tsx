import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="container flex justify-center py-10 md:py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm md:p-8">
          <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>}
        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Small inline field-error line for forms. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-brand">{message}</p>;
}

/** Full-width alert (error/success) for form-level messages. */
export function FormAlert({ kind, children }: { kind: 'error' | 'success'; children: ReactNode }) {
  return (
    <div
      className={
        kind === 'error'
          ? 'mb-4 rounded-lg border border-brand/30 bg-brand/5 px-3 py-2 text-sm text-brand'
          : 'mb-4 rounded-lg border border-green-600/30 bg-green-50 px-3 py-2 text-sm text-green-700'
      }
    >
      {children}
    </div>
  );
}
