'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Package, XCircle } from 'lucide-react';
import { fetchOrder, cancelOrder } from '@/features/orders/api';
import { StatusBadge, ORDER_FLOW } from './status-badge';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

const CANCELLABLE = ['PENDING', 'CONFIRMED'];

function Timeline({ status }: { status: string }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <XCircle className="h-5 w-5" /> This order was cancelled.
      </div>
    );
  }
  const current = ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number]);
  return (
    <div className="flex items-center">
      {ORDER_FLOW.map((step, i) => {
        const done = i <= current;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold',
                  done ? 'bg-brand text-brand-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {i + 1}
              </span>
              <span className={cn('mt-1 text-[10px]', done ? 'text-foreground' : 'text-muted-foreground')}>
                {step}
              </span>
            </div>
            {i < ORDER_FLOW.length - 1 && (
              <span className={cn('mx-1 h-0.5 flex-1', i < current ? 'bg-brand' : 'bg-muted')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const params = useSearchParams();
  const qc = useQueryClient();
  const justPlaced = params.get('placed') === '1';

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
  });

  const cancel = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: (e) => alert(getApiErrorMessage(e, 'Could not cancel the order')),
  });

  if (isLoading) {
    return <div className="container py-24 text-center text-sm text-muted-foreground">Loading order…</div>;
  }

  if (isError || !order) {
    return (
      <div className="container py-20 text-center">
        <p className="font-medium">Order not found</p>
        <Link href="/products" className="mt-2 inline-block text-sm text-brand hover:underline">
          Continue shopping →
        </Link>
      </div>
    );
  }

  const itemsSubtotal = order.subOrders.reduce((s, so) => s + so.subtotal, 0);
  const canCancel = CANCELLABLE.includes(order.status);

  return (
    <div className="container max-w-3xl py-8">
      {justPlaced && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-600/30 bg-green-50 p-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">Order placed successfully!</p>
            <p className="text-sm text-green-700">
              {order.paymentMethod === 'COD'
                ? 'Pay with cash when your order is delivered.'
                : 'We’ll confirm your payment shortly.'}
            </p>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {order.paymentMethod} · {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Tracking */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <Timeline status={order.status} />
        {canCancel && (
          <div className="mt-4 border-t border-border pt-4 text-right">
            <Button
              variant="outline"
              size="sm"
              disabled={cancel.isPending}
              onClick={() => {
                if (confirm('Cancel this order?')) cancel.mutate();
              }}
            >
              {cancel.isPending ? 'Cancelling…' : 'Cancel order'}
            </Button>
          </div>
        )}
      </div>

      {order.address && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm">
          <p className="mb-1 font-semibold">Delivery address</p>
          <p className="text-muted-foreground">
            {order.address.fullName} · {order.address.phone}
            <br />
            {order.address.addressLine}, {order.address.city}
            {order.address.district ? `, ${order.address.district}` : ''}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {order.subOrders.map((so) => (
          <div key={so.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Package className="h-4 w-4 text-muted-foreground" />
                {so.store?.name ?? 'Store'}
              </span>
              <StatusBadge status={so.status} />
            </div>
            <ul className="divide-y divide-border">
              {so.orderItems.map((it) => (
                <li key={it.id} className="flex items-center gap-3 p-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {it.imageUrl && <Image src={it.imageUrl} alt={it.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(it.price)} × {it.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-6 border-t border-border px-4 py-2 text-xs text-muted-foreground">
              <span>Items {formatPrice(so.subtotal)}</span>
              <span>Shipping {formatPrice(so.shippingFee)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items subtotal</span>
            <span>{formatPrice(itemsSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <span className="font-semibold">Total</span>
          <span className="font-display text-lg font-bold text-brand">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/account/orders" className="text-sm text-brand hover:underline">
          View all orders →
        </Link>
      </div>
    </div>
  );
}
