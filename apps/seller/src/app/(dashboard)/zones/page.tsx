'use client';

import { useState } from 'react';
import { Truck, Plus, Trash2, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { NoStorePrompt } from '@/components/shared/no-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMyStore } from '@/features/store/hooks';
import { useMyZones, useZoneMutations } from '@/features/store/hooks';
import { formatPrice } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

export default function ZonesPage() {
  const { data: store, isLoading: storeLoading } = useMyStore();
  const { data: zones, isLoading, isError } = useMyZones();
  const { create, update, remove } = useZoneMutations();

  const [name, setName] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [shippingFee, setShippingFee] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (storeLoading) return <LoadingBlock />;
  if (!store) {
    return (
      <>
        <PageHeader title="Delivery zones" />
        <NoStorePrompt />
      </>
    );
  }

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const dist = Number(distanceKm);
    const fee = Number(shippingFee);
    if (!name.trim() || !(dist > 0) || fee < 0) {
      setError('Enter a name, a distance greater than 0, and a non-negative fee.');
      return;
    }
    try {
      await create.mutateAsync({ name: name.trim(), distanceKm: dist, shippingFee: fee });
      setName('');
      setDistanceKm('');
      setShippingFee('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not add zone'));
    }
  };

  return (
    <>
      <PageHeader
        title="Delivery zones"
        description="Set a flat shipping fee for each delivery radius. Orders pick the tightest zone that covers the customer."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Add a zone</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAdd} className="space-y-4">
              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
              )}
              <div>
                <Label htmlFor="zname">Zone name</Label>
                <Input
                  id="zname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Inside Ring Road"
                />
              </div>
              <div>
                <Label htmlFor="zdist">Max distance (km)</Label>
                <Input
                  id="zdist"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="5"
                />
              </div>
              <div>
                <Label htmlFor="zfee">Shipping fee (Rs.)</Label>
                <Input
                  id="zfee"
                  type="number"
                  min="0"
                  step="1"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  placeholder="100"
                />
              </div>
              <Button type="submit" variant="brand" className="w-full" disabled={create.isPending}>
                {create.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add zone
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          {isLoading && <LoadingBlock />}
          {isError && <ErrorBlock message="Could not load zones." />}
          {zones && zones.length === 0 && (
            <EmptyState
              icon={<Truck className="h-10 w-10" />}
              title="No delivery zones yet"
              description="Add at least one zone so customers within range can check out."
            />
          )}
          {zones && zones.length > 0 && (
            <div className="space-y-3">
              {zones
                .slice()
                .sort((a, b) => a.distanceKm - b.distanceKm)
                .map((z) => (
                  <Card key={z.id}>
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{z.name}</p>
                          <Badge variant={z.isActive ? 'success' : 'muted'}>
                            {z.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Up to {z.distanceKm} km · {formatPrice(z.shippingFee)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={update.isPending}
                          onClick={() =>
                            update.mutate({ id: z.id, input: { isActive: !z.isActive } })
                          }
                        >
                          {z.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={remove.isPending}
                          onClick={() => {
                            if (confirm(`Delete zone "${z.name}"?`)) remove.mutate(z.id);
                          }}
                          aria-label="Delete zone"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
