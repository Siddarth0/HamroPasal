import mongoose from 'mongoose';
import { Review } from '@/models/review.model';
import { Product } from '@/models/product.model';
import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import { uploadImage, deleteImage } from '@/config/cloudinary';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';

// Recomputes a product's avgRating + reviewCount from its approved reviews.
const recomputeProductRating = async (productId: string): Promise<void> => {
  const [stats] = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne(
    { _id: productId },
    { avgRating: stats ? Math.round(stats.avg * 10) / 10 : 0, reviewCount: stats?.count ?? 0 },
  );
};

// Confirms the user has a DELIVERED sub-order containing this product.
const findVerifiedPurchase = async (userId: string, productId: string) =>
  prisma.orderItem.findFirst({
    where: { productId, subOrder: { status: 'DELIVERED', order: { userId } } },
    select: { subOrderId: true },
  });

const loadOwnedReview = async (userId: string, reviewId: string) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError('Review not found', 404);
  if (review.userId !== userId) throw new ApiError('Review not found', 404);
  return review;
};

/* ------------------------------- Create ------------------------------- */

export const createReview = async (
  userId: string,
  data: { productId: string; rating: number; title?: string; comment: string },
) => {
  const product = await Product.findById(data.productId).select('storeId');
  if (!product) throw new ApiError('Product not found', 404);

  const purchase = await findVerifiedPurchase(userId, data.productId);
  if (!purchase) throw new ApiError('You can only review products you have received', 403);

  if (await Review.exists({ productId: data.productId, userId })) {
    throw new ApiError('You have already reviewed this product', 409);
  }

  const review = await Review.create({
    productId: data.productId,
    userId,
    storeId: product.storeId,
    subOrderId: purchase.subOrderId,
    rating: data.rating,
    title: data.title,
    comment: data.comment,
    isVerifiedPurchase: true,
  });

  await recomputeProductRating(data.productId);
  return review;
};

/* ------------------------------- Read --------------------------------- */

export const listProductReviews = async (productId: string, pagination: Pagination) => {
  const filter = { productId, isApproved: true };
  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.take)
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Attach reviewer name/avatar from Postgres.
  const userIds = [...new Set(reviews.map((r) => r.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, avatarUrl: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  const items = reviews.map((r) => ({
    ...r,
    reviewer: { name: byId.get(r.userId)?.name ?? 'User', avatarUrl: byId.get(r.userId)?.avatarUrl ?? null },
  }));

  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const listMyReviews = async (userId: string, pagination: Pagination) => {
  const filter = { userId };
  const [items, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.take),
    Review.countDocuments(filter),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

/* ------------------------------- Update/Delete ------------------------ */

export const updateReview = async (
  userId: string,
  reviewId: string,
  data: { rating?: number; title?: string; comment?: string },
) => {
  const review = await loadOwnedReview(userId, reviewId);
  Object.assign(review, data);
  await review.save();
  if (data.rating !== undefined) await recomputeProductRating(String(review.productId));
  return review;
};

export const deleteReview = async (userId: string, role: string, reviewId: string) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError('Review not found', 404);
  if (review.userId !== userId && role !== 'ADMIN') throw new ApiError('Not allowed', 403);

  await Promise.all(review.images.map((img) => deleteImage(img.publicId)));
  const productId = String(review.productId);
  await review.deleteOne();
  await recomputeProductRating(productId);
};

/* ------------------------------- Images ------------------------------- */

export const addReviewImages = async (userId: string, reviewId: string, files: Buffer[]) => {
  const review = await loadOwnedReview(userId, reviewId);
  const uploaded = await Promise.all(files.map((buf) => uploadImage(buf, 'reviews')));
  review.images.push(...uploaded);
  await review.save();
  return review;
};

export const removeReviewImage = async (userId: string, reviewId: string, publicId: string) => {
  const review = await loadOwnedReview(userId, reviewId);
  if (!review.images.some((img) => img.publicId === publicId)) {
    throw new ApiError('Image not found on this review', 404);
  }
  await deleteImage(publicId);
  review.images = review.images.filter((img) => img.publicId !== publicId) as typeof review.images;
  await review.save();
  return review;
};
