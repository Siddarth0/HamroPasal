import Link from 'next/link';
import { Store } from 'lucide-react';
import { EmptyState } from './states';
import { Button } from '@/components/ui/button';

/** Shown across the dashboard when the seller hasn't created a store yet. */
export function NoStorePrompt() {
  return (
    <EmptyState
      icon={<Store className="h-10 w-10" />}
      title="Set up your store first"
      description="You need an approved store before you can list products, take orders or get paid. It only takes a minute."
      action={
        <Button asChild variant="brand">
          <Link href="/store">Create your store</Link>
        </Button>
      }
    />
  );
}
