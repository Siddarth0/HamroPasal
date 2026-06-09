'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, Store, ShoppingCart } from 'lucide-react';
import type { CartLineItem } from 'shared-types';
import { useAuthStore } from '@/store/auth';
import { useCart, useCartMutations } from '@/features/cart/hooks';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';

const placeholder = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/200/200?grayscale`;

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="container py-24 text-center text-sm text-muted-foreground">{children}</div>;
}

export function CartContent() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const { data: cart, isLoading } = useCart();
  const { update, remove } = useCartMutations();
  const busy = update.isPending || remove.isPending;

  if (status === 'loading') return <Centered>Loading…</Centered>;

  if (status === 'unauthenticated') {
    return (
      <div className="container py-20 text-center">
        <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">Your cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to view items in your cart.</p>
        <Button asChild variant="brand" className="mt-5">
          <Link href="/login?returnUrl=/cart">Log in</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) return <Centered>Loading your cart…</Centered>;

  const stores = cart?.stores ?? [];

  if (stores.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse products and add something you like.</p>
        <Button asChild variant="brand" className="mt-5">
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  const setQty = (item: CartLineItem, quantity: number) =>
    update.mutate({ productId: item.productId, variantId: item.variantId, quantity });

  const removeItem = (item: CartLineItem) =>
    remove.mutate({ productId: item.productId, variantId: item.variantId });

  const subtotal = cart?.subtotal ?? 0;

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-bold">
        Shopping Cart{' '}
        <span className="text-base font-normal text-muted-foreground">
          ({cart?.totalQuantity ?? 0} items)
        </span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        {/* Store groups */}
        <div className="space-y-5">
          {stores.map((group) => (
            <div key={group.storeId} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold">
                <Store className="h-4 w-4 text-muted-foreground" />
                {group.storeName}
              </div>

              <ul className="divide-y divide-border">
                {group.items.map((item) => {
                  const key = `${item.productId}:${item.variantId ?? ''}`;
                  const dimmed = !item.available || !item.inStock;
                  return (
                    <li key={key} className="flex gap-4 p-4">
                      <div
                        className={cn(
                          'relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted',
                          dimmed && 'opacity-50',
                        )}
                      >
                        <Image
                          src={item.imageUrl || placeholder(item.productId)}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className={cn(dimmed && 'opacity-60')}>
                            <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                            {item.variantId && (
                              <p className="text-xs text-muted-foreground">Variant selected</p>
                            )}
                            <p className="mt-1 text-sm font-bold text-brand">{formatPrice(item.price)}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item)}
                            disabled={busy}
                            aria-label="Remove item"
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-brand disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          {!item.available ? (
                            <span className="text-xs font-medium text-brand">No longer available</span>
                          ) : !item.inStock ? (
                            <span className="text-xs font-medium text-brand">
                              Out of stock{item.maxStock > 0 ? ` (only ${item.maxStock} left)` : ''}
                            </span>
                          ) : (
                            <div className="flex items-center rounded-full border border-border">
                              <button
                                onClick={() => setQty(item, item.quantity - 1)}
                                disabled={busy || item.quantity <= 1}
                                className="grid h-8 w-8 place-items-center rounded-l-full hover:bg-muted disabled:opacity-40"
                                aria-label="Decrease"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-9 text-center text-sm font-medium tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => setQty(item, item.quantity + 1)}
                                disabled={busy || item.quantity >= item.maxStock}
                                className="grid h-8 w-8 place-items-center rounded-r-full hover:bg-muted disabled:opacity-40"
                                aria-label="Increase"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          <span className="text-sm font-semibold">{formatPrice(item.lineTotal)}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex justify-end gap-2 border-t border-border px-4 py-3 text-sm">
                <span className="text-muted-foreground">Store subtotal</span>
                <span className="font-semibold">{formatPrice(group.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-lg font-bold text-brand">{formatPrice(subtotal)}</span>
            </div>
            <Button
              variant="brand"
              size="lg"
              className="mt-5 w-full"
              disabled={subtotal <= 0}
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
            </Button>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
