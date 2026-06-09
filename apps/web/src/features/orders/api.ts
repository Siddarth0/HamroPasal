import type { Address } from 'shared-types';
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
