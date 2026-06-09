'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { img, type MockProduct } from '@/lib/mock';

export function ProductCard({ product, mode }: { product: MockProduct; mode: 'flash' | 'rating' }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={img(product.seed)}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 240px, 45vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={() => setLiked((v) => !v)}
          aria-label="Add to wishlist"
          className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          <Heart className={cn('h-4 w-4', liked ? 'fill-brand text-brand' : 'text-muted-foreground')} />
        </button>
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">{product.name}</h3>

        {mode === 'rating' && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">{product.rating}</span>
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
              <div className="h-full rounded-full bg-foreground" style={{ width: `${product.soldPercent ?? 0}%` }} />
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
