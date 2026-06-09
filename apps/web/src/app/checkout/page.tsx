import Link from 'next/link';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  return (
    <div className="container py-20 text-center">
      <Truck className="mx-auto h-10 w-10 text-muted-foreground" />
      <h1 className="mt-4 font-display text-2xl font-bold">Checkout is coming soon</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Map-based delivery, shipping and payment are next on the roadmap.
      </p>
      <Button asChild variant="outline" className="mt-5">
        <Link href="/cart">Back to cart</Link>
      </Button>
    </div>
  );
}
