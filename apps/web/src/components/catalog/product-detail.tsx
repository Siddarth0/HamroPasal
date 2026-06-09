'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Minus, Plus, ShoppingCart, Store, Check } from 'lucide-react';
import { useProduct } from '@/features/catalog/hooks';
import type { ApiVariant } from '@/features/catalog/api';
import { addToCart } from '@/features/cart/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { ProductTabs } from './product-tabs';
import { cn, formatPrice } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

const placeholder = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/600?grayscale`;

export function ProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const { data: product, isLoading, isError } = useProduct(slug);

  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState<ApiVariant | null>(null);
  const [qty, setQty] = useState(1);
  const [addState, setAddState] = useState<'idle' | 'adding' | 'added' | 'error'>('idle');
  const [addMsg, setAddMsg] = useState<string | null>(null);

  const images = useMemo(() => {
    const urls = product?.images?.map((i) => i.url) ?? [];
    return urls.length ? urls : [placeholder(slug)];
  }, [product, slug]);

  if (isLoading) {
    return (
      <div className="container grid gap-8 py-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-7 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-10 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container py-20 text-center">
        <p className="font-medium">Product not found</p>
        <Link href="/products" className="mt-2 inline-block text-sm text-brand hover:underline">
          Browse all products →
        </Link>
      </div>
    );
  }

  const price = variant?.price ?? product.price;
  const comparePrice = variant?.comparePrice ?? product.comparePrice;
  const stock = variant ? variant.stock : product.stock;
  const inStock = stock > 0;
  const discount = comparePrice && comparePrice > price ? Math.round((1 - price / comparePrice) * 100) : 0;
  const category = typeof product.categoryId === 'object' ? product.categoryId : null;

  const onAdd = async () => {
    if (status !== 'authenticated') {
      router.push(`/login?returnUrl=${encodeURIComponent(`/product/${slug}`)}`);
      return;
    }
    setAddState('adding');
    setAddMsg(null);
    try {
      await addToCart({ productId: product._id, variantId: variant?._id, quantity: qty });
      setAddState('added');
      setTimeout(() => setAddState('idle'), 2500);
    } catch (e) {
      setAddState('error');
      setAddMsg(getApiErrorMessage(e, 'Could not add to cart'));
    }
  };

  return (
    <div className="container py-6">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{' '}
        /{' '}
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {category && (
          <>
            {' '}
            /{' '}
            <Link href={`/category/${category.slug}`} className="hover:text-foreground">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
            <Image src={images[activeImage]} alt={product.name} fill className="object-cover" priority />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'relative h-16 w-16 overflow-hidden rounded-lg border-2',
                    i === activeImage ? 'border-brand' : 'border-border',
                  )}
                >
                  <Image src={src} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="font-display text-2xl font-bold leading-snug md:text-3xl">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{(product.avgRating ?? 0).toFixed(1)}</span>
            </span>
            <span>· {product.reviewCount ?? 0} reviews</span>
            <span>· {product.soldCount ?? 0} sold</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-3xl font-bold text-brand">{formatPrice(price)}</span>
            {comparePrice && comparePrice > price && (
              <span className="pb-1 text-sm text-muted-foreground line-through">{formatPrice(comparePrice)}</span>
            )}
            {discount > 0 && (
              <span className="mb-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                -{discount}%
              </span>
            )}
          </div>

          <p className={cn('mt-2 text-sm', inStock ? 'text-green-600' : 'text-brand')}>
            {inStock ? `In stock (${stock} available)` : 'Out of stock'}
          </p>

          {product.variants.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">Options</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => setVariant((cur) => (cur?._id === v._id ? null : v))}
                    disabled={v.stock <= 0}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-40',
                      variant?._id === v._id
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-10 w-10 place-items-center rounded-l-full hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium tabular-nums">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(stock || 99, q + 1))}
                className="grid h-10 w-10 place-items-center rounded-r-full hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="brand"
              size="lg"
              onClick={onAdd}
              disabled={!inStock || addState === 'adding'}
              className="gap-2"
            >
              {addState === 'added' ? (
                <>
                  <Check className="h-4 w-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {addState === 'adding' ? 'Adding…' : 'Add to cart'}
                </>
              )}
            </Button>
          </div>

          {addState === 'error' && addMsg && <p className="mt-2 text-sm text-brand">{addMsg}</p>}
          {status !== 'authenticated' && (
            <p className="mt-2 text-xs text-muted-foreground">You’ll need to log in to add items to your cart.</p>
          )}

          <div className="mt-6 flex items-center gap-2 border-t border-border pt-5 text-sm text-muted-foreground">
            <Store className="h-4 w-4" />
            Sold by a HamroPasal seller
          </div>
        </div>
      </div>

      {/* Description / Reviews / Q&A */}
      <ProductTabs
        productId={product._id}
        description={product.description}
        tags={product.tags ?? []}
        avgRating={product.avgRating ?? 0}
        reviewCount={product.reviewCount ?? 0}
      />
    </div>
  );
}
