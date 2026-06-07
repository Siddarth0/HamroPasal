/** A single cart line, enriched with live price/availability at read time. */
export interface CartLineItem {
  productId: string;
  variantId?: string;
  name: string;
  imageUrl?: string;
  price: number; // current unit price (variant or product)
  quantity: number;
  lineTotal: number;
  available: boolean; // product active + store active (+ variant exists)
  inStock: boolean; // available AND enough stock for the quantity
  maxStock: number;
  storeId: string;
}

/** Cart items grouped by store — the multi-store cart structure. */
export interface CartStoreGroup {
  storeId: string;
  storeName: string;
  storeSlug: string;
  items: CartLineItem[];
  subtotal: number; // sum of available, in-stock line totals
}

export interface CartView {
  stores: CartStoreGroup[];
  totalQuantity: number;
  subtotal: number;
}
