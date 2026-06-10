'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { fetchSellerQuestions, answerQuestion } from './api';

export function useSellerQuestions(params: { page?: number; answered?: boolean } = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['seller-questions', params],
    queryFn: () => fetchSellerQuestions(params),
    enabled: status === 'authenticated',
  });
}

export function useAnswerQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answer }: { id: string; answer: string }) => answerQuestion(id, answer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-questions'] });
      qc.invalidateQueries({ queryKey: ['seller-questions-unanswered'] });
    },
  });
}

/** Count of open (unanswered) questions — for the nav badge. */
export function useUnansweredCount(): number {
  const status = useAuthStore((s) => s.status);
  const { data } = useQuery({
    queryKey: ['seller-questions-unanswered'],
    queryFn: () => fetchSellerQuestions({ answered: false }),
    enabled: status === 'authenticated',
  });
  return data?.meta?.total ?? data?.items.length ?? 0;
}
