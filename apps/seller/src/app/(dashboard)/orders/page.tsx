'use client';

import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { NoStorePrompt } from '@/components/shared/no-store';
import { Pagination } from '@/components/shared/pagination';
import { OrderCard } from '@/components/orders/order-card';
import { useMyStore } from '@/features/store/hooks';
import { useSellerSubOrders } from '@/features/orders/hooks';

export default function OrdersPage() {
  const { data: store, isLoading: storeLoading } = useMyStore();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useSellerSubOrders({ page });

  if (storeLoading) return <LoadingBlock />;
  if (!store) {
    return (
      <>
        <PageHeader title="Orders" />
        <NoStorePrompt />
      </>
    );
  }

  const orders = data?.items ?? [];

  return (
    <>
      <PageHeader title="Orders" description="Fulfill and track your customer orders" />

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load orders." />}

      {data && orders.length === 0 && (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="No orders yet"
          description="When customers buy from your store, their orders will appear here."
        />
      )}

      {orders.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((sub) => (
            <OrderCard key={sub.id} sub={sub} />
          ))}
        </div>
      )}

      <Pagination meta={data?.meta} page={page} onPageChange={setPage} />
    </>
  );
}
