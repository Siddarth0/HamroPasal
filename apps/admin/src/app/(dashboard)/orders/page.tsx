'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import type { OrderStatus, PaymentStatus } from 'shared-types';
import { ORDER_STATUSES, PAYMENT_STATUSES } from 'shared-types';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { Pagination } from '@/components/shared/pagination';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/shared/status-badge';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { useOrders } from '@/features/orders/hooks';
import { formatPrice, formatDate } from '@/lib/utils';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');

  const { data, isLoading, isError } = useOrders({
    page,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
  });
  const orders = data?.items ?? [];

  return (
    <>
      <PageHeader title="Orders" description="All marketplace orders" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as OrderStatus | '');
          }}
          className="w-44"
        >
          <option value="">Any status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <Select
          value={paymentStatus}
          onChange={(e) => {
            setPage(1);
            setPaymentStatus(e.target.value as PaymentStatus | '');
          }}
          className="w-44"
        >
          <option value="">Any payment</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load orders." />}

      {data && orders.length === 0 && (
        <EmptyState icon={<ClipboardList className="h-10 w-10" />} title="No orders match your filters" />
      )}

      {orders.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="cursor-pointer hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${o.id}`} className="font-mono text-xs text-brand hover:underline">
                        #{o.id.slice(-8)}
                      </Link>
                      <p className="text-xs text-muted-foreground">{o.subOrders.length} store(s)</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{o.user?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Pagination meta={data?.meta} page={page} onPageChange={setPage} />
    </>
  );
}
