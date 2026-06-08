import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import { env } from '@/config/env';
import {
  initiatePayment,
  verifyKhalti,
  verifyEsewa,
  handleStripeWebhook,
} from './payments.service';
import { initiateSchema } from './payments.validation';

const frontendResult = (status: string, orderId: string) =>
  `${env.CLIENT_URL}/payment/${status === 'PAID' ? 'success' : 'failure'}?orderId=${orderId}`;

//-----Unified initiate----------
export const initiate = asyncHandler(async (req, res) => {
  const { orderId } = initiateSchema.parse(req.body);
  const result = await initiatePayment(req.user!.userId, orderId);
  ApiResponse.success(res, result, 'Payment initiated');
});

//-----Khalti callback (return_url, GET ?pidx=)----------
export const khaltiCallback = asyncHandler(async (req, res) => {
  const pidx = typeof req.query.pidx === 'string' ? req.query.pidx : '';
  if (!pidx) {
    res.redirect(`${env.CLIENT_URL}/payment/failure`);
    return;
  }
  const result = await verifyKhalti(pidx);
  res.redirect(frontendResult(result.status, result.orderId));
});

//-----eSewa callback (success_url, GET ?data=base64)----------
export const esewaCallback = asyncHandler(async (req, res) => {
  const data = typeof req.query.data === 'string' ? req.query.data : '';
  if (!data) {
    res.redirect(`${env.CLIENT_URL}/payment/failure`);
    return;
  }
  const result = await verifyEsewa(data);
  res.redirect(frontendResult(result.status, result.orderId));
});

//-----Stripe webhook (raw body, signed)----------
export const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') throw new ApiError('Missing Stripe signature', 400);
  const result = await handleStripeWebhook(req.body as Buffer, signature);
  res.json(result);
});
