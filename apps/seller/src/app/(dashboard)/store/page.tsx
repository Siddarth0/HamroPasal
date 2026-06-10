'use client';

import Link from 'next/link';
import { Truck } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock } from '@/components/shared/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StoreForm } from '@/components/store/store-form';
import { StoreImageUpload } from '@/components/store/image-upload';
import { useMyStore } from '@/features/store/hooks';

const STATUS_VARIANT = { ACTIVE: 'success', PENDING: 'warning', SUSPENDED: 'danger' } as const;

export default function StorePage() {
  const { data: store, isLoading, isError } = useMyStore();

  if (isLoading) return <LoadingBlock />;
  if (isError) return <ErrorBlock message="Could not load your store." />;

  // No store yet → onboarding form.
  if (!store) {
    return (
      <>
        <PageHeader
          title="Create your store"
          description="Set up your storefront. Once submitted, an admin will review and activate it."
        />
        <Card>
          <CardContent>
            <StoreForm />
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Store profile"
        description="Manage how your store appears to shoppers"
        action={
          <Link
            href="/zones"
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <Truck className="h-4 w-4" /> Delivery zones
          </Link>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Branding</CardTitle>
            <Badge variant={STATUS_VARIANT[store.status]}>{store.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-1.5 text-sm font-medium">Cover image</p>
              <StoreImageUpload kind="cover" current={store.coverUrl} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">Logo</p>
              <StoreImageUpload kind="logo" current={store.logoUrl} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <StoreForm store={store} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
