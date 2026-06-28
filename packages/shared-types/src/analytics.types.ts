/** Platform-wide dashboard stats (admin). */
export interface PlatformStats {
  users: Record<string, number>; // by role
  stores: Record<string, number>; // by status
  orders: Record<string, number>; // by status
  revenue: number; // sum of PAID order totals
  commissionEarned: number; // sum of delivered sub-order commission
  pendingPayouts: number; // sum of PENDING payout amounts
  topProducts: Array<{
    _id: string;
    name: string;
    soldCount: number;
    price: number;
    avgRating: number;
  }>;
}

/** Seller dashboard stats. */
export interface SellerStats {
  subOrders: Record<string, number>; // by status
  deliveredRevenue: number; // sum of delivered sub-order subtotals
  deliveredEarnings: number; // sum of delivered sub-order sellerEarning
  productCount: number;
  topProducts: Array<{
    _id: string;
    name: string;
    soldCount: number;
    price: number;
  }>;
}

export type SellerTimeseriesRange = '30d' | '90d' | '12m';

/** One bucket (day or month) of a seller's sales trend. */
export interface SellerTimeseriesPoint {
  date: string; // bucket start, YYYY-MM-DD
  orders: number; // sub-orders placed in the bucket
  sales: number; // subtotal of non-cancelled/refunded sub-orders
  earnings: number; // sellerEarning of delivered sub-orders
}

/** A product running low on stock (product-level or any variant). */
export interface LowStockProduct {
  _id: string;
  name: string;
  slug: string;
  stock: number; // lowest stock across the product/variants
  hasVariants: boolean;
}
