import { Question } from '@/models/question.model';
import { Product } from '@/models/product.model';
import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';
import { createNotification } from '@/modules/notifications/notifications.service';

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
  const product = await Product.findById(data.productId).select('storeId name').lean();
  if (!product) throw new ApiError('Product not found', 404);

  const question = await Question.create({
    productId: data.productId,
    storeId: product.storeId,
    userId,
    question: data.question,
  });

  // Notify the store owner so it surfaces in the Seller Center (best-effort).
  const store = await prisma.store.findUnique({
    where: { id: product.storeId },
    select: { ownerId: true },
  });
  if (store) {
    await createNotification(store.ownerId, {
      type: 'NEW_QUESTION',
      title: 'New product question',
      body: `A customer asked a question about "${product.name}".`,
      data: { productId: data.productId, questionId: String(question._id) },
    }).catch(() => undefined);
  }

  return question;
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

/* --------------------------- Seller inbox --------------------------- */

export const listStoreQuestions = async (
  storeId: string,
  pagination: Pagination,
  answered?: boolean,
) => {
  const filter: Record<string, unknown> = { storeId };
  // `?answered=false` → only open questions; `true` → only answered.
  if (answered === true) filter.answer = { $exists: true, $ne: null };
  else if (answered === false) filter.answer = { $in: [null, undefined] };

  const [questions, total] = await Promise.all([
    Question.find(filter)
      // Unanswered first, then newest.
      .sort({ answeredAt: 1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.take)
      .lean(),
    Question.countDocuments(filter),
  ]);

  // Enrich with asker name (Postgres) + product card (Mongo).
  const userIds = [...new Set(questions.map((q) => q.userId))];
  const productIds = [...new Set(questions.map((q) => String(q.productId)))];
  const [users, products] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } }),
    Product.find({ _id: { $in: productIds } })
      .select('name slug images')
      .lean(),
  ]);
  const userById = new Map(users.map((u) => [u.id, u.name]));
  const productById = new Map(products.map((p) => [String(p._id), p]));

  const items = questions.map((q) => {
    const product = productById.get(String(q.productId));
    return {
      ...q,
      asker: { name: userById.get(q.userId) ?? 'User' },
      product: product
        ? { _id: String(product._id), name: product.name, slug: product.slug, image: product.images?.[0]?.url }
        : null,
    };
  });

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
