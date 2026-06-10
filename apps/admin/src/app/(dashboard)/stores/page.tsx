'use client';

import { useState } from 'react';
import { Store as StoreIcon, Check, Ban, Loader2 } from 'lucide-react';
import type { StoreStatus, Store } from 'shared-types';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { Pagination } from '@/components/shared/pagination';
import { StoreStatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStores, useUpdateStore } from '@/features/stores/hooks';
import { formatDate, cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

const FILTERS: { key: StoreStatus | 'ALL'; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'SUSPENDED', label: 'Suspended' },
  { key: 'ALL', label: 'All' },
];

function StoreCard({ store }: { store: Store }) {
  const update = useUpdateStore();
  const [commission, setCommission] = useState(String(store.commissionRate));
  const [error, setError] = useState<string | null>(null);

  const run = async (input: { status?: StoreStatus; commissionRate?: number }) => {
    setError(null);
    try {
      await update.mutateAsync({ id: store.id, input });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Update failed'));
    }
  };

  const commissionChanged = Number(commission) !== store.commissionRate;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{store.name}</p>
            <p className="text-xs text-muted-foreground">/{store.slug}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {store.city ?? 'No city'} · joined {formatDate(store.createdAt)}
            </p>
          </div>
          <StoreStatusBadge status={store.status} />
        </div>

        <div className="flex items-end gap-2">
          <div className="w-32">
            <label className="mb-1 block text-xs text-muted-foreground">Commission %</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="h-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!commissionChanged || update.isPending}
            onClick={() => run({ commissionRate: Number(commission) })}
          >
            Save rate
          </Button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2 border-t border-border pt-3">
          {store.status !== 'ACTIVE' && (
            <Button
              variant="brand"
              size="sm"
              disabled={update.isPending}
              onClick={() => run({ status: 'ACTIVE' })}
            >
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {store.status === 'PENDING' ? 'Approve' : 'Reactivate'}
            </Button>
          )}
          {store.status !== 'SUSPENDED' && (
            <Button
              variant="outline"
              size="sm"
              disabled={update.isPending}
              onClick={() => run({ status: 'SUSPENDED' })}
            >
              <Ban className="h-4 w-4" /> Suspend
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StoresPage() {
  const [filter, setFilter] = useState<StoreStatus | 'ALL'>('PENDING');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useStores({
    page,
    status: filter === 'ALL' ? undefined : filter,
  });

  const stores = data?.items ?? [];

  return (
    <>
      <PageHeader title="Stores" description="Approve, suspend and set commission for seller stores" />

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              filter === f.key ? 'bg-brand text-brand-foreground' : 'bg-muted hover:bg-muted/70',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load stores." />}

      {data && stores.length === 0 && (
        <EmptyState icon={<StoreIcon className="h-10 w-10" />} title="No stores in this view" />
      )}

      {stores.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {stores.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      )}

      <Pagination meta={data?.meta} page={page} onPageChange={setPage} />
    </>
  );
}
