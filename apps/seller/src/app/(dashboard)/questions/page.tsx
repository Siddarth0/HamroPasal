'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { NoStorePrompt } from '@/components/shared/no-store';
import { Pagination } from '@/components/shared/pagination';
import { QuestionCard } from '@/components/questions/question-card';
import { Button } from '@/components/ui/button';
import { useMyStore } from '@/features/store/hooks';
import { useSellerQuestions } from '@/features/questions/hooks';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'unanswered' | 'answered';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'unanswered', label: 'Awaiting reply' },
  { key: 'answered', label: 'Answered' },
  { key: 'all', label: 'All' },
];

export default function QuestionsPage() {
  const { data: store, isLoading: storeLoading } = useMyStore();
  const [filter, setFilter] = useState<Filter>('unanswered');
  const [page, setPage] = useState(1);

  const answered = filter === 'all' ? undefined : filter === 'answered';
  const { data, isLoading, isError } = useSellerQuestions({ page, answered });

  if (storeLoading) return <LoadingBlock />;
  if (!store) {
    return (
      <>
        <PageHeader title="Questions" />
        <NoStorePrompt />
      </>
    );
  }

  const questions = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Questions"
        description="Answer questions customers ask on your product pages"
      />

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              filter === f.key ? 'bg-brand text-brand-foreground' : 'bg-muted hover:bg-muted/70',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load questions." />}

      {data && questions.length === 0 && (
        <EmptyState
          icon={<HelpCircle className="h-10 w-10" />}
          title={
            filter === 'unanswered'
              ? 'No open questions'
              : filter === 'answered'
                ? 'No answered questions yet'
                : 'No questions yet'
          }
          description={
            filter === 'unanswered'
              ? "You're all caught up — nothing waiting for a reply."
              : 'Questions customers ask on your products will appear here.'
          }
          action={
            filter !== 'all' && (
              <Button variant="outline" onClick={() => setFilter('all')}>
                View all
              </Button>
            )
          }
        />
      )}

      {questions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {questions.map((q) => (
            <QuestionCard key={q._id} q={q} />
          ))}
        </div>
      )}

      <Pagination meta={data?.meta} page={page} onPageChange={setPage} />
    </>
  );
}
