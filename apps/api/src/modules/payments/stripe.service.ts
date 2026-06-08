import Stripe from 'stripe';
import { env } from '@/config/env';
import { ApiError } from '@/shared/utils/api-error';

export const isStripeConfigured = Boolean(env.STRIPE_SECRET_KEY);

const stripe = isStripeConfigured ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export interface StripeIntentResult {
  id: string;
  clientSecret: string | null;
}

/** Creates a PaymentIntent (amount in major units → converted to the smallest unit). */
export const stripeCreateIntent = async (params: {
  amount: number;
  orderId: string;
}): Promise<StripeIntentResult> => {
  if (!stripe) throw new ApiError('Stripe is not configured', 503);

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: env.STRIPE_CURRENCY,
    metadata: { orderId: params.orderId },
    automatic_payment_methods: { enabled: true },
  });

  return { id: intent.id, clientSecret: intent.client_secret };
};

// Minimal shape we consume — avoids exporting Stripe's internal event types.
export interface StripeWebhookEvent {
  type: string;
  data: { object: Record<string, any> };
}

/** Verifies + parses a Stripe webhook payload (raw body + signature). */
export const stripeConstructEvent = (
  rawBody: Buffer,
  signature: string,
): StripeWebhookEvent => {
  if (!stripe) throw new ApiError('Stripe is not configured', 503);
  if (!env.STRIPE_WEBHOOK_SECRET) throw new ApiError('Stripe webhook secret not configured', 500);
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  ) as unknown as StripeWebhookEvent;
};
