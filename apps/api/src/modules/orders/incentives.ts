import type { Prisma } from '@/generated/prisma';
import { currencyToEarnedPoints } from '@/modules/loyalty/loyalty.service';

interface ReversibleOrder {
  id: string;
  userId: string;
  totalAmount: number;
  loyaltyPointsUsed: number;
  couponId: string | null;
}

/**
 * Reverses the loyalty + coupon side effects of an order when it's cancelled or
 * fully refunded: refunds redeemed points, claws back earned points, and undoes
 * the coupon redemption (delete row + decrement usedCount). Must run inside a
 * transaction alongside the status change. Mirrors the checkout math: earned =
 * currencyToEarnedPoints(totalAmount); redeemed = order.loyaltyPointsUsed.
 */
export const reverseOrderIncentives = async (
  tx: Prisma.TransactionClient,
  order: ReversibleOrder,
  reason: string,
): Promise<void> => {
  // Give back the points the buyer spent on this order.
  if (order.loyaltyPointsUsed > 0) {
    await tx.loyaltyTransaction.create({
      data: {
        userId: order.userId,
        points: order.loyaltyPointsUsed,
        type: 'BONUS',
        orderId: order.id,
        description: `Redeemed points refunded (${reason})`,
      },
    });
  }

  // Take back the points the order earned (balance may go negative if already spent).
  const earned = currencyToEarnedPoints(order.totalAmount);
  if (earned > 0) {
    await tx.loyaltyTransaction.create({
      data: {
        userId: order.userId,
        points: -earned,
        type: 'EXPIRED',
        orderId: order.id,
        description: `Earned points reversed (${reason})`,
      },
    });
  }

  // Free up the coupon use.
  if (order.couponId) {
    await tx.couponRedemption.deleteMany({
      where: { couponId: order.couponId, userId: order.userId, orderId: order.id },
    });
    await tx.coupon.update({
      where: { id: order.couponId },
      data: { usedCount: { decrement: 1 } },
    });
  }
};
