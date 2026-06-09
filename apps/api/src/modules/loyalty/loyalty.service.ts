import { prisma } from '@/config/db.postgres';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';

// Earn/redeem rules (defaults — tune as needed).
export const EARN_RATE = 100; // 1 point earned per 100 currency spent
export const REDEEM_RATE = 1; // 1 point = 1 currency unit on redemption

export const pointsToCurrency = (points: number): number => points * REDEEM_RATE;
export const currencyToEarnedPoints = (amount: number): number =>
  Math.floor(amount / EARN_RATE);

/** Current balance = signed sum of the ledger (EARNED/BONUS +, REDEEMED/EXPIRED −). */
export const getBalance = async (userId: string): Promise<number> => {
  const agg = await prisma.loyaltyTransaction.aggregate({
    where: { userId },
    _sum: { points: true },
  });
  return agg._sum.points ?? 0;
};

export const listTransactions = async (userId: string, pagination: Pagination) => {
  const [items, total] = await Promise.all([
    prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.loyaltyTransaction.count({ where: { userId } }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};
