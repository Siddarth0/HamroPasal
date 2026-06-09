'use client';

import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { fetchLoyaltyBalance, fetchLoyaltyTransactions } from '@/features/loyalty/api';
import { cn } from '@/lib/utils';

export default function LoyaltyPage() {
  const { data: bal } = useQuery({ queryKey: ['loyalty'], queryFn: fetchLoyaltyBalance });
  const { data: txnData, isLoading } = useQuery({
    queryKey: ['loyalty-txns'],
    queryFn: () => fetchLoyaltyTransactions(),
  });
  const txns = txnData?.items ?? [];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Loyalty Points</h1>

      <div className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-brand/10 to-card p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-brand-foreground">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-3xl font-bold">{bal?.points ?? 0}</p>
            <p className="text-sm text-muted-foreground">points available</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Earn points on every order and redeem them for discounts at checkout.
        </p>
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">History</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : txns.length === 0 ? (
        <p className="text-sm text-muted-foreground">No points activity yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {txns.map((t) => (
            <li key={t.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{t.description || t.type}</p>
                <p className="text-xs text-muted-foreground">
                  {t.type} · {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={cn('font-semibold', t.points >= 0 ? 'text-green-600' : 'text-brand')}>
                {t.points >= 0 ? '+' : ''}
                {t.points}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
