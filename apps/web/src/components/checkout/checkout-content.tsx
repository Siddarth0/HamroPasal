'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Check, Truck } from 'lucide-react';
import type { Address } from 'shared-types';
import { useAuthStore } from '@/store/auth';
import { useCart } from '@/features/cart/hooks';
import { listAddresses } from '@/features/address/api';
import {
  getShippingQuotes,
  placeOrder,
  initiatePayment,
  type PaymentMethod,
} from '@/features/checkout/api';
import { AddressForm } from './address-form';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; note: string }[] = [
  { id: 'COD', label: 'Cash on Delivery', note: 'Pay with cash when your order arrives.' },
  { id: 'KHALTI', label: 'Khalti', note: 'Pay securely via Khalti wallet.' },
  { id: 'ESEWA', label: 'eSewa', note: 'Pay securely via eSewa.' },
  { id: 'STRIPE', label: 'Card', note: 'Pay by debit / credit card.' },
];

function submitEsewaForm(url: string, fields: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="container py-24 text-center text-sm text-muted-foreground">{children}</div>;
}

export function CheckoutContent() {
  const router = useRouter();
  const qc = useQueryClient();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const { data: cart, isLoading: cartLoading } = useCart();
  const storeIds = useMemo(() => cart?.stores.map((s) => s.storeId) ?? [], [cart]);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: listAddresses,
    enabled: status === 'authenticated',
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('COD');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to the saved default address (or the first one).
  useEffect(() => {
    if (selectedId || !addresses?.length) return;
    setSelectedId((addresses.find((a) => a.isDefault) ?? addresses[0]).id);
  }, [addresses, selectedId]);

  const selected = addresses?.find((a) => a.id === selectedId) ?? null;
  const canQuote =
    !!selected && selected.latitude != null && selected.longitude != null && storeIds.length > 0;

  const { data: quotes } = useQuery({
    queryKey: ['shipping', selectedId, storeIds],
    queryFn: () =>
      getShippingQuotes({
        latitude: selected!.latitude as number,
        longitude: selected!.longitude as number,
        storeIds,
      }),
    enabled: canQuote,
  });

  if (status === 'loading' || cartLoading) return <Centered>Loading…</Centered>;

  if (status === 'unauthenticated') {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">Please log in to place your order.</p>
        <Button asChild variant="brand" className="mt-5">
          <Link href="/login?returnUrl=/checkout">Log in</Link>
        </Button>
      </div>
    );
  }

  if (user && !user.isEmailVerified) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Verify your email to check out</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A verified email is required before placing an order.
        </p>
        <Button asChild variant="brand" className="mt-5">
          <Link href={`/verify-email?email=${encodeURIComponent(user.email)}`}>Verify email</Link>
        </Button>
      </div>
    );
  }

  if (!cart || cart.stores.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <Button asChild variant="brand" className="mt-5">
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  const shippingTotal = (quotes ?? [])
    .filter((q) => q.deliverable)
    .reduce((sum, q) => sum + (q.shippingFee ?? 0), 0);
  const undeliverable = (quotes ?? []).filter((q) => !q.deliverable);
  const itemsSubtotal = cart.subtotal;
  const total = itemsSubtotal + shippingTotal;

  const onAddressSaved = (a: Address) => {
    qc.invalidateQueries({ queryKey: ['addresses'] });
    setSelectedId(a.id);
    setShowForm(false);
  };

  const place = async () => {
    setError(null);
    if (!selectedId) {
      setError('Please select a delivery address');
      return;
    }
    setPlacing(true);
    try {
      const order = await placeOrder({ addressId: selectedId, paymentMethod: method });
      qc.invalidateQueries({ queryKey: ['cart'] });

      const result = await initiatePayment(order.id).catch(() => null);
      if (result?.method === 'KHALTI') {
        window.location.href = result.paymentUrl;
        return;
      }
      if (result?.method === 'ESEWA') {
        submitEsewaForm(result.url, result.fields);
        return;
      }
      // COD (confirmed) / Stripe (needs Elements) / gateway not configured → show the order.
      router.push(`/orders/${order.id}?placed=1`);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not place your order'));
      setPlacing(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-bold">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <div className="space-y-6">
          {/* Address */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <MapPin className="h-5 w-5 text-brand" /> Delivery Address
              </h2>
              {!showForm && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" /> New address
                </Button>
              )}
            </div>

            {showForm ? (
              <AddressForm onSaved={onAddressSaved} onCancel={addresses?.length ? () => setShowForm(false) : undefined} />
            ) : addresses && addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                      selectedId === a.id ? 'border-brand bg-brand/5' : 'border-border hover:bg-muted',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border',
                        selectedId === a.id ? 'border-brand bg-brand text-brand-foreground' : 'border-border',
                      )}
                    >
                      {selectedId === a.id && <Check className="h-3 w-3" />}
                    </span>
                    <span className="text-sm">
                      <span className="font-medium">
                        {a.fullName} · {a.phone}
                      </span>
                      {a.label && (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {a.label}
                        </span>
                      )}
                      <span className="block text-muted-foreground">
                        {a.addressLine}, {a.city}
                        {a.district ? `, ${a.district}` : ''}
                        {a.latitude == null && (
                          <span className="ml-1 text-brand">(no map location — add one for shipping)</span>
                        )}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <AddressForm onSaved={onAddressSaved} />
            )}
          </section>

          {/* Shipping preview */}
          {selected && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
                <Truck className="h-5 w-5 text-brand" /> Shipping
              </h2>
              {!canQuote ? (
                <p className="text-sm text-muted-foreground">
                  This address has no map location. Add a pinned address to calculate shipping.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {cart.stores.map((s) => {
                    const q = quotes?.find((x) => x.storeId === s.storeId);
                    return (
                      <li key={s.storeId} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{s.storeName}</span>
                        {!q ? (
                          <span className="text-muted-foreground">…</span>
                        ) : q.deliverable ? (
                          <span className="font-medium">
                            {formatPrice(q.shippingFee ?? 0)}
                            {q.zoneName ? ` · ${q.zoneName}` : ''}
                          </span>
                        ) : (
                          <span className="text-brand">Not deliverable here</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {undeliverable.length > 0 && (
                <p className="mt-2 text-xs text-brand">
                  Some stores can’t deliver to this location. Try another address.
                </p>
              )}
            </section>
          )}

          {/* Payment */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 font-display text-lg font-bold">Payment Method</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-colors',
                    method === m.id ? 'border-brand bg-brand/5' : 'border-border hover:bg-muted',
                  )}
                >
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.note}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items ({cart.totalQuantity})</span>
                <span className="font-medium">{formatPrice(itemsSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {canQuote ? formatPrice(shippingTotal) : 'Select address'}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-lg font-bold text-brand">{formatPrice(total)}</span>
            </div>

            {error && <p className="mt-3 text-sm text-brand">{error}</p>}

            <Button
              variant="brand"
              size="lg"
              className="mt-5 w-full"
              disabled={placing || !selectedId || undeliverable.length > 0}
              onClick={place}
            >
              {placing ? 'Placing order…' : 'Place Order'}
            </Button>
            <Link
              href="/cart"
              className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Back to cart
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
