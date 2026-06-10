'use client';

import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock } from '@/components/shared/states';
import { NoStorePrompt } from '@/components/shared/no-store';
import { ProductForm } from '@/components/products/product-form';
import { useMyStore } from '@/features/store/hooks';

export default function NewProductPage() {
  const { data: store, isLoading } = useMyStore();

  if (isLoading) return <LoadingBlock />;
  if (!store) {
    return (
      <>
        <PageHeader title="Add product" />
        <NoStorePrompt />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Add product"
        description="Create the listing first — you can add images right after."
      />
      <ProductForm />
    </>
  );
}
