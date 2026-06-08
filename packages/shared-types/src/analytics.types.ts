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
