'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, Star } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useWishlistIds, useToggleWishlist } from '@/features/wishlist/hooks';

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

/** Normalized shape the card renders — mock and live API data both map to this. */
export interface CardProduct {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  rating?: number;
  sold?: string;
  image: string;
  href: string;
  soldPercent?: number; // flash-sale progress bar
}

export function ProductCard({ product, mode }: { product: CardProduct; mode: 'flash' | 'rating' }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const wishlistIds = useWishlistIds();
  const { toggle } = useToggleWishlist();

  // Mock/fallback cards don't have real product ids; fall back to local state for those.
  const isReal = OBJECT_ID.test(product.id);
  const [localLiked, setLocalLiked] = useState(false);
  const wishlisted = isReal ? wishlistIds.has(product.id) : localLiked;

  const onHeart = () => {
    if (!isReal) {
      setLocalLiked((v) => !v);
      return;
    }
    if (status !== 'authenticated') {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    toggle(product.id, wishlistIds.has(product.id));
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <Link href={product.href} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 240px, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <button
        onClick={onHeart}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white"
      >
        <Heart className={cn('h-4 w-4', wishlisted ? 'fill-brand text-brand' : 'text-muted-foreground')} />
      </button>

      <div className="space-y-1.5 p-3">
        <Link href={product.href}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug hover:text-brand">
            {product.name}
          </h3>
        </Link>

        {mode === 'rating' && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">{(product.rating ?? 0).toFixed(1)}</span>
            {product.sold && <span>• {product.sold} Sold</span>}
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-brand">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {mode === 'flash' && (
          <div className="pt-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${product.soldPercent ?? 0}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {Math.round((product.soldPercent ?? 0) / 10)}/10 Sale
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
