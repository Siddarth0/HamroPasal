'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { fetchProductReviews, createReview } from '@/features/reviews/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stars } from './stars';
import { getApiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

export function ProductReviews({
  productId,
  avgRating,
  reviewCount,
}: {
  productId: string;
  avgRating: number;
  reviewCount: number;
}) {
  const qc = useQueryClient();
  const status = useAuthStore((s) => s.status);
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchProductReviews(productId),
  });
  const reviews = data?.items ?? [];

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => createReview({ productId, rating, title: title || undefined, comment }),
    onSuccess: () => {
      setSuccess(true);
      setComment('');
      setTitle('');
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
    },
    onError: (e) => setError(getApiErrorMessage(e, 'Could not submit your review')),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (comment.trim().length < 1) {
      setError('Please write a short comment');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5">
        <div className="text-center">
          <div className="font-display text-4xl font-bold leading-none">{avgRating.toFixed(1)}</div>
          <div className="mt-1.5">
            <Stars value={avgRating} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{reviewCount} ratings</div>
        </div>
      </div>

      {status === 'authenticated' ? (
        <form onSubmit={submit} className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="mb-3 text-sm font-semibold">Write a review</p>
          {error && <p className="mb-2 text-xs text-brand">{error}</p>}
          {success && <p className="mb-2 text-xs text-green-600">Thanks! Your review was submitted.</p>}
          <div className="mb-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={cn('h-6 w-6', n <= rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')} />
              </button>
            ))}
          </div>
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-2 rounded-lg"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience with this product…"
            className="w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" variant="brand" size="sm" className="mt-3" disabled={mutation.isPending}>
            {mutation.isPending ? 'Submitting…' : 'Submit review'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Only verified buyers (with a delivered order) can post a review.
          </p>
        </form>
      ) : (
        <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>{' '}
          to write a review. Reviews are limited to verified buyers.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product.</p>
      ) : (
        <ul className="divide-y divide-border">
          {reviews.map((r) => (
            <li key={r._id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-semibold">
                    {r.reviewer.name[0]?.toUpperCase() ?? 'U'}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{r.reviewer.name}</p>
                    <Stars value={r.rating} size={12} />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
              <p className="mt-1 text-sm text-foreground/80">{r.comment}</p>
              {r.isVerifiedPurchase && (
                <span className="mt-1 inline-block text-[11px] font-medium text-green-600">✓ Verified Purchase</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
