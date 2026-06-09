import { prisma } from '@/config/db.postgres';
import { Cart } from '@/models/cart.model';
import { Product } from '@/models/product.model';
import { ApiError } from '@/shared/utils/api-error';
import { haversineKm } from '@/shared/utils/distance';
import { selectDeliveryFee } from '@/modules/shipping/shipping.service';
import { validateCoupon } from '@/modules/coupons/coupons.service';
import { getBalance, pointsToCurrency, currencyToEarnedPoints } from '@/modules/loyalty/loyalty.service';
import { createNotification } from '@/modules/notifications/notifications.service';
import { enqueueEmail } from '@/config/queue';
import { orderConfirmationTemplate } from '@/modules/notifications/email.templates';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';
import type { OrderStatus, PaymentMethod } from '@/generated/prisma';

const round2 = (n: number): number => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ */
/* Stock reservation (Mongo) with compensation                        */
/* ------------------------------------------------------------------ */

interface StockItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

const decrementStock = async (item: StockItem): Promise<boolean> => {
  if (item.variantId) {
    const res = await Product.updateOne(
      {
        _id: item.productId,
        variants: { $elemMatch: { _id: item.variantId, stock: { $gte: item.quantity } } },
      },
      { $inc: { 'variants.$.stock': -item.quantity } },
    );
    return res.modifiedCount === 1;
  }
  const res = await Product.updateOne(
    { _id: item.productId, stock: { $gte: item.quantity } },
    { $inc: { stock: -item.quantity } },
  );
  return res.modifiedCount === 1;
};

const incrementStock = async (item: StockItem): Promise<void> => {
  if (item.variantId) {
    await Product.updateOne(
      { _id: item.productId, 'variants._id': item.variantId },
      { $inc: { 'variants.$.stock': item.quantity } },
    );
  } else {
    await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
  }
};

const releaseStock = async (items: StockItem[]): Promise<void> => {
  await Promise.all(items.map(incrementStock));
};

// Conditionally decrements each item; rolls back on the first failure so we
// never oversell (guards against races between the validation read and write).
const reserveStock = async (items: StockItem[]): Promise<void> => {
  const applied: StockItem[] = [];
  for (const item of items) {
    const ok = await decrementStock(item);
    if (!ok) {
      await releaseStock(applied);
      throw new ApiError('Some items just went out of stock. Please review your cart.', 409);
    }
    applied.push(item);
  }
};

/* ------------------------------------------------------------------ */
/* Checkout                                                           */
/* ------------------------------------------------------------------ */

