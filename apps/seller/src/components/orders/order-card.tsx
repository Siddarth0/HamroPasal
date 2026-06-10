'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import type { OrderStatus } from 'shared-types';
import { type SellerSubOrder, NEXT_STATUSES } from '@/features/orders/api';
import { useUpdateSubOrderStatus } from '@/features/orders/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/shared/status-badge';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export function OrderCard({ sub }: { sub: SellerSubOrder }) {
  const update = useUpdateSubOrderStatus();
  const options = NEXT_STATUSES[sub.status];
  const [next, setNext] = useState<OrderStatus | ''>('');
  const [error, setError] = useState<string | null>(null);

  const onUpdate = async () => {
    if (!next) return;
    setError(null);
    try {
      await update.mutateAsync({ id: sub.id, status: next });
      setNext('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update status'));
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">#{sub.id.slice(-8)}</p>
            <p className="mt-0.5 text-sm font-semibold">{sub.order.user?.name ?? 'Customer'}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(sub.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <OrderStatusBadge status={sub.status} />
            <PaymentStatusBadge status={sub.order.paymentStatus} />
          </div>
        </div>

        {sub.order.deliveryAddress && (
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            📍 {sub.order.deliveryAddress}
          </p>
        )}

        <div className="space-y-2">
          {sub.orderItems.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                {it.imageUrl && (
                  <Image src={it.imageUrl} alt={it.name} fill className="object-cover" sizes="40px" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm">{it.name}</p>
                <p className="text-xs text-muted-foreground">
                  {it.quantity} × {formatPrice(it.price)}
                </p>
              </div>
              <p className="text-sm font-medium">{formatPrice(it.price * it.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Subtotal</p>
            <p className="font-medium">{formatPrice(sub.subtotal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Shipping</p>
            <p className="font-medium">{formatPrice(sub.shippingFee)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Your earning</p>
            <p className="font-medium text-brand">{formatPrice(sub.sellerEarning)}</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {options.length > 0 ? (
          <div className="flex gap-2">
            <Select
              value={next}
              onChange={(e) => setNext(e.target.value as OrderStatus)}
              className="flex-1"
            >
              <option value="">Update status to…</option>
              {options.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
            <Button variant="brand" disabled={!next || update.isPending} onClick={onUpdate}>
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            This order is {sub.status.toLowerCase()} — no further action needed.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
