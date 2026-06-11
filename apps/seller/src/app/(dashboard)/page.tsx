'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Wallet,
  Package,
  ClipboardList,
  PackageCheck,
  Plus,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { LoadingBlock, ErrorBlock } from '@/components/shared/states';
import { NoStorePrompt } from '@/components/shared/no-store';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/shared/status-badge';
import { useMyStore } from '@/features/store/hooks';
import { fetchSellerStats } from '@/features/analytics/api';
import { formatPrice, cn } from '@/lib/utils';
import type { OrderStatus } from 'shared-types';

const SUBORDER_ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

const BAR_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-blue-400',
  PROCESSING: 'bg-indigo-400',
  SHIPPED: 'bg-brand',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-red-400',
  REFUNDED: 'bg-zinc-300',
};

const STORE_PILL = {
  ACTIVE: 'bg-emerald-400/20 text-emerald-300',
  PENDING: 'bg-amber-400/20 text-amber-300',
  SUSPENDED: 'bg-red-400/20 text-red-300',
} as const;

export default function DashboardPage() {
  const { data: store, isLoading: storeLoading } = useMyStore();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: fetchSellerStats,
    enabled: !!store,
  });

  if (storeLoading) return <LoadingBlock />;
  if (!store) {
    return <NoStorePrompt />;
  }

  const totalOrders = stats ? Object.values(stats.subOrders).reduce((a, b) => a + b, 0) : 0;
  const present = SUBORDER_ORDER.filter((s) => stats?.subOrders[s]);
  const topMax = Math.max(1, ...(stats?.topProducts.map((p) => p.soldCount) ?? [1]));

  return (
    <>
      {/* Branded header */}
      <div className="relative overflow-hidden rounded-2xl bg-navy p-6 text-white md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/50">Welcome back to</p>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold md:text-3xl">{store.name}</h1>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  STORE_PILL[store.status],
                )}
              >
                {store.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/store"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
            >
              Manage store
            </Link>
            <Link
              href="/products/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
            >
              <Plus className="h-4 w-4" /> Add product
            </Link>
          </div>
        </div>

        {stats && (
          <div className="relative mt-6 grid gap-4 sm:grid-cols-2 sm:gap-8">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Your earnings</p>
              <p className="mt-1 font-display text-3xl font-bold">
                {formatPrice(stats.deliveredEarnings)}
              </p>
              <p className="mt-1 text-xs text-white/50">After platform commission</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Delivered revenue</p>
              <p className="mt-1 font-display text-3xl font-bold">
                {formatPrice(stats.deliveredRevenue)}
              </p>
              <p className="mt-1 text-xs text-white/50">Gross from delivered orders</p>
            </div>
          </div>
        )}
      </div>

      {store.status !== 'ACTIVE' && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">
              {store.status === 'PENDING'
                ? 'Your store is awaiting admin approval'
                : 'Your store is currently suspended'}
            </p>
            <p className="mt-0.5 text-amber-700">
              Your products stay hidden from shoppers until your store is active — but you can prep
              your catalog now.
            </p>
          </div>
        </div>
      )}

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load your analytics." />}

      {stats && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Products" value={stats.productCount} icon={<Package className="h-5 w-5" />} />
            <StatCard label="Total orders" value={totalOrders} icon={<ClipboardList className="h-5 w-5" />} />
            <StatCard
              label="Delivered"
              value={stats.subOrders.DELIVERED ?? 0}
              icon={<PackageCheck className="h-5 w-5" />}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Orders by status</CardTitle>
              </CardHeader>
              <CardContent>
                {totalOrders === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <>
                    <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                      {present.map((s) => (
                        <div
                          key={s}
                          className={BAR_COLOR[s]}
                          style={{ width: `${(stats.subOrders[s] / totalOrders) * 100}%` }}
                          title={`${s}: ${stats.subOrders[s]}`}
                        />
                      ))}
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {present.map((s) => (
                        <div key={s} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className={cn('h-2.5 w-2.5 rounded-full', BAR_COLOR[s])} />
                            <OrderStatusBadge status={s} />
                          </span>
                          <span className="font-semibold tabular-nums">{stats.subOrders[s]}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top products</CardTitle>
                <Link href="/products" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                  All products <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No sales data yet.</p>
                ) : (
                  <ol className="space-y-4">
                    {stats.topProducts.map((p, i) => (
                      <li key={p._id} className="flex items-center gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="line-clamp-1 text-sm font-medium">{p.name}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">{p.soldCount} sold</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-brand"
                              style={{ width: `${(p.soldCount / topMax) * 100}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
