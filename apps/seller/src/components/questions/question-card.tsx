'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { SellerQuestion } from '@/features/questions/api';
import { useAnswerQuestion } from '@/features/questions/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

export function QuestionCard({ q }: { q: SellerQuestion }) {
  const answerMutation = useAnswerQuestion();
  const [draft, setDraft] = useState(q.answer ?? '');
  const [editing, setEditing] = useState(!q.answer);
  const [error, setError] = useState<string | null>(null);
  const answered = !!q.answer;

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    setError(null);
    try {
      await answerMutation.mutateAsync({ id: q._id, answer: text });
      setEditing(false);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not post answer'));
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          {q.product ? (
            <Link
              href={`/products/${q.product._id}`}
              className="flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                {q.product.image && (
                  <Image src={q.product.image} alt="" fill className="object-cover" sizes="36px" />
                )}
              </span>
              <span className="line-clamp-1">{q.product.name}</span>
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">Product unavailable</span>
          )}
          <Badge variant={answered ? 'success' : 'warning'}>
            {answered ? 'Answered' : 'Awaiting reply'}
          </Badge>
        </div>

        <div className="rounded-xl bg-muted/50 px-3 py-2">
          <p className="text-sm">{q.question}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Asked by {q.asker.name} · {formatDate(q.createdAt)}
          </p>
        </div>

        {answered && !editing ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Your answer
            </p>
            <p className="mt-1 text-sm">{q.answer}</p>
            <button
              onClick={() => setEditing(true)}
              className="mt-1 text-xs text-brand hover:underline"
            >
              Edit answer
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your answer…"
              className="min-h-[72px]"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button
                variant="brand"
                size="sm"
                disabled={!draft.trim() || answerMutation.isPending}
                onClick={submit}
              >
                {answerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {answered ? 'Update answer' : 'Post answer'}
              </Button>
              {answered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(q.answer ?? '');
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
