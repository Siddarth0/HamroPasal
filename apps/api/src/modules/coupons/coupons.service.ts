import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import { getCart } from '@/modules/cart/cart.service';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';

const round2 = (n: number) => Math.round(n * 100) / 100;
const normalize = (code: string) => code.trim().toUpperCase();

interface CouponLike {
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
}

/** Pure discount math for a coupon against an applicable subtotal. */
export const computeDiscount = (coupon: CouponLike, applicableSubtotal: number): number => {
  if (applicableSubtotal < coupon.minOrderAmount) {
    throw new ApiError(`Minimum order amount of ${coupon.minOrderAmount} required`, 400);
  }
  let discount =
    coupon.discountType === 'PERCENTAGE'
      ? (applicableSubtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.discountType === 'PERCENTAGE' && coupon.maxDiscount != null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  return round2(Math.min(discount, applicableSubtotal));
};

/**
 * Validates a coupon for a user against pre-computed cart subtotals and returns
 * the coupon + the discount. Store-scoped coupons apply only to that store's
 * items; platform coupons apply to the whole items subtotal.
 */
export const validateCoupon = async (
  userId: string,
  code: string,
  itemsSubtotal: number,
  subtotalByStore: Map<string, number>,
) => {
  const coupon = await prisma.coupon.findUnique({ where: { code: normalize(code) } });
  if (!coupon || !coupon.isActive) throw new ApiError('Invalid coupon code', 400);

  const now = new Date();
  if (coupon.startsAt > now) throw new ApiError('This coupon is not active yet', 400);
  if (coupon.expiresAt && coupon.expiresAt < now) throw new ApiError('This coupon has expired', 400);
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError('This coupon has reached its usage limit', 400);
  }

  const already = await prisma.couponRedemption.findUnique({
    where: { couponId_userId: { couponId: coupon.id, userId } },
  });
  if (already) throw new ApiError('You have already used this coupon', 400);

  const base = coupon.storeId ? subtotalByStore.get(coupon.storeId) ?? 0 : itemsSubtotal;
  if (base <= 0) throw new ApiError("This coupon doesn't apply to items in your cart", 400);

  return { coupon, discount: computeDiscount(coupon, base) };
};

/** Validate against the user's live cart (the validate endpoint). */
export const validateCouponForUser = async (userId: string, code: string) => {
  const cart = await getCart(userId);
  if (cart.stores.length === 0) throw new ApiError('Your cart is empty', 400);
  const byStore = new Map(cart.stores.map((s) => [s.storeId, s.subtotal]));
  const { coupon, discount } = await validateCoupon(userId, code, cart.subtotal, byStore);
  return { code: coupon.code, discountType: coupon.discountType, discount };
};

/* ------------------------------ Management ------------------------------ */

interface Actor {
  userId: string;
  role: string;
  storeId?: string;
}

export const createCoupon = async (
  actor: Actor,
  data: {
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    startsAt?: Date;
    expiresAt?: Date;
    storeId?: string;
  },
) => {
  const { storeId: bodyStoreId, code, ...rest } = data;

  let storeId: string | null;
  if (actor.role === 'SELLER') {
    if (!actor.storeId) throw new ApiError('You do not have a store', 403);
    storeId = actor.storeId; // sellers can only scope to their own store
  } else {
    storeId = bodyStoreId ?? null; // admin: specific store or platform-wide
  }

  return prisma.coupon.create({ data: { ...rest, code: normalize(code), storeId } });
};

export const listStoreCoupons = async (storeId: string, pagination: Pagination) => {
  const where = { storeId };
  const [items, total] = await Promise.all([
    prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
    prisma.coupon.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const listAllCoupons = async (
  pagination: Pagination,
  filters: { storeId?: string; isActive?: boolean },
) => {
  const where = {
    ...(filters.storeId ? { storeId: filters.storeId } : {}),
    ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
    prisma.coupon.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const updateCoupon = async (
  actor: Actor,
  couponId: string,
  data: Record<string, unknown>,
) => {
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId }, select: { id: true, storeId: true } });
  if (!coupon) throw new ApiError('Coupon not found', 404);
  if (actor.role === 'SELLER' && coupon.storeId !== actor.storeId) {
    throw new ApiError('Not allowed', 403);
  }
  return prisma.coupon.update({ where: { id: couponId }, data });
};
