'use client';

import { useState } from 'react';
import { Ticket, Plus, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { Pagination } from '@/components/shared/pagination';
import { CouponForm } from '@/components/coupons/coupon-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCoupons, useCouponMutations } from '@/features/coupons/hooks';
import { formatPrice, formatDate } from '@/lib/utils';

export default function CouponsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCoupons({ page });
  const { update } = useCouponMutations();
  const [showForm, setShowForm] = useState(false);

  const coupons = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Platform-wide and store-scoped discount codes"
        action={
          <Button variant={showForm ? 'outline' : 'brand'} onClick={() => setShowForm((s) => !s)}>
            {showForm ? (
              <>
                <X className="h-4 w-4" /> Close
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> New coupon
              </>
            )}
          </Button>
        }
      />

      {showForm && (
        <div className="mb-6">
          <CouponForm oncreated={() => setShowForm(false)} />
        </div>
      )}

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load coupons." />}

      {data && coupons.length === 0 && !showForm && (
        <EmptyState
          icon={<Ticket className="h-10 w-10" />}
          title="No coupons yet"
          description="Create a platform-wide or store-scoped discount code."
          action={
            <Button variant="brand" onClick={() => setShowForm(true)}>
              Create coupon
            </Button>
          }
        />
      )}

      {coupons.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {coupons.map((c) => {
            const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
            return (
              <Card key={c.id}>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-lg font-bold tracking-wide">{c.code}</p>
                      {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={c.isActive && !expired ? 'success' : 'muted'}>
                        {expired ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant={c.storeId ? 'info' : 'brand'}>
                        {c.storeId ? 'Store' : 'Platform'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span>
                      <span className="text-muted-foreground">Discount: </span>
                      <span className="font-semibold text-brand">
                        {c.discountType === 'PERCENTAGE'
                          ? `${c.discountValue}%${c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ''}`
                          : formatPrice(c.discountValue)}
                      </span>
                    </span>
                    {c.minOrderAmount > 0 && (
                      <span className="text-muted-foreground">Min {formatPrice(c.minOrderAmount)}</span>
                    )}
                    <span className="text-muted-foreground">
                      Used {c.usedCount}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                    </span>
                    {c.expiresAt && (
                      <span className="text-muted-foreground">Expires {formatDate(c.expiresAt)}</span>
                    )}
                  </div>

                  <div className="flex justify-end border-t border-border pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={update.isPending}
                      onClick={() => update.mutate({ id: c.id, input: { isActive: !c.isActive } })}
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination meta={data?.meta} page={page} onPageChange={setPage} />
    </>
  );
}
