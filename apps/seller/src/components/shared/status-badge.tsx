import type { OrderStatus, PayoutStatus, PaymentStatus } from 'shared-types';
import { Badge, type BadgeProps } from '@/components/ui/badge';

type Variant = NonNullable<BadgeProps['variant']>;

const ORDER: Record<OrderStatus, Variant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'brand',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'muted',
};

const PAYMENT: Record<PaymentStatus, Variant> = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'danger',
  REFUNDED: 'muted',
};

const PAYOUT: Record<PayoutStatus, Variant> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  COMPLETED: 'success',
  FAILED: 'danger',
};

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={ORDER[status]}>{titleCase(status)}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={PAYMENT[status]}>{titleCase(status)}</Badge>;
}

export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  return <Badge variant={PAYOUT[status]}>{titleCase(status)}</Badge>;
}
