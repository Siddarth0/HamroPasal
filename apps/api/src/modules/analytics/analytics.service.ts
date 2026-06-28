import { prisma } from '@/config/db.postgres';
import { Product } from '@/models/product.model';
import type {
  PlatformStats,
  SellerStats,
  SellerTimeseriesPoint,
  SellerTimeseriesRange,
  LowStockProduct,
} from 'shared-types';

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

/* --------------------------- Seller time-series --------------------------- */

// '30d'/'90d' bucket by day; '12m' buckets by month.
const RANGE_CONFIG: Record<
  SellerTimeseriesRange,
  { granularity: 'day' | 'month'; days?: number; months?: number }
> = {
  '30d': { granularity: 'day', days: 30 },
  '90d': { granularity: 'day', days: 90 },
  '12m': { granularity: 'month', months: 12 },
};

const toDateKey = (d: Date): string => d.toISOString().slice(0, 10);

/** Build the full list of bucket keys so the chart has no gaps. */
const buildBuckets = (range: SellerTimeseriesRange): string[] => {
  const cfg = RANGE_CONFIG[range];
  const keys: string[] = [];
  const now = new Date();

  if (cfg.granularity === 'day') {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - (cfg.days! - 1));
    for (let i = 0; i < cfg.days!; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      keys.push(toDateKey(d));
    }
  } else {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    start.setUTCMonth(start.getUTCMonth() - (cfg.months! - 1));
    for (let i = 0; i < cfg.months!; i++) {
      const d = new Date(start);
      d.setUTCMonth(start.getUTCMonth() + i);
      keys.push(toDateKey(d));
    }
  }
  return keys;
};

export const getSellerTimeseries = async (
  storeId: string,
  range: SellerTimeseriesRange,
): Promise<SellerTimeseriesPoint[]> => {
  const cfg = RANGE_CONFIG[range];
  const buckets = buildBuckets(range);
  const since = new Date(`${buckets[0]}T00:00:00.000Z`);

  // Aggregate sub-orders per day/month in the window. status::text so the enum
  // compares against string literals; ::int / ::float keep values out of bigint.
  const rows = await prisma.$queryRaw<
    Array<{ bucket: Date; orders: number; sales: number; earnings: number }>
  >`
    SELECT date_trunc(${cfg.granularity}::text, "createdAt") AS bucket,
           COUNT(*)::int AS orders,
           COALESCE(SUM(CASE WHEN status::text NOT IN ('CANCELLED', 'REFUNDED') THEN subtotal ELSE 0 END), 0)::float AS sales,
           COALESCE(SUM(CASE WHEN status::text = 'DELIVERED' THEN "sellerEarning" ELSE 0 END), 0)::float AS earnings
    FROM sub_orders
    WHERE "storeId" = ${storeId} AND "createdAt" >= ${since}
    GROUP BY bucket
    ORDER BY bucket ASC;
  `;

  const byKey = new Map(rows.map((r) => [toDateKey(new Date(r.bucket)), r]));
  return buckets.map((date) => {
    const row = byKey.get(date);
    return {
      date,
      orders: row ? Number(row.orders) : 0,
      sales: row ? Number(row.sales) : 0,
      earnings: row ? Number(row.earnings) : 0,
    };
  });
};

/* ------------------------------ Low stock ------------------------------ */

export const getSellerLowStock = async (
  storeId: string,
  threshold: number,
  limit = 20,
): Promise<LowStockProduct[]> => {
  // A product is "low" if it has no variants and product stock ≤ threshold,
  // or it has variants and at least one variant stock ≤ threshold.
  const products = await Product.find({
    storeId,
    isActive: true,
    $or: [
      { variants: { $size: 0 }, stock: { $lte: threshold } },
      { 'variants.stock': { $lte: threshold } },
    ],
  })
    .select('name slug stock variants')
    .lean();

  const rows = products.map((p) => {
    const hasVariants = (p.variants?.length ?? 0) > 0;
    const stock = hasVariants
      ? Math.min(...p.variants.map((v) => v.stock ?? 0))
      : (p.stock ?? 0);
    return { _id: String(p._id), name: p.name, slug: p.slug, stock, hasVariants };
  });

  // Most urgent (lowest stock) first.
  return rows.sort((a, b) => a.stock - b.stock).slice(0, limit);
};
