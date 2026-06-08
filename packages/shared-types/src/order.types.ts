/** Order/payment/payout/return enums kept in sync with the Prisma schema. */
export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ['COD', 'KHALTI', 'ESEWA', 'STRIPE'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYOUT_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export const RETURN_STATUSES = ['REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'] as const;
export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export interface OrderItem {
  id: string;
  subOrderId: string;
  productId: string;
  variantId: string | null;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
}

export interface SubOrder {
  id: string;
  orderId: string;
  storeId: string;
  subtotal: number;
  shippingFee: number;
  commissionFee: number;
  sellerEarning: number;
  status: OrderStatus;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  addressId: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  deliveryAddress: string | null;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  loyaltyPointsUsed: number;
  couponId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  subOrders?: SubOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayRef: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Return {
  id: string;
  subOrderId: string;
  reason: string;
  description: string | null;
  status: ReturnStatus;
  refundAmount: number | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
