import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';
import type { PayoutStatus } from '@/generated/prisma';

const TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  PENDING: ['PROCESSING', 'COMPLETED', 'FAILED'],
  PROCESSING: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  FAILED: ['PENDING'], // allow retry
};

/* ------------------------------- Seller -------------------------------- */

export const listStorePayouts = async (
  storeId: string,
  pagination: Pagination,
  status?: PayoutStatus,
) => {
  const where = { storeId, ...(status ? { status } : {}) };
  const [items, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: { subOrder: { select: { id: true, subtotal: true, status: true } } },
    }),
    prisma.payout.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const getSellerEarnings = async (storeId: string) => {
  const [delivered, grouped] = await Promise.all([
    prisma.subOrder.aggregate({
      where: { storeId, status: 'DELIVERED' },
      _count: { _all: true },
      _sum: { sellerEarning: true },
    }),
    prisma.payout.groupBy({
      by: ['status'],
      where: { storeId },
      _sum: { amount: true },
    }),
  ]);

  const sumByStatus = (s: PayoutStatus) =>
    grouped.find((g) => g.status === s)?._sum.amount ?? 0;

  return {
    delivered: {
      count: delivered._count._all,
      earnings: delivered._sum.sellerEarning ?? 0,
    },
    payouts: {
      pending: sumByStatus('PENDING'),
      processing: sumByStatus('PROCESSING'),
      completed: sumByStatus('COMPLETED'),
      failed: sumByStatus('FAILED'),
    },
  };
};

/* ------------------------------- Admin --------------------------------- */

export const listAllPayouts = async (
  pagination: Pagination,
  filters: { status?: PayoutStatus; storeId?: string },
) => {
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.storeId ? { storeId: filters.storeId } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: { store: { select: { id: true, name: true } } },
    }),
    prisma.payout.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

/**
 * Creates a PENDING payout (= sub-order sellerEarning) for every DELIVERED
 * sub-order that doesn't already have one. Idempotent.
 */
export const generatePayouts = async (): Promise<{ created: number }> => {
  const eligible = await prisma.subOrder.findMany({
    where: { status: 'DELIVERED', payout: { is: null } },
    select: { id: true, storeId: true, sellerEarning: true },
  });
  if (eligible.length === 0) return { created: 0 };

  const result = await prisma.payout.createMany({
    data: eligible.map((s) => ({ storeId: s.storeId, subOrderId: s.id, amount: s.sellerEarning })),
    skipDuplicates: true,
  });
  return { created: result.count };
};

export const updatePayout = async (
  payoutId: string,
  input: { status: PayoutStatus; method?: string; reference?: string },
) => {
  const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
  if (!payout) throw new ApiError('Payout not found', 404);

  if (!TRANSITIONS[payout.status].includes(input.status)) {
    throw new ApiError(`Cannot change status from ${payout.status} to ${input.status}`, 400);
  }

  const data: {
    status: PayoutStatus;
    method?: string;
    reference?: string;
    processedAt?: Date | null;
  } = { status: input.status };

  if (input.method !== undefined) data.method = input.method;
  if (input.reference !== undefined) data.reference = input.reference;
  if (input.status === 'COMPLETED') data.processedAt = new Date();
  if (input.status === 'PENDING') data.processedAt = null; // reset on retry

  return prisma.payout.update({ where: { id: payoutId }, data });
};
