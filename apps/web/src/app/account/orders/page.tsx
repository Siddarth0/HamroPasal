'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { fetchMyOrders } from '@/features/orders/api';
import { StatusBadge } from '@/components/orders/status-badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => fetchMyOrders(page),
  });

  const orders = data?.items ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">My Orders</h1>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No orders yet</p>
          <Button asChild variant="brand" className="mt-4">
            <Link href="/products">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const items = o.subOrders.flatMap((s) => s.orderItems);
            const totalQty = items.reduce((n, it) => n + it.quantity, 0);
            const preview = items.slice(0, 4);
            const summary =
              items.length === 0
                ? 'Order details'
                : items.length === 1
                  ? items[0].name
                  : `${items[0].name} + ${items.length - 1} more item${items.length - 1 !== 1 ? 's' : ''}`;

            return (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="block rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium">Order #{o.id.slice(0, 8)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="shrink-0 font-display font-bold text-brand">{formatPrice(o.totalAmount)}</p>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex shrink-0 -space-x-2">
                    {preview.map((it) => (
                      <span
                        key={it.id}
                        className="relative h-11 w-11 overflow-hidden rounded-lg border-2 border-card bg-muted"
                      >
                        {it.imageUrl ? (
                          <Image src={it.imageUrl} alt={it.name} fill className="object-cover" sizes="44px" />
                        ) : (
                          <Package className="absolute inset-0 m-auto h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{summary}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {totalQty} item{totalQty !== 1 ? 's' : ''} · {new Date(o.createdAt).toLocaleDateString()} ·{' '}
                      {o.paymentMethod}
                    </p>
                  </div>
                  <span className="shrink-0 self-center text-xs text-muted-foreground">View →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
