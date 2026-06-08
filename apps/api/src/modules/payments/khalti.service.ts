import { env } from '@/config/env';
import { ApiError } from '@/shared/utils/api-error';

export const isKhaltiConfigured = Boolean(env.KHALTI_SECRET_KEY);

const authHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
};

export interface KhaltiInitResult {
  pidx: string;
  paymentUrl: string;
}

/** Initiates a Khalti ePayment (amount in NPR → converted to paisa). */
export const khaltiInitiate = async (params: {
  amount: number;
  orderId: string;
  orderName: string;
  customer: { name: string; email?: string; phone?: string };
}): Promise<KhaltiInitResult> => {
  if (!isKhaltiConfigured) throw new ApiError('Khalti is not configured', 503);

  const res = await fetch(`${env.KHALTI_BASE_URL}/epayment/initiate/`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      return_url: `${env.SERVER_URL}/api/payments/khalti/callback`,
      website_url: env.CLIENT_URL,
      amount: Math.round(params.amount * 100), // paisa
      purchase_order_id: params.orderId,
      purchase_order_name: params.orderName,
      customer_info: {
        name: params.customer.name,
        email: params.customer.email,
        phone: params.customer.phone,
      },
    }),
  });

  const data = (await res.json()) as any;
  if (!res.ok) throw new ApiError(data?.detail || 'Khalti initiation failed', 502);
  return { pidx: data.pidx, paymentUrl: data.payment_url };
};

export interface KhaltiLookupResult {
  status: string; // Completed | Pending | Initiated | Refunded | Expired | "User canceled"
  transactionId?: string;
  totalAmount?: number;
  raw: unknown;
}

/** Server-side verification of a Khalti payment by pidx. */
export const khaltiLookup = async (pidx: string): Promise<KhaltiLookupResult> => {
  if (!isKhaltiConfigured) throw new ApiError('Khalti is not configured', 503);

  const res = await fetch(`${env.KHALTI_BASE_URL}/epayment/lookup/`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ pidx }),
  });

  const data = (await res.json()) as any;
  if (!res.ok) throw new ApiError(data?.detail || 'Khalti lookup failed', 502);
  return {
    status: data.status,
    transactionId: data.transaction_id,
    totalAmount: data.total_amount,
    raw: data,
  };
};
