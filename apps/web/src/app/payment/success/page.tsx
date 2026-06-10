'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SuccessCard() {
  const orderId = useSearchParams().get('orderId');

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h1 className="font-display text-2xl font-bold">Payment successful</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you! Your payment has been received and your order is confirmed. A confirmation email
          is on its way.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {orderId ? (
            <Button asChild variant="brand">
              <Link href={`/orders/${orderId}`}>View your order</Link>
            </Button>
          ) : (
            <Button asChild variant="brand">
              <Link href="/account/orders">View your orders</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessCard />
    </Suspense>
  );
}
