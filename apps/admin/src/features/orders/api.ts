import type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderItem,
  Payment,
  Address,
  PaginationMeta,
} from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface AdminOrderListItem {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  subOrders: { id: string; storeId: string; status: OrderStatus; subtotal: number }[];
}

export interface AdminOrderDetail extends AdminOrderListItem {
  shippingFee: number;
  discountAmount: number;
  deliveryAddress: string | null;
  address: Address | null;
  payment: Payment | null;
  subOrders: (AdminOrderListItem['subOrders'][number] & {
    shippingFee: number;
    commissionFee: number;
    sellerEarning: number;
    orderItems: OrderItem[];
    store: { id: string; name: string } | null;
  })[];
}

export async function fetchOrders(
  params: { page?: number; status?: OrderStatus; paymentStatus?: PaymentStatus } = {},
): Promise<{ items: AdminOrderListItem[]; meta?: PaginationMeta }> {
  const { data } = await api.get<ApiEnvelope<AdminOrderListItem[]>>('/admin/orders', { params });
  return { items: data.data, meta: data.meta };
}

export async function fetchOrder(id: string): Promise<AdminOrderDetail> {
  const { data } = await api.get<ApiEnvelope<AdminOrderDetail>>(`/admin/orders/${id}`);
  return data.data;
}
