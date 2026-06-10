'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock } from '@/components/shared/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/shared/status-badge';
import { useOrder } from '@/features/orders/hooks';
import { formatPrice, formatDateTime } from '@/lib/utils';

export default function OrderDetailPage() {
  const id = String(useParams().id);
  const { data: order, isLoading, isError } = useOrder(id);

  if (isLoading) return <LoadingBlock />;
  if (isError || !order) return <ErrorBlock message="Order not found." />;

  return (
    <>
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>
      <PageHeader title={`Order #${order.id.slice(-8)}`} description={formatDateTime(order.createdAt)} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <OrderStatusBadge status={order.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Payment</p>
            <div className="mt-1 flex items-center gap-2">
              <PaymentStatusBadge status={order.paymentStatus} />
              <span className="text-xs text-muted-foreground">{order.paymentMethod ?? ''}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="mt-1 font-display text-lg font-bold">{formatPrice(order.totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Shipping</p>
            <p className="mt-1 font-display text-lg font-bold">{formatPrice(order.shippingFee)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {order.subOrders.map((sub) => (
            <Card key={sub.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{sub.store?.name ?? 'Store'}</CardTitle>
                <OrderStatusBadge status={sub.status} />
              </CardHeader>
              <CardContent className="space-y-3">
                {sub.orderItems.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {it.imageUrl && (
                        <Image src={it.imageUrl} alt={it.name} fill className="object-cover" sizes="48px" />
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
                <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Subtotal</p>
                    <p className="font-medium">{formatPrice(sub.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Commission</p>
                    <p className="font-medium">{formatPrice(sub.commissionFee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Seller earns</p>
                    <p className="font-medium">{formatPrice(sub.sellerEarning)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.user?.name ?? '—'}</p>
              <p className="text-muted-foreground">{order.user?.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {order.deliveryAddress ?? order.address?.addressLine ?? 'No address on file'}
            </CardContent>
          </Card>

          {order.payment && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span>{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span>{formatPrice(order.payment.amount)}</span>
                </div>
                {order.payment.gatewayRef && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Ref</span>
                    <span className="truncate font-mono text-xs">{order.payment.gatewayRef}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
