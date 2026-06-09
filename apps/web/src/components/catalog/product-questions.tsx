'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductQuestions, askQuestion } from '@/features/questions/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api';

export function ProductQuestions({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const status = useAuthStore((s) => s.status);
  const { data, isLoading } = useQuery({
    queryKey: ['questions', productId],
    queryFn: () => fetchProductQuestions(productId),
  });
  const questions = data?.items ?? [];

  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => askQuestion({ productId, question: text }),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['questions', productId] });
    },
    onError: (e) => setError(getApiErrorMessage(e, 'Could not post your question')),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (text.trim().length < 5) {
      setError('Question must be at least 5 characters');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="space-y-5">
      {status === 'authenticated' ? (
        <form onSubmit={submit} className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="mb-3 text-sm font-semibold">Ask a question</p>
          {error && <p className="mb-2 text-xs text-brand">{error}</p>}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about size, delivery, warranty…"
              className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" variant="brand" disabled={mutation.isPending}>
              {mutation.isPending ? 'Posting…' : 'Ask'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>{' '}
          to ask a question about this product.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading questions…</p>
      ) : questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No questions yet. Ask the seller anything about this product.
        </p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => (
            <li key={q._id} className="rounded-xl border border-border p-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                  Q
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-xs text-muted-foreground">
                    Asked by {q.asker.name} · {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {q.answer ? (
                <div className="mt-3 flex items-start gap-2 border-l-2 border-brand/30 pl-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
                    A
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground/80">{q.answer}</p>
                    <p className="text-xs font-medium text-brand">
                      Seller{q.answeredAt ? ` · ${new Date(q.answeredAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 pl-8 text-xs italic text-muted-foreground">Awaiting seller’s answer</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
