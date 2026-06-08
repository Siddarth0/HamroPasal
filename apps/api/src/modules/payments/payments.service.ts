import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import { createNotification } from '@/modules/notifications/notifications.service';
import { khaltiInitiate, khaltiLookup } from './khalti.service';
import { esewaBuildForm, esewaDecodeAndVerify } from './esewa.service';
import { stripeCreateIntent, stripeConstructEvent } from './stripe.service';

/* ------------------------------------------------------------------ */
/* Shared state transitions                                           */
/* ------------------------------------------------------------------ */

// All gateways converge here on success: mark payment PAID, confirm the order
// and its still-pending sub-orders.
const markOrderPaid = async (orderId: string, gatewayRef: string, gatewayResponse: any) => {
  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: 'PAID', gatewayRef, gatewayResponse, paidAt: new Date() },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
    }),
    prisma.subOrder.updateMany({
      where: { orderId, status: 'PENDING' },
      data: { status: 'CONFIRMED' },
    }),
  ]);

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true } });
  if (order) {
    await createNotification(order.userId, {
      type: 'PAYMENT_RECEIVED',
      title: 'Payment received',
      body: 'We have received your payment.',
      data: { orderId },
    }).catch(() => undefined);
  }
};

const markPaymentFailed = async (orderId: string, gatewayResponse: any) => {
  await prisma.$transaction([
    prisma.payment.update({ where: { orderId }, data: { status: 'FAILED', gatewayResponse } }),
    prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'FAILED' } }),
  ]);
};

/* ------------------------------------------------------------------ */
/* Unified initiate                                                   */
/* ------------------------------------------------------------------ */

export const initiatePayment = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  if (!order) throw new ApiError('Order not found', 404);
  if (order.paymentStatus === 'PAID') throw new ApiError('Order is already paid', 400);
  if (order.status === 'CANCELLED') throw new ApiError('Order has been cancelled', 400);

  // Ensure a (re-usable) pending payment record exists for this order.
  await prisma.payment.upsert({
    where: { orderId },
    create: { orderId, method: order.paymentMethod, amount: order.totalAmount, status: 'PENDING' },
    update: { method: order.paymentMethod, amount: order.totalAmount, status: 'PENDING' },
  });

  switch (order.paymentMethod) {
    case 'COD': {
      // No gateway — confirm now, cash collected on delivery (payment stays PENDING).
      await prisma.$transaction([
        prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } }),
        prisma.subOrder.updateMany({
          where: { orderId, status: 'PENDING' },
          data: { status: 'CONFIRMED' },
        }),
      ]);
      return { method: 'COD' as const, message: 'Order confirmed. Pay on delivery.' };
    }

    case 'KHALTI': {
      const r = await khaltiInitiate({
        amount: order.totalAmount,
        orderId,
        orderName: `Order ${orderId.slice(0, 8)}`,
        customer: {
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone ?? undefined,
        },
      });
      await prisma.payment.update({ where: { orderId }, data: { gatewayRef: r.pidx } });
      return { method: 'KHALTI' as const, paymentUrl: r.paymentUrl, pidx: r.pidx };
    }

    case 'ESEWA': {
      const form = esewaBuildForm({ amount: order.totalAmount, orderId });
      await prisma.payment.update({ where: { orderId }, data: { gatewayRef: form.transactionUuid } });
      return { method: 'ESEWA' as const, url: form.url, fields: form.fields };
    }

    case 'STRIPE': {
      const pi = await stripeCreateIntent({ amount: order.totalAmount, orderId });
      await prisma.payment.update({ where: { orderId }, data: { gatewayRef: pi.id } });
      return { method: 'STRIPE' as const, clientSecret: pi.clientSecret };
    }

    default:
      throw new ApiError('Unsupported payment method', 400);
  }
};

/* ------------------------------------------------------------------ */
/* Verification (per gateway)                                         */
/* ------------------------------------------------------------------ */

type VerifyResult = { orderId: string; status: 'PAID' | 'FAILED' | 'PENDING' };

export const verifyKhalti = async (pidx: string): Promise<VerifyResult> => {
  const payment = await prisma.payment.findFirst({ where: { gatewayRef: pidx } });
  if (!payment) throw new ApiError('Payment not found', 404);

  const lookup = await khaltiLookup(pidx);
  if (lookup.status === 'Completed') {
    await markOrderPaid(payment.orderId, pidx, lookup.raw);
    return { orderId: payment.orderId, status: 'PAID' };
  }
  if (['Expired', 'User canceled', 'Failed'].includes(lookup.status)) {
    await markPaymentFailed(payment.orderId, lookup.raw);
    return { orderId: payment.orderId, status: 'FAILED' };
  }
  return { orderId: payment.orderId, status: 'PENDING' };
};

export const verifyEsewa = async (dataB64: string): Promise<VerifyResult> => {
  const result = esewaDecodeAndVerify(dataB64);
  const payment = await prisma.payment.findFirst({ where: { gatewayRef: result.transactionUuid } });
  if (!payment) throw new ApiError('Payment not found', 404);

  if (result.valid && result.status === 'COMPLETE') {
    await markOrderPaid(payment.orderId, result.transactionUuid, result.raw);
    return { orderId: payment.orderId, status: 'PAID' };
  }
  await markPaymentFailed(payment.orderId, result.raw);
  return { orderId: payment.orderId, status: 'FAILED' };
};

export const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  const event = stripeConstructEvent(rawBody, signature);

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as any;
    const orderId = pi.metadata?.orderId;
    if (orderId) await markOrderPaid(orderId, pi.id, { id: pi.id, amount: pi.amount, status: pi.status });
  } else if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as any;
    const orderId = pi.metadata?.orderId;
    if (orderId) await markPaymentFailed(orderId, { id: pi.id, status: pi.status });
  }

  return { received: true };
};
