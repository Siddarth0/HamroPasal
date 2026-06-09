import { Question } from '@/models/question.model';
import { Product } from '@/models/product.model';
import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';

interface Principal {
  userId: string;
  role: string;
  storeId?: string;
}

/* ------------------------------- Ask ------------------------------- */

export const askQuestion = async (
  userId: string,
  data: { productId: string; question: string },
) => {
  const product = await Product.findById(data.productId).select('storeId').lean();
  if (!product) throw new ApiError('Product not found', 404);

  return Question.create({
    productId: data.productId,
    storeId: product.storeId,
    userId,
    question: data.question,
  });
};

/* --------------------------- Public listing --------------------------- */

export const listProductQuestions = async (productId: string, pagination: Pagination) => {
  const filter = { productId };
  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.take)
      .lean(),
    Question.countDocuments(filter),
  ]);

  // Attach the asker's name from Postgres (catalog lives in Mongo).
  const userIds = [...new Set(questions.map((q) => q.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const byId = new Map(users.map((u) => [u.id, u.name]));

  const items = questions.map((q) => ({
    ...q,
    asker: { name: byId.get(q.userId) ?? 'User' },
  }));

  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

/* ------------------------------- Answer ------------------------------- */

export const answerQuestion = async (user: Principal, questionId: string, answer: string) => {
  const question = await Question.findById(questionId);
  if (!question) throw new ApiError('Question not found', 404);

  const isStoreOwner = !!user.storeId && user.storeId === question.storeId;
  if (!isStoreOwner && user.role !== 'ADMIN') {
    throw new ApiError('Only the store owner can answer this question', 403);
  }

  question.answer = answer;
  question.answeredBy = user.userId;
  question.answeredAt = new Date();
  await question.save();
  return question;
};

/* ------------------------------- Delete ------------------------------- */

export const deleteQuestion = async (user: Principal, questionId: string): Promise<void> => {
  const question = await Question.findById(questionId);
  if (!question) throw new ApiError('Question not found', 404);
  // Asker can delete their own; admins can delete any. 404 (not 403) to avoid leaking existence.
  if (question.userId !== user.userId && user.role !== 'ADMIN') {
    throw new ApiError('Question not found', 404);
  }
  await question.deleteOne();
};
