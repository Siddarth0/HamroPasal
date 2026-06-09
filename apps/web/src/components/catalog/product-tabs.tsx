'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProductReviews } from './product-reviews';
import { ProductQuestions } from './product-questions';

type Tab = 'desc' | 'reviews' | 'qa';

export function ProductTabs({
  productId,
  description,
  tags,
  avgRating,
  reviewCount,
}: {
  productId: string;
  description: string;
  tags: string[];
  avgRating: number;
  reviewCount: number;
}) {
  const [tab, setTab] = useState<Tab>('desc');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'desc', label: 'Description' },
    { id: 'reviews', label: `Ratings & Reviews (${reviewCount})` },
    { id: 'qa', label: 'Questions' },
  ];

  return (
    <div className="mt-10">
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium',
              tab === t.id
                ? 'border-brand text-brand'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl py-6">
        {tab === 'desc' && (
          <>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{description}</p>
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
        {tab === 'reviews' && (
          <ProductReviews productId={productId} avgRating={avgRating} reviewCount={reviewCount} />
        )}
        {tab === 'qa' && <ProductQuestions productId={productId} />}
      </div>
    </div>
  );
}
