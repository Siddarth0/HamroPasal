import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';
import type { ReturnStatus } from '@/generated/prisma';

const TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  REQUESTED: ['APPROVED', 'REJECTED'],
  APPROVED: ['COMPLETED'],
  REJECTED: [],
  COMPLETED: [],
};

/* ------------------------------- Customer ------------------------------- */

export const requestReturn = async (
  userId: string,
  data: { subOrderId: string; reason: string; description?: string },
) => {
  const sub = await prisma.subOrder.findFirst({
    where: { id: data.subOrderId, order: { userId } },
    select: { id: true, status: true },
  });
  if (!sub) throw new ApiError('Sub-order not found', 404);
  if (sub.status !== 'DELIVERED') {
    throw new ApiError('Only delivered orders can be returned', 400);
  }

  const active = await prisma.return.findFirst({
    where: { subOrderId: data.subOrderId, status: { in: ['REQUESTED', 'APPROVED'] } },
    select: { id: true },
  });
  if (active) throw new ApiError('A return is already in progress for this order', 409);

  return prisma.return.create({
    data: { subOrderId: data.subOrderId, reason: data.reason, description: data.description },
  });
};

export const listMyReturns = async (userId: string, pagination: Pagination) => {
  const where = { subOrder: { order: { userId } } };
  const [items, total] = await Promise.all([
    prisma.return.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: { subOrder: { select: { id: true, storeId: true, subtotal: true, status: true } } },
    }),
    prisma.return.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const getMyReturn = async (userId: string, returnId: string) => {
  const ret = await prisma.return.findFirst({
    where: { id: returnId, subOrder: { order: { userId } } },
    include: { subOrder: { include: { orderItems: true } } },
  });
  if (!ret) throw new ApiError('Return not found', 404);
  return ret;
};

/* ------------------------------- Seller -------------------------------- */

export const listStoreReturns = async (storeId: string, pagination: Pagination) => {
  const where = { subOrder: { storeId } };
  const [items, total] = await Promise.all([
    prisma.return.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        subOrder: {
          select: {
            id: true,
            subtotal: true,
            status: true,
            order: { select: { id: true, user: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.return.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const resolveReturn = async (
  storeId: string,
  returnId: string,
  input: { status: ReturnStatus; refundAmount?: number },
) => {
  const ret = await prisma.return.findFirst({
    where: { id: returnId, subOrder: { storeId } },
    include: { subOrder: { select: { id: true, subtotal: true, orderId: true } } },
  });
  if (!ret) throw new ApiError('Return not found', 404);

  if (!TRANSITIONS[ret.status].includes(input.status)) {
    throw new ApiError(`Cannot change status from ${ret.status} to ${input.status}`, 400);
  }

  const data: { status: ReturnStatus; refundAmount?: number; resolvedAt?: Date } = {
    status: input.status,
  };
  if (input.status === 'APPROVED') {
    // Default the refund to the item subtotal if not specified.
    data.refundAmount = input.refundAmount ?? ret.subOrder.subtotal;
  }
  if (input.status === 'REJECTED' || input.status === 'COMPLETED') {
    data.resolvedAt = new Date();
  }

  const updated = await prisma.return.update({ where: { id: returnId }, data });

  // On completion: mark the sub-order REFUNDED. Actual money movement is handled
  // manually / via payout adjustment (no automatic gateway refund yet).
  if (input.status === 'COMPLETED') {
    await prisma.subOrder.update({
      where: { id: ret.subOrder.id },
      data: { status: 'REFUNDED' },
    });

    // If every sub-order on the order is now refunded, reflect it on the order.
    const subs = await prisma.subOrder.findMany({
      where: { orderId: ret.subOrder.orderId },
      select: { status: true },
    });
    if (subs.every((s) => s.status === 'REFUNDED')) {
      await prisma.order.update({
        where: { id: ret.subOrder.orderId },
        data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
      });
    }
  }

  return updated;
};
