import mongoose from 'mongoose';
import { Product } from '@/models/product.model';
import { Wishlist } from '@/models/wishlist.model';
import { prisma } from '@/config/db.postgres';
import { redis } from '@/config/redis';
import { ApiError } from '@/shared/utils/api-error';

/** Minimal fields the storefront cards need. */
const CARD_FIELDS = 'name slug price comparePrice images avgRating reviewCount soldCount';

// Recommendations change slowly; cache the heavier ones in Redis for a few minutes.
const CACHE_TTL = 60 * 10; // 10 minutes

const getCached = async <T>(key: string): Promise<T | null> => {
  const hit = await redis.get(key);
  return hit ? (JSON.parse(hit) as T) : null;
};

const setCached = (key: string, value: unknown): Promise<unknown> =>
  redis.set(key, JSON.stringify(value), 'EX', CACHE_TTL);

/** Re-order hydrated docs to match a ranked list of ids (Mongo $in loses order). */
const orderByIds = <T extends { _id: unknown }>(docs: T[], ids: string[]): T[] => {
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  return ids.map((id) => byId.get(id)).filter((d): d is T => Boolean(d));
};

const visible = { isActive: true, storeActive: true };

/**
 * "You may also like" — content-based similarity. Same category first, ranked by
 * tag overlap, then rating/popularity. Backfills with popular products if the
 * category is thin, so the rail is never empty.
 */
export const getSimilarProducts = async (productId: string, limit: number) => {
  if (!mongoose.isValidObjectId(productId)) throw new ApiError('Invalid product id', 400);

  const product = await Product.findById(productId).select('categoryId tags').lean();
  if (!product) throw new ApiError('Product not found', 404);

  const cacheKey = `rec:similar:${productId}:${limit}`;
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  const exclude = [product._id];

  const sameCategory = await Product.aggregate([
    { $match: { ...visible, categoryId: product.categoryId, _id: { $ne: product._id } } },
    {
      $addFields: {
        tagOverlap: {
          $size: { $setIntersection: [{ $ifNull: ['$tags', []] }, product.tags ?? []] },
        },
      },
    },
    { $sort: { tagOverlap: -1, soldCount: -1, avgRating: -1 } },
    { $limit: limit },
    { $project: { name: 1, slug: 1, price: 1, comparePrice: 1, images: 1, avgRating: 1, reviewCount: 1, soldCount: 1 } },
  ]);

  let items = sameCategory;
  // Thin category → top up with popular products from anywhere.
  if (items.length < limit) {
    exclude.push(...items.map((p) => p._id));
    const fill = await Product.find(
      { ...visible, _id: { $nin: exclude } },
      CARD_FIELDS,
    )
      .sort({ soldCount: -1, avgRating: -1 })
      .limit(limit - items.length)
      .lean();
    items = [...items, ...fill];
  }

  await setCached(cacheKey, items);
  return items;
};

/**
 * "Frequently bought together" — co-purchase from the Postgres order history.
 * Finds parent orders containing this product, counts other products in those
 * orders, and hydrates the top co-occurring ones from Mongo.
 */
export const getBoughtTogether = async (productId: string, limit: number) => {
  if (!mongoose.isValidObjectId(productId)) throw new ApiError('Invalid product id', 400);

  const cacheKey = `rec:bought:${productId}:${limit}`;
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  // Parent orders that include this product.
  const orderRows = await prisma.orderItem.findMany({
    where: { productId },
    select: { subOrder: { select: { orderId: true } } },
  });
  const orderIds = [...new Set(orderRows.map((r) => r.subOrder.orderId))];

  let result: unknown[] = [];
  if (orderIds.length > 0) {
    // Other products that appeared in those same orders.
    const coItems = await prisma.orderItem.findMany({
      where: { subOrder: { orderId: { in: orderIds } }, productId: { not: productId } },
      select: { productId: true },
    });

    const counts = new Map<string, number>();
    for (const { productId: pid } of coItems) counts.set(pid, (counts.get(pid) ?? 0) + 1);

    const topIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id)
      .filter((id) => mongoose.isValidObjectId(id));

    if (topIds.length > 0) {
      const docs = await Product.find(
        { ...visible, _id: { $in: topIds } },
        CARD_FIELDS,
      ).lean();
      result = orderByIds(docs, topIds);
    }
  }

  await setCached(cacheKey, result);
  return result;
};

/**
 * Personalized "Recommended for you". Logged-in users get products from the
 * categories they buy/wishlist (excluding what they already own); guests and
 * cold-start users fall back to the platform's most popular products.
 */
export const getRecommendedProducts = async (userId: string | undefined, limit: number) => {
  if (!userId) return getPopularProducts(limit);

  const [purchasedRows, wishlist] = await Promise.all([
    prisma.orderItem.findMany({
      where: { subOrder: { order: { userId } } },
      select: { productId: true },
    }),
    Wishlist.findOne({ userId }).select('products').lean(),
  ]);

  const purchasedIds = purchasedRows.map((r) => r.productId);
  const wishlistIds = (wishlist?.products ?? []).map(String);
  const seedIds = [...new Set([...purchasedIds, ...wishlistIds])].filter((id) =>
    mongoose.isValidObjectId(id),
  );

  if (seedIds.length === 0) return getPopularProducts(limit);

  // Category affinity from the seed products.
  const seeds = await Product.find({ _id: { $in: seedIds } }).select('categoryId').lean();
  const catCounts = new Map<string, number>();
  for (const s of seeds) {
    const c = String(s.categoryId);
    catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
  }
  const topCats = [...catCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id]) => new mongoose.Types.ObjectId(id));

  if (topCats.length === 0) return getPopularProducts(limit);

  const items = await Product.find(
    { ...visible, categoryId: { $in: topCats }, _id: { $nin: seedIds } },
    CARD_FIELDS,
  )
    .sort({ soldCount: -1, avgRating: -1 })
    .limit(limit)
    .lean();

  // Top up with popular picks if affinity didn't yield enough.
  if (items.length < limit) {
    const exclude = [...seedIds, ...items.map((p) => String(p._id))];
    const fill = await Product.find(
      { ...visible, _id: { $nin: exclude.map((id) => new mongoose.Types.ObjectId(id)) } },
      CARD_FIELDS,
    )
      .sort({ soldCount: -1, avgRating: -1 })
      .limit(limit - items.length)
      .lean();
    return [...items, ...fill];
  }

  return items;
};

/** Popular fallback (also the public homepage rail for guests). */
export const getPopularProducts = (limit: number) =>
  Product.find(visible, CARD_FIELDS).sort({ soldCount: -1, avgRating: -1 }).limit(limit).lean();

/**
 * Hydrate a client-supplied id list (e.g. "recently viewed" from localStorage)
 * into product cards, preserving the given order and dropping anything hidden.
 */
export const getProductsByIds = async (ids: string[]) => {
  const valid = ids.filter((id) => mongoose.isValidObjectId(id));
  if (valid.length === 0) return [];

  const docs = await Product.find({ ...visible, _id: { $in: valid } }, CARD_FIELDS).lean();
  return orderByIds(docs, valid);
};
