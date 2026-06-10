'use client';

import { useState } from 'react';
import { Wallet, Loader2, RefreshCw } from 'lucide-react';
import type { PayoutStatus } from 'shared-types';
import { PAYOUT_STATUSES } from 'shared-types';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { Pagination } from '@/components/shared/pagination';
import { PayoutRow } from '@/components/payouts/payout-row';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { usePayouts, usePayoutActions } from '@/features/payouts/hooks';

export default function PayoutsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PayoutStatus | ''>('');
  const { data, isLoading, isError } = usePayouts({ page, status: status || undefined });
  const { generate } = usePayoutActions();
  const [note, setNote] = useState<string | null>(null);

  const payouts = data?.items ?? [];

  const onGenerate = async () => {
    setNote(null);
    const res = await generate.mutateAsync();
    setNote(`${res.created} new payout(s) generated.`);
  };

  return (
    <>
      <PageHeader
        title="Payouts"
        description="Generate and disburse seller earnings for delivered orders"
        action={
          <Button variant="brand" onClick={onGenerate} disabled={generate.isPending}>
            {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Generate payouts
          </Button>
        }
      />

      {note && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{note}</p>
      )}

      <div className="mb-4 flex justify-end">
        <Select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as PayoutStatus | '');
          }}
          className="w-48"
        >
          <option value="">All statuses</option>
          {PAYOUT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load payouts." />}

      {data && payouts.length === 0 && (
        <EmptyState
          icon={<Wallet className="h-10 w-10" />}
          title="No payouts"
          description="Generate payouts to create pending disbursements for delivered orders."
        />
      )}

      {payouts.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Store</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.map((p) => (
                  <PayoutRow key={p.id} payout={p} />
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
