'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  DollarSign,
  Wallet,
  Package,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { LoadingBlock, ErrorBlock } from '@/components/shared/states';
import { NoStorePrompt } from '@/components/shared/no-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/shared/status-badge';
import { useMyStore } from '@/features/store/hooks';
import { fetchSellerStats } from '@/features/analytics/api';
import { formatPrice } from '@/lib/utils';
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

export default function DashboardPage() {
  const { data: store, isLoading: storeLoading } = useMyStore();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: fetchSellerStats,
    enabled: !!store,
  });

  if (storeLoading) return <LoadingBlock />;
  if (!store) {
    return (
      <>
        <PageHeader title="Dashboard" description="Your store at a glance" />
        <NoStorePrompt />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back to ${store.name}`} />

      {store.status !== 'ACTIVE' && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">
              {store.status === 'PENDING'
                ? 'Your store is awaiting admin approval'
                : 'Your store is currently suspended'}
            </p>
            <p className="mt-0.5 text-amber-700">
              Your products stay hidden from shoppers until your store is active. You can still
              prepare your catalog in the meantime.
            </p>
          </div>
        </div>
      )}

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load your analytics." />}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Delivered revenue"
              value={formatPrice(stats.deliveredRevenue)}
              icon={<DollarSign className="h-5 w-5" />}
              hint="Subtotal of delivered orders"
            />
            <StatCard
              label="Your earnings"
              value={formatPrice(stats.deliveredEarnings)}
              icon={<Wallet className="h-5 w-5" />}
              hint="After platform commission"
            />
            <StatCard
              label="Products"
              value={stats.productCount}
              icon={<Package className="h-5 w-5" />}
            />
            <StatCard
              label="Total orders"
              value={Object.values(stats.subOrders).reduce((a, b) => a + b, 0)}
              icon={<ClipboardList className="h-5 w-5" />}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Orders by status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SUBORDER_ORDER.filter((s) => stats.subOrders[s]).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  SUBORDER_ORDER.filter((s) => stats.subOrders[s]).map((s) => (
                    <div key={s} className="flex items-center justify-between">
                      <OrderStatusBadge status={s} />
                      <span className="font-semibold">{stats.subOrders[s]}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top products</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sales data yet.</p>
                ) : (
                  <ol className="space-y-3">
                    {stats.topProducts.map((p, i) => (
                      <li key={p._id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                            {i + 1}
                          </span>
                          <span className="line-clamp-1 text-sm font-medium">{p.name}</span>
                        </div>
                        <span className="flex items-center gap-1 whitespace-nowrap text-sm text-muted-foreground">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {p.soldCount} sold
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/products/new"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground hover:bg-brand/90"
            >
              + Add product
            </Link>
            <Link
              href="/orders"
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              View orders
            </Link>
          </div>
        </>
      )}
    </>
  );
}
