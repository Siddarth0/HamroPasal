import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const askQuestionSchema = z.object({
  productId: objectId,
  question: z.string().min(5, 'Question must be at least 5 characters').max(500),
});

export const answerQuestionSchema = z.object({
  answer: z.string().min(1, 'Answer is required').max(1000),
});
