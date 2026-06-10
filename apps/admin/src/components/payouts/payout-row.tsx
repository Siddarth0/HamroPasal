'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { PayoutStatus } from 'shared-types';
import { PAYOUT_STATUSES } from 'shared-types';
import type { AdminPayout } from '@/features/payouts/api';
import { usePayoutActions } from '@/features/payouts/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PayoutStatusBadge } from '@/components/shared/status-badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

export function PayoutRow({ payout }: { payout: AdminPayout }) {
  const { update } = usePayoutActions();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<PayoutStatus>(payout.status);
  const [method, setMethod] = useState(payout.method ?? '');
  const [reference, setReference] = useState(payout.reference ?? '');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    try {
      await update.mutateAsync({
        id: payout.id,
        input: { status, method: method.trim() || undefined, reference: reference.trim() || undefined },
      });
      setOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Update failed'));
    }
  };

  return (
    <>
      <tr className="hover:bg-muted/30">
        <td className="px-4 py-3">
          <p className="font-medium">{payout.store?.name ?? '—'}</p>
          <p className="font-mono text-xs text-muted-foreground">#{payout.id.slice(-8)}</p>
        </td>
        <td className="px-4 py-3 whitespace-nowrap font-medium">{formatPrice(payout.amount)}</td>
        <td className="px-4 py-3">
          <PayoutStatusBadge status={payout.status} />
        </td>
        <td className="px-4 py-3">{payout.method ?? '—'}</td>
        <td className="px-4 py-3">{payout.reference ?? '—'}</td>
        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
          {payout.processedAt ? formatDate(payout.processedAt) : formatDate(payout.createdAt)}
        </td>
        <td className="px-4 py-3 text-right">
          <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
            {open ? 'Cancel' : 'Update'}
          </Button>
        </td>
      </tr>
      {open && (
        <tr className="bg-muted/20">
          <td colSpan={7} className="px-4 py-3">
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Status</label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PayoutStatus)}
                  className="h-9 w-40"
                >
                  {PAYOUT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Method</label>
                <Input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Bank transfer" className="h-9 w-40" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Reference</label>
                <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="TXN-..." className="h-9 w-48" />
              </div>
              <Button variant="brand" size="sm" disabled={update.isPending} onClick={save}>
                {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
              {error && <p className="w-full text-xs text-red-600">{error}</p>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
