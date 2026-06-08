import crypto from 'node:crypto';
import { env } from '@/config/env';
import { ApiError } from '@/shared/utils/api-error';

export const isEsewaConfigured = Boolean(env.ESEWA_MERCHANT_CODE && env.ESEWA_SECRET_KEY);

// eSewa ePay v2 signs `field=value,...` (over signed_field_names) with HMAC-SHA256, base64-encoded.
const sign = (message: string): string =>
  crypto.createHmac('sha256', env.ESEWA_SECRET_KEY).update(message).digest('base64');

export interface EsewaForm {
  url: string;
  fields: Record<string, string>;
  transactionUuid: string;
}

/** Builds the auto-submit form payload that redirects the buyer to eSewa. */
export const esewaBuildForm = (params: { amount: number; orderId: string }): EsewaForm => {
  if (!isEsewaConfigured) throw new ApiError('eSewa is not configured', 503);

  const transactionUuid = `${params.orderId}-${Date.now()}`;
  const totalAmount = String(params.amount);
  const productCode = env.ESEWA_MERCHANT_CODE;
  const signature = sign(
    `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`,
  );

  return {
    url: `${env.ESEWA_BASE_URL}/api/epay/main/v2/form`,
    transactionUuid,
    fields: {
      amount: totalAmount,
      tax_amount: '0',
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${env.SERVER_URL}/api/payments/esewa/callback`,
      failure_url: env.ESEWA_FAILURE_URL || `${env.CLIENT_URL}/payment/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    },
  };
};

export interface EsewaVerifyResult {
  status: string; // COMPLETE | PENDING | ...
  transactionUuid: string;
  totalAmount: string;
  valid: boolean;
  raw: unknown;
}

/** Decodes the base64 `data` param from eSewa's success redirect and verifies its signature. */
export const esewaDecodeAndVerify = (dataB64: string): EsewaVerifyResult => {
  const decoded = JSON.parse(Buffer.from(dataB64, 'base64').toString('utf-8')) as any;

  const signedFields = String(decoded.signed_field_names).split(',');
  const message = signedFields.map((f) => `${f}=${decoded[f]}`).join(',');
  const valid = sign(message) === decoded.signature;

  return {
    status: decoded.status,
    transactionUuid: decoded.transaction_uuid,
    totalAmount: decoded.total_amount,
    valid,
    raw: decoded,
  };
};
