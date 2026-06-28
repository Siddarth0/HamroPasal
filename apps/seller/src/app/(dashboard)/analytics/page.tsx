'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Wallet, ShoppingBag, Receipt, Download, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { LoadingBlock, ErrorBlock } from '@/components/shared/states';
import { NoStorePrompt } from '@/components/shared/no-store';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyStore } from '@/features/store/hooks';
import { fetchSellerTimeseries, fetchSellerLowStock } from '@/features/analytics/api';
import { formatPrice, cn } from '@/lib/utils';
import type { SellerTimeseriesRange, SellerTimeseriesPoint } from 'shared-types';

// Recharts is client-only; load it without SSR to avoid hydration mismatch.
const SalesChart = dynamic(() => import('@/components/analytics/charts').then((m) => m.SalesChart), {
  ssr: false,
  loading: () => <div className="h-[280px] animate-pulse rounded-xl bg-muted" />,
});
const OrdersChart = dynamic(() => import('@/components/analytics/charts').then((m) => m.OrdersChart), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-xl bg-muted" />,
});

const RANGES: { value: SellerTimeseriesRange; label: string }[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
];

const LOW_STOCK_THRESHOLD = 5;

function downloadCsv(rows: SellerTimeseriesPoint[], range: string) {
  const header = 'date,orders,sales,earnings';
  const body = rows.map((r) => `${r.date},${r.orders},${r.sales},${r.earnings}`).join('\n');
  const blob = new Blob([`${header}\n${body}\n`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hamropasal-sales-${range}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const { data: store, isLoading: storeLoading } = useMyStore();
  const [range, setRange] = useState<SellerTimeseriesRange>('30d');

  const series = useQuery({
    queryKey: ['seller-timeseries', range],
    queryFn: () => fetchSellerTimeseries(range),
    enabled: !!store,
  });

  const lowStock = useQuery({
    queryKey: ['seller-low-stock', LOW_STOCK_THRESHOLD],
    queryFn: () => fetchSellerLowStock(LOW_STOCK_THRESHOLD),
    enabled: !!store,
  });

  const data = series.data ?? [];
  const totals = useMemo(() => {
    const sales = data.reduce((a, p) => a + p.sales, 0);
    const earnings = data.reduce((a, p) => a + p.earnings, 0);
    const orders = data.reduce((a, p) => a + p.orders, 0);
    return { sales, earnings, orders, aov: orders ? sales / orders : 0 };
  }, [data]);

  if (storeLoading) return <LoadingBlock />;
  if (!store) return <NoStorePrompt />;

  const monthly = range === '12m';

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Your store's sales performance over time.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-border bg-card p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  range === r.value
                    ? 'bg-brand text-brand-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => downloadCsv(data, range)}
            disabled={data.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Range totals */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sales" value={formatPrice(totals.sales)} icon={<TrendingUp className="h-5 w-5" />} hint="In selected range" />
        <StatCard label="Earnings" value={formatPrice(totals.earnings)} icon={<Wallet className="h-5 w-5" />} hint="From delivered orders" />
        <StatCard label="Orders" value={totals.orders} icon={<ShoppingBag className="h-5 w-5" />} hint="Sub-orders placed" />
        <StatCard label="Avg. order value" value={formatPrice(totals.aov)} icon={<Receipt className="h-5 w-5" />} hint="Sales ÷ orders" />
      </div>

      {series.isError && <ErrorBlock message="Could not load your sales trend." />}

      {/* Sales trend */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sales & earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {series.isLoading ? (
            <div className="h-[280px] animate-pulse rounded-xl bg-muted" />
          ) : totals.sales === 0 && totals.orders === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No sales in this range yet.
            </p>
          ) : (
            <SalesChart data={data} monthly={monthly} />
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Orders over time */}
        <Card>
          <CardHeader>
            <CardTitle>Orders over time</CardTitle>
          </CardHeader>
          <CardContent>
            {series.isLoading ? (
              <div className="h-[220px] animate-pulse rounded-xl bg-muted" />
            ) : totals.orders === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No orders in this range yet.</p>
            ) : (
              <OrdersChart data={data} monthly={monthly} />
            )}
          </CardContent>
        </Card>

        {/* Low-stock alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Low stock
            </CardTitle>
            <Link href="/products" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
              Manage <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {lowStock.isLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : (lowStock.data?.length ?? 0) === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                All products are well stocked. 🎉
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.data!.map((p) => (
                  <li key={p._id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm font-medium">{p.name}</span>
                      {p.hasVariants && (
                        <span className="text-xs text-muted-foreground">lowest variant stock</span>
                      )}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                        p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                      )}
                    >
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
