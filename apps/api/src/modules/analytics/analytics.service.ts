import { prisma } from '@/config/db.postgres';
import { Product } from '@/models/product.model';
import type { PlatformStats, SellerStats } from 'shared-types';

const countByKey = <T extends { _count: { _all: number } }>(
  rows: T[],
  key: keyof T,
): Record<string, number> =>
  Object.fromEntries(rows.map((r) => [String(r[key]), r._count._all]));

/* ------------------------------- Platform (admin) ------------------------------- */

export const getPlatformStats = async (): Promise<PlatformStats> => {
  const [usersByRole, storesByStatus, ordersByStatus, revenue, commission, pendingPayouts, topProducts] =
    await Promise.all([
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.store.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalAmount: true } }),
      prisma.subOrder.aggregate({ where: { status: 'DELIVERED' }, _sum: { commissionFee: true } }),
      prisma.payout.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
      Product.find().sort({ soldCount: -1 }).limit(5).select('name soldCount price avgRating').lean(),
    ]);

  return {
    users: countByKey(usersByRole, 'role'),
    stores: countByKey(storesByStatus, 'status'),
    orders: countByKey(ordersByStatus, 'status'),
    revenue: revenue._sum.totalAmount ?? 0,
    commissionEarned: commission._sum.commissionFee ?? 0,
    pendingPayouts: pendingPayouts._sum.amount ?? 0,
    topProducts: topProducts.map((p) => ({
      _id: String(p._id),
      name: p.name,
      soldCount: p.soldCount,
      price: p.price,
      avgRating: p.avgRating,
    })),
  };
};

/* ------------------------------- Seller ------------------------------- */

export const getSellerStats = async (storeId: string): Promise<SellerStats> => {
  const [subOrdersByStatus, delivered, productCount, topProducts] = await Promise.all([
    prisma.subOrder.groupBy({ by: ['status'], where: { storeId }, _count: { _all: true } }),
    prisma.subOrder.aggregate({
      where: { storeId, status: 'DELIVERED' },
      _sum: { subtotal: true, sellerEarning: true },
    }),
    Product.countDocuments({ storeId }),
    Product.find({ storeId }).sort({ soldCount: -1 }).limit(5).select('name soldCount price').lean(),
  ]);

  return {
    subOrders: countByKey(subOrdersByStatus, 'status'),
    deliveredRevenue: delivered._sum.subtotal ?? 0,
    deliveredEarnings: delivered._sum.sellerEarning ?? 0,
    productCount,
    topProducts: topProducts.map((p) => ({
      _id: String(p._id),
      name: p.name,
      soldCount: p.soldCount,
      price: p.price,
    })),
  };
};