export const checkout = async (
  userId: string,
  input: {
    addressId: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    redeemPoints?: number;
  },
) => {
  const address = await prisma.address.findFirst({ where: { id: input.addressId, userId } });
  if (!address) throw new ApiError('Delivery address not found', 404);
  if (address.latitude == null || address.longitude == null) {
    throw new ApiError('Selected address has no map location', 400);
  }

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) throw new ApiError('Your cart is empty', 400);

  const productIds = [...new Set(cart.items.map((i) => String(i.productId)))];
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  // 1. Validate every line against live product data + build order lines.
  interface Line {
    productId: string;
    variantId?: string;
    name: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    storeId: string;
    lineTotal: number;
  }
  const lines: Line[] = [];
  for (const item of cart.items) {
    const product = productMap.get(String(item.productId));
    if (!product || !product.isActive) {
      throw new ApiError(`"${item.name}" is no longer available`, 409);
    }

    let price: number;
    let stock: number;
    if (item.variantId) {
      const variant = product.variants?.find((v: any) => String(v._id) === item.variantId);
      if (!variant) throw new ApiError(`A variant of "${product.name}" is unavailable`, 409);
      price = variant.price;
      stock = variant.stock;
    } else {
      if (product.variants?.length) {
        throw new ApiError(`Please reselect a variant for "${product.name}"`, 409);
      }
      price = product.price;
      stock = product.stock;
    }
    if (stock < item.quantity) throw new ApiError(`Insufficient stock for "${product.name}"`, 409);

    lines.push({
      productId: String(item.productId),
      variantId: item.variantId,
      name: product.name,
      imageUrl: product.images?.[0]?.url,
      price,
      quantity: item.quantity,
      storeId: product.storeId,
      lineTotal: round2(price * item.quantity),
    });
  }

  // 2. Load the stores, validate they're active + deliverable, compute fees.
  const storeIds = [...new Set(lines.map((l) => l.storeId))];
  const stores = await prisma.store.findMany({
    where: { id: { in: storeIds } },
    select: {
      id: true,
      name: true,
      ownerId: true,
      status: true,
      commissionRate: true,
      latitude: true,
      longitude: true,
      deliveryZones: {
        where: { isActive: true },
        select: { name: true, distanceKm: true, shippingFee: true },
      },
    },
  });
  const storeMap = new Map(stores.map((s) => [s.id, s]));

  const groups = storeIds.map((storeId) => {
    const store = storeMap.get(storeId);
    if (!store || store.status !== 'ACTIVE') {
      throw new ApiError('A store in your cart is currently unavailable', 400);
    }
    if (store.latitude == null || store.longitude == null) {
      throw new ApiError(`Store "${store.name}" has no location set`, 400);
    }

    const distance = haversineKm(
      { lat: address.latitude!, lng: address.longitude! },
      { lat: store.latitude, lng: store.longitude },
    );
    const fee = selectDeliveryFee(distance, store.deliveryZones);
    if (!fee) throw new ApiError(`"${store.name}" doesn't deliver to your address`, 400);

    const items = lines.filter((l) => l.storeId === storeId);
    const subtotal = round2(items.reduce((sum, l) => sum + l.lineTotal, 0));
    const commissionFee = round2((subtotal * store.commissionRate) / 100);
    const sellerEarning = round2(subtotal - commissionFee);

    return { storeId, subtotal, shippingFee: fee.shippingFee, commissionFee, sellerEarning, items };
  });

  const itemsSubtotal = round2(groups.reduce((s, g) => s + g.subtotal, 0));
  const shippingTotal = round2(groups.reduce((s, g) => s + g.shippingFee, 0));

  // Coupon — platform absorbs the discount; commission/earnings stay on gross.
  let couponId: string | null = null;
  let couponDiscount = 0;
  if (input.couponCode) {
    const subtotalByStore = new Map(groups.map((g) => [g.storeId, g.subtotal]));
    const result = await validateCoupon(userId, input.couponCode, itemsSubtotal, subtotalByStore);
    couponId = result.coupon.id;
    couponDiscount = result.discount;
  }

  // Loyalty redemption — capped so the payable total can't go below 0.
  let loyaltyPointsUsed = 0;
  let loyaltyDiscount = 0;
  if (input.redeemPoints && input.redeemPoints > 0) {
    const balance = await getBalance(userId);
    if (input.redeemPoints > balance) throw new ApiError('Insufficient loyalty points', 400);
    const remaining = Math.max(0, round2(itemsSubtotal + shippingTotal - couponDiscount));
    loyaltyDiscount = round2(Math.min(pointsToCurrency(input.redeemPoints), remaining));
    loyaltyPointsUsed = Math.round(loyaltyDiscount / (pointsToCurrency(1) || 1));
  }

  const totalAmount = round2(itemsSubtotal + shippingTotal - couponDiscount - loyaltyDiscount);
  const earnedPoints = currencyToEarnedPoints(totalAmount);

  const stockItems: StockItem[] = lines.map((l) => ({
    productId: l.productId,
    variantId: l.variantId,
    quantity: l.quantity,
  }));

  // 3. Reserve stock first (prevents oversell), then write the order atomically
  //    with the coupon redemption + loyalty ledger entries.
  await reserveStock(stockItems);

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          addressId: address.id,
          deliveryLat: address.latitude,
          deliveryLng: address.longitude,
          deliveryAddress: `${address.addressLine}, ${address.city}, ${address.district}`,
          totalAmount,
          shippingFee: shippingTotal,
          discountAmount: couponDiscount,
          loyaltyPointsUsed,
          couponId,
          paymentMethod: input.paymentMethod,
          subOrders: {
            create: groups.map((g) => ({
              storeId: g.storeId,
              subtotal: g.subtotal,
              shippingFee: g.shippingFee,
              commissionFee: g.commissionFee,
              sellerEarning: g.sellerEarning,
              orderItems: {
                create: g.items.map((it) => ({
                  productId: it.productId,
                  variantId: it.variantId,
                  name: it.name,
                  imageUrl: it.imageUrl,
                  price: it.price,
                  quantity: it.quantity,
                })),
              },
            })),
          },
        },
        include: { subOrders: { include: { orderItems: true } } },
      });

      if (couponId) {
        await tx.couponRedemption.create({ data: { couponId, userId, orderId: created.id } });
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      }
      if (loyaltyPointsUsed > 0) {
        await tx.loyaltyTransaction.create({
          data: { userId, points: -loyaltyPointsUsed, type: 'REDEEMED', orderId: created.id, description: 'Redeemed at checkout' },
        });
      }
      if (earnedPoints > 0) {
        await tx.loyaltyTransaction.create({
          data: { userId, points: earnedPoints, type: 'EARNED', orderId: created.id, description: 'Earned from order' },
        });
      }

      return created;
    });
  } catch (err) {
    await releaseStock(stockItems); // compensate the reservation
    throw err;
  }

  // 4. Empty the cart + bump soldCount (best-effort, non-critical).
  cart.items.splice(0, cart.items.length);
  await cart.save();
  await Promise.all(
    lines.map((l) => Product.updateOne({ _id: l.productId }, { $inc: { soldCount: l.quantity } })),
  ).catch(() => undefined);

  // 5. Notify buyer + each seller, queue confirmation email (order already committed).
  try {
    await createNotification(userId, {
      type: 'ORDER_PLACED',
      title: 'Order placed',
      body: 'Your order has been placed successfully.',
      data: { orderId: order.id },
    });

    const notifiedSellers = new Set<string>();
    for (const g of groups) {
      const ownerId = storeMap.get(g.storeId)?.ownerId;
      if (ownerId && !notifiedSellers.has(ownerId)) {
        notifiedSellers.add(ownerId);
        await createNotification(ownerId, {
          type: 'NEW_ORDER',
          title: 'New order received',
          body: 'You have a new order to fulfill.',
          data: { orderId: order.id },
        });
      }
    }

    const buyer = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (buyer) {
      await enqueueEmail({
        to: buyer.email,
        subject: 'Your order is confirmed',
        html: orderConfirmationTemplate(buyer.name, order.id, order.totalAmount),
      });
    }
  } catch (err) {
    console.error('post-checkout side effects failed:', err);
  }

  return order;
};

