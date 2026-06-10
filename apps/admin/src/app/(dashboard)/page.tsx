'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Percent,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { LoadingBlock, ErrorBlock } from '@/components/shared/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/shared/status-badge';
import { fetchPlatformStats } from '@/features/analytics/api';
import { formatPrice } from '@/lib/utils';
import type { OrderStatus } from 'shared-types';

const ORDER_ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

const sum = (rec: Record<string, number>) => Object.values(rec).reduce((a, b) => a + b, 0);

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: fetchPlatformStats,
  });

  if (isLoading) return <LoadingBlock />;
  if (isError || !stats) return <ErrorBlock message="Could not load platform analytics." />;

  return (
    <>
      <PageHeader title="Dashboard" description="Marketplace overview" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue (paid)"
          value={formatPrice(stats.revenue)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Commission earned"
          value={formatPrice(stats.commissionEarned)}
          icon={<Percent className="h-5 w-5" />}
          hint="From delivered sub-orders"
        />
        <StatCard
          label="Pending payouts"
          value={formatPrice(stats.pendingPayouts)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Total orders"
          value={sum(stats.orders)}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard label="Users" value={sum(stats.users)} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Stores" value={sum(stats.stores)} icon={<Store className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Users by role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.users).length === 0 ? (
              <p className="text-sm text-muted-foreground">No users.</p>
            ) : (
              Object.entries(stats.users).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-muted-foreground">{role.toLowerCase()}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stores by status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.stores).map(([s, count]) => (
              <div key={s} className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{s.toLowerCase()}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ORDER_ORDER.filter((s) => stats.orders[s]).map((s) => (
              <div key={s} className="flex items-center justify-between">
                <OrderStatusBadge status={s} />
                <span className="text-sm font-semibold">{stats.orders[s]}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatPrice(p.price)}</span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {p.soldCount} sold
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </>
  );
}
