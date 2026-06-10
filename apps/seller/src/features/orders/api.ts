import type { OrderStatus, OrderItem, PaymentStatus, PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

/** A seller's sub-order, with its items + a slice of the parent order. */
export interface SellerSubOrder {
  id: string;
  orderId: string;
  storeId: string;
  subtotal: number;
  shippingFee: number;
  commissionFee: number;
  sellerEarning: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  order: {
    id: string;
    createdAt: string;
    deliveryAddress: string | null;
    paymentStatus: PaymentStatus;
    user: { name: string } | null;
  };
}

/** Statuses a seller can transition a sub-order to. */
export const SELLER_STATUSES: OrderStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

/** Valid next statuses given the current one (mirrors the API state machine). */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export async function fetchSellerSubOrders(
  params: { page?: number; limit?: number } = {},
): Promise<{ items: SellerSubOrder[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<SellerSubOrder[]>>('/orders/seller', { params });
  return { items: data.data, meta: data.meta };
}

export async function updateSubOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<SellerSubOrder> {
  const { data } = await api.patch<ApiEnvelope<SellerSubOrder>>(
    `/orders/seller/sub-orders/${id}/status`,
    { status },
  );
  return data.data;
}
