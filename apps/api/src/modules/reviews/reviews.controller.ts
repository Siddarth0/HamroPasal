import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import { getPagination } from '@/shared/utils/pagination';
import {
  createReview,
  listProductReviews,
  listMyReviews,
  updateReview,
  deleteReview,
  addReviewImages,
  removeReviewImage,
} from './reviews.service';
import {
  createReviewSchema,
  updateReviewSchema,
  removeReviewImageSchema,
} from './reviews.validation';

export const create = asyncHandler(async (req, res) => {
  const data = createReviewSchema.parse(req.body);
  const review = await createReview(req.user!.userId, data);
  ApiResponse.created(res, review, 'Review submitted');
});

export const productReviews = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listProductReviews(String(req.params.productId), pagination);
  ApiResponse.paginated(res, items, meta);
});

export const myReviews = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listMyReviews(req.user!.userId, pagination);
  ApiResponse.paginated(res, items, meta);
});

export const update = asyncHandler(async (req, res) => {
  const data = updateReviewSchema.parse(req.body);
  const review = await updateReview(req.user!.userId, String(req.params.id), data);
  ApiResponse.success(res, review, 'Review updated');
});

export const remove = asyncHandler(async (req, res) => {
  await deleteReview(req.user!.userId, req.user!.role, String(req.params.id));
  ApiResponse.success(res, undefined, 'Review deleted');
});

export const addImages = asyncHandler(async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new ApiError('No image files provided', 400);
  const review = await addReviewImages(req.user!.userId, String(req.params.id), files.map((f) => f.buffer));
  ApiResponse.success(res, review, 'Images added');
});

export const removeImage = asyncHandler(async (req, res) => {
  const { publicId } = removeReviewImageSchema.parse(req.body);
  const review = await removeReviewImage(req.user!.userId, String(req.params.id), publicId);
  ApiResponse.success(res, review, 'Image removed');
});
