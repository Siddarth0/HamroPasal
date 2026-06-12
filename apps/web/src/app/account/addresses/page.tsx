'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Star, MapPin } from 'lucide-react';
import { listAddresses, setDefaultAddress, deleteAddress } from '@/features/address/api';
import { AddressForm } from '@/components/checkout/address-form';
import { Button } from '@/components/ui/button';

export default function AddressesPage() {
  const qc = useQueryClient();
  const { data: addresses, isLoading } = useQuery({ queryKey: ['addresses'], queryFn: listAddresses });
  const [showForm, setShowForm] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['addresses'] });
  const makeDefault = useMutation({ mutationFn: setDefaultAddress, onSuccess: invalidate });
  const del = useMutation({ mutationFn: deleteAddress, onSuccess: invalidate });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Addresses</h1>
        {!showForm && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add address
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <AddressForm
            onSaved={() => {
              invalidate();
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading addresses…</p>
      ) : !addresses || addresses.length === 0 ? (
        !showForm && <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 text-sm">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium">
                      {a.fullName} · {a.phone}
                    </span>
                    {a.label && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {a.label}
                      </span>
                    )}
                    {a.isDefault && (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {a.addressLine}, {a.city}
                    {a.district ? `, ${a.district}` : ''}
                  </p>
                  {a.latitude != null && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Pinned location saved
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!a.isDefault && (
                    <button
                      onClick={() => makeDefault.mutate(a.id)}
                      disabled={makeDefault.isPending}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Star className="h-3.5 w-3.5" /> Set default
                    </button>
                  )}
                  <button
                    onClick={() => del.mutate(a.id)}
                    disabled={del.isPending}
                    aria-label="Delete address"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-brand"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
