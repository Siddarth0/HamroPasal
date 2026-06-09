import type { Address, PaginationMeta } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string | null;
  price: number;
  quantity: number;
}

export interface SubOrder {
  id: string;
  storeId: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  store: { id: string; name: string; slug: string };
  orderItems: OrderItem[];
}

export interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  loyaltyPointsUsed: number;
  createdAt: string;
  address: Address | null;
  subOrders: SubOrder[];
}

export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await api.get<ApiEnvelope<Order>>(`/orders/${id}`);
  return data.data;
}

export interface OrderListItem {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  subOrders: { id: string; storeId: string; status: string; subtotal: number; shippingFee: number }[];
}

export async function fetchMyOrders(
  page = 1,
): Promise<{ items: OrderListItem[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<OrderListItem[]>>('/orders', {
    params: { page, limit: 10 },
  });
  return { items: data.data, meta: data.meta };
}

export async function cancelOrder(id: string): Promise<void> {
  await api.post(`/orders/${id}/cancel`);
}
