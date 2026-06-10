import type {
  OrderStatus,
  PayoutStatus,
  PaymentStatus,
  StoreStatus,
  Role,
} from 'shared-types';
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

const STORE: Record<StoreStatus, Variant> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  SUSPENDED: 'danger',
};

const ROLE: Record<Role, Variant> = {
  CUSTOMER: 'muted',
  SELLER: 'info',
  ADMIN: 'brand',
};

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge variant={ORDER[status]}>{titleCase(status)}</Badge>
);
export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <Badge variant={PAYMENT[status]}>{titleCase(status)}</Badge>
);
export const PayoutStatusBadge = ({ status }: { status: PayoutStatus }) => (
  <Badge variant={PAYOUT[status]}>{titleCase(status)}</Badge>
);
export const StoreStatusBadge = ({ status }: { status: StoreStatus }) => (
  <Badge variant={STORE[status]}>{titleCase(status)}</Badge>
);
export const RoleBadge = ({ role }: { role: Role }) => <Badge variant={ROLE[role]}>{titleCase(role)}</Badge>;
