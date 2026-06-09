import { Suspense } from 'react';
import { OrderDetail } from '@/components/orders/order-detail';

export default function OrderPage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <OrderDetail id={params.id} />
    </Suspense>
  );
}