/* ------------------------------------------------------------------ */
/* Customer order views                                               */
/* ------------------------------------------------------------------ */

export const listMyOrders = async (userId: string, pagination: Pagination) => {
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        subOrders: {
          select: { id: true, storeId: true, status: true, subtotal: true, shippingFee: true },
        },
      },
    }),
    prisma.order.count({ where: { userId } }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const getMyOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      address: true,
      subOrders: {
        include: { orderItems: true, store: { select: { id: true, name: true, slug: true } } },
      },
    },
  });
  if (!order) throw new ApiError('Order not found', 404);
  return order;
};

const CANCELLABLE: OrderStatus[] = ['PENDING', 'CONFIRMED'];

export const cancelMyOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { subOrders: { include: { orderItems: true } } },
  });
  if (!order) throw new ApiError('Order not found', 404);
  if (!CANCELLABLE.includes(order.status)) {
    throw new ApiError('This order can no longer be cancelled', 400);
  }

  const stockItems: StockItem[] = order.subOrders.flatMap((s) =>
    s.orderItems.map((it) => ({
      productId: it.productId,
      variantId: it.variantId ?? undefined,
      quantity: it.quantity,
    })),
  );

  await prisma.$transaction([
    prisma.subOrder.updateMany({ where: { orderId: order.id }, data: { status: 'CANCELLED' } }),
    prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } }),
  ]);
  await releaseStock(stockItems);

  return prisma.order.findUnique({
    where: { id: order.id },
    include: { subOrders: { include: { orderItems: true } } },
  });
};

/* ------------------------------------------------------------------ */
/* Seller sub-order management                                        */
/* ------------------------------------------------------------------ */

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

// Rolls the parent order status up from its sub-orders.
const recomputeOrderStatus = async (orderId: string): Promise<void> => {
  const subs = await prisma.subOrder.findMany({ where: { orderId }, select: { status: true } });
  const statuses = subs.map((s) => s.status);
  const every = (s: OrderStatus) => statuses.every((x) => x === s);
  const some = (s: OrderStatus) => statuses.some((x) => x === s);

  let status: OrderStatus = 'PENDING';
  if (every('DELIVERED')) status = 'DELIVERED';
  else if (every('CANCELLED')) status = 'CANCELLED';
  else if (some('SHIPPED')) status = 'SHIPPED';
  else if (some('PROCESSING')) status = 'PROCESSING';
  else if (some('CONFIRMED')) status = 'CONFIRMED';

  await prisma.order.update({ where: { id: orderId }, data: { status } });
};

export const listStoreSubOrders = async (storeId: string, pagination: Pagination) => {
  const where = { storeId };
  const [items, total] = await Promise.all([
    prisma.subOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        orderItems: true,
        order: {
          select: {
            id: true,
            createdAt: true,
            deliveryAddress: true,
            paymentStatus: true,
            user: { select: { name: true } },
          },
        },
      },
    }),
    prisma.subOrder.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const updateSubOrderStatus = async (
  storeId: string,
  subOrderId: string,
  status: OrderStatus,
) => {
  const sub = await prisma.subOrder.findFirst({
    where: { id: subOrderId, storeId },
    include: { orderItems: true, order: { select: { userId: true } } },
  });
  if (!sub) throw new ApiError('Sub-order not found', 404);

  if (!TRANSITIONS[sub.status].includes(status)) {
    throw new ApiError(`Cannot change status from ${sub.status} to ${status}`, 400);
  }

  await prisma.subOrder.update({ where: { id: subOrderId }, data: { status } });

  // Notify the buyer of the fulfillment update (best-effort).
  await createNotification(sub.order.userId, {
    type: 'ORDER_STATUS',
    title: 'Order update',
    body: `An item in your order is now ${status.toLowerCase()}.`,
    data: { subOrderId, status },
  }).catch(() => undefined);

  // Cancelling a sub-order returns its items to stock.
  if (status === 'CANCELLED') {
    await releaseStock(
      sub.orderItems.map((it) => ({
        productId: it.productId,
        variantId: it.variantId ?? undefined,
        quantity: it.quantity,
      })),
    );
  }

  await recomputeOrderStatus(sub.orderId);

  return prisma.subOrder.findUnique({
    where: { id: subOrderId },
    include: { orderItems: true },
  });
};
