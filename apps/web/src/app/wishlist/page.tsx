'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useWishlist } from '@/features/wishlist/hooks';
import type { WishlistProduct } from '@/features/wishlist/api';
import { ProductCard, type CardProduct } from '@/components/home/product-card';
import { Button } from '@/components/ui/button';

const placeholder = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400?grayscale`;

const toCard = (p: WishlistProduct): CardProduct => ({
  id: p._id,
  name: p.name,
  price: p.price,
  comparePrice: p.comparePrice,
  rating: p.avgRating || undefined,
  image: p.images?.[0]?.url ?? placeholder(p.slug),
  href: `/product/${p.slug}`,
});

export default function WishlistPage() {
  const status = useAuthStore((s) => s.status);
  const { data, isLoading } = useWishlist();

  if (status === 'loading') {
    return <div className="container py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container py-20 text-center">
        <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">Your wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to save products you love.</p>
        <Button asChild variant="brand" className="mt-5">
          <Link href="/login?returnUrl=/wishlist">Log in</Link>
        </Button>
      </div>
    );
  }

  const products = data ?? [];

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-bold">My Wishlist</h1>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your wishlist…</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the heart on any product to save it here.
          </p>
          <Button asChild variant="brand" className="mt-4">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={toCard(p)} mode="rating" />
          ))}
        </div>
      )}
    </div>
  );
}
