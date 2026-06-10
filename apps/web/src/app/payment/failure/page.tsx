'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function FailureCard() {
  const orderId = useSearchParams().get('orderId');

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-100">
          <XCircle className="h-9 w-9 text-red-600" />
        </div>
        <h1 className="font-display text-2xl font-bold">Payment not completed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your payment was cancelled or could not be verified, so your order hasn&apos;t been paid.
          You can try paying again from your order, or pick a different method.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {orderId ? (
            <Button asChild variant="brand">
              <Link href={`/orders/${orderId}`}>View your order</Link>
            </Button>
          ) : (
            <Button asChild variant="brand">
              <Link href="/cart">Back to cart</Link>
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

export default function PaymentFailurePage() {
  return (
    <Suspense>
      <FailureCard />
    </Suspense>
  );
}
