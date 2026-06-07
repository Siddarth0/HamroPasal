import { Wishlist } from '@/models/wishlist.model';
import { Product } from '@/models/product.model';
import { ApiError } from '@/shared/utils/api-error';

// Product fields surfaced in the wishlist view.
const PRODUCT_FIELDS = 'name slug price comparePrice images avgRating storeId isActive';

export const getWishlist = async (userId: string) => {
  const wishlist = await Wishlist.findOne({ userId }).populate('products', PRODUCT_FIELDS);
  return wishlist?.products ?? [];
};

export const addToWishlist = async (userId: string, productId: string) => {
  if (!(await Product.exists({ _id: productId }))) {
    throw new ApiError('Product not found', 404);
  }
  // $addToSet keeps it idempotent (no duplicates).
  await Wishlist.updateOne(
    { userId },
    { $addToSet: { products: productId } },
    { upsert: true },
  );
  return getWishlist(userId);
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  await Wishlist.updateOne({ userId }, { $pull: { products: productId } });
  return getWishlist(userId);
};
