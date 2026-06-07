import { Cart, type ICart } from '@/models/cart.model';
import { Product } from '@/models/product.model';
import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import type { CartView, CartStoreGroup } from 'shared-types';

interface ItemRef {
  productId: string;
  variantId?: string;
}

const sameItem = (
  item: { productId: unknown; variantId?: string },
  ref: ItemRef,
): boolean =>
  String(item.productId) === ref.productId &&
  (item.variantId ?? null) === (ref.variantId ?? null);

// Resolves the live unit price + available stock for a product/variant pair.
// Enforces variant selection rules. Used when adding/updating items.
const resolvePricing = (
  product: { variants: any[]; price: number; stock: number },
  variantId?: string,
) => {
  if (product.variants.length > 0) {
    if (!variantId) throw new ApiError('Please select a variant', 400);
    const variant = product.variants.find((v) => String(v._id) === variantId);
    if (!variant) throw new ApiError('Invalid variant', 400);
    return { price: variant.price as number, stock: variant.stock as number };
  }
  if (variantId) throw new ApiError('This product has no variants', 400);
  return { price: product.price, stock: product.stock };
};

/**
 * Builds the read view of a cart: each item joined against the live product
 * (current price/stock/active) and the Postgres store (name/status), grouped by
 * store. Read-only — does not mutate the stored cart.
 */
const buildCartView = async (cart: ICart | null): Promise<CartView> => {
  if (!cart || cart.items.length === 0) {
    return { stores: [], totalQuantity: 0, subtotal: 0 };
  }

  const productIds = [...new Set(cart.items.map((i) => String(i.productId)))];
  const storeIds = [...new Set(cart.items.map((i) => i.storeId))];

  const [products, stores] = await Promise.all([
    Product.find({ _id: { $in: productIds } }).lean(),
    prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true, slug: true, status: true },
    }),
  ]);

  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const storeMap = new Map(stores.map((s) => [s.id, s]));

  const groups = new Map<string, CartStoreGroup>();
  let totalQuantity = 0;
  let subtotal = 0;

  for (const item of cart.items) {
    const product = productMap.get(String(item.productId));
    const store = storeMap.get(item.storeId);

    let available = false;
    let price = item.price;
    let maxStock = 0;
    let name = item.name;
    let imageUrl = item.imageUrl;

    if (product && product.isActive && store && store.status === 'ACTIVE') {
      const variant = item.variantId
        ? product.variants?.find((v: any) => String(v._id) === item.variantId)
        : undefined;

      if (item.variantId && variant) {
        available = true;
        price = variant.price;
        maxStock = variant.stock;
      } else if (!item.variantId) {
        available = true;
        price = product.price;
        maxStock = product.stock;
      }
      name = product.name;
      imageUrl = product.images?.[0]?.url;
    }

    const inStock = available && maxStock >= item.quantity;
    const lineTotal = price * item.quantity;
    totalQuantity += item.quantity;

    const group =
      groups.get(item.storeId) ??
      ({
        storeId: item.storeId,
        storeName: store?.name ?? 'Unavailable store',
        storeSlug: store?.slug ?? '',
        items: [],
        subtotal: 0,
      } satisfies CartStoreGroup);

    group.items.push({
      productId: String(item.productId),
      variantId: item.variantId,
      name,
      imageUrl,
      price,
      quantity: item.quantity,
      lineTotal,
      available,
      inStock,
      maxStock,
      storeId: item.storeId,
    });

    if (available && inStock) {
      group.subtotal += lineTotal;
      subtotal += lineTotal;
    }
    groups.set(item.storeId, group);
  }

  return { stores: [...groups.values()], totalQuantity, subtotal };
};

/* ------------------------------- Public API ------------------------------- */

export const getCart = async (userId: string): Promise<CartView> => {
  const cart = await Cart.findOne({ userId });
  return buildCartView(cart);
};

export const addItem = async (
  userId: string,
  { productId, variantId, quantity }: ItemRef & { quantity: number },
): Promise<CartView> => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError('Product is not available', 404);
  }

  const { price, stock } = resolvePricing(product as any, variantId);

  let cart = await Cart.findOne({ userId });
  if (!cart) cart = new Cart({ userId, items: [] });

  const existing = cart.items.find((i) => sameItem(i, { productId, variantId }));
  const nextQty = (existing?.quantity ?? 0) + quantity;
  if (nextQty > stock) throw new ApiError(`Only ${stock} in stock`, 400);

  const imageUrl = product.images?.[0]?.url;
  if (existing) {
    existing.quantity = nextQty;
    existing.price = price;
    existing.name = product.name;
    existing.imageUrl = imageUrl;
  } else {
    cart.items.push({
      productId: product._id,
      variantId,
      name: product.name,
      imageUrl,
      price,
      quantity,
      storeId: product.storeId,
    } as any);
  }

  await cart.save();
  return buildCartView(cart);
};

export const updateItem = async (
  userId: string,
  { productId, variantId, quantity }: ItemRef & { quantity: number },
): Promise<CartView> => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new ApiError('Cart is empty', 404);

  const idx = cart.items.findIndex((i) => sameItem(i, { productId, variantId }));
  if (idx === -1) throw new ApiError('Item not in cart', 404);

  if (quantity === 0) {
    cart.items.splice(idx, 1);
  } else {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) throw new ApiError('Product is not available', 404);
    const { stock } = resolvePricing(product as any, variantId);
    if (quantity > stock) throw new ApiError(`Only ${stock} in stock`, 400);
    cart.items[idx].quantity = quantity;
  }

  await cart.save();
  return buildCartView(cart);
};

export const removeItem = async (
  userId: string,
  ref: ItemRef,
): Promise<CartView> => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new ApiError('Cart is empty', 404);

  const idx = cart.items.findIndex((i) => sameItem(i, ref));
  if (idx === -1) throw new ApiError('Item not in cart', 404);

  cart.items.splice(idx, 1);
  await cart.save();
  return buildCartView(cart);
};

export const clearCart = async (userId: string): Promise<CartView> => {
  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items.splice(0, cart.items.length);
    await cart.save();
  }
  return { stores: [], totalQuantity: 0, subtotal: 0 };
};
