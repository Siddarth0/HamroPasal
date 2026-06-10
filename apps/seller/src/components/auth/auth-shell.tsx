import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between bg-navy p-10 text-navy-foreground lg:flex">
        <Logo light />
        <div className="max-w-sm space-y-4">
          <h2 className="font-display text-3xl font-bold leading-tight">
            Grow your business on HamroPasal.
          </h2>
          <p className="text-white/70">
            Reach customers across Nepal. List products, manage orders and track your earnings — all
            from one Seller Center.
          </p>
        </div>
        <p className="text-xs text-white/40">© HamroPasal · Nepal&apos;s Marketplace</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
