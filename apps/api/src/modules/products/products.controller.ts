import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import { getPagination } from '@/shared/utils/pagination';
import {
  createProduct,
  listMyProducts,
  getMyProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  removeProductImage,
  browseProducts,
  getProductBySlug,
  suggestProducts,
} from './products.service';
import {
  getSimilarProducts,
  getBoughtTogether,
  getRecommendedProducts,
  getProductsByIds,
} from './recommendations.service';
import {
  createProductSchema,
  updateProductSchema,
  removeImageSchema,
  productQuerySchema,
  suggestQuerySchema,
  recommendQuerySchema,
  byIdsQuerySchema,
} from './products.validation';

/* ------------------------------- Seller ------------------------------- */

export const create = asyncHandler(async (req, res) => {
  const data = createProductSchema.parse(req.body);
  const product = await createProduct(req.user!.userId, data);
  ApiResponse.created(res, product, 'Product created');
});

export const listMine = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const { items, meta } = await listMyProducts(req.user!.userId, pagination, search);
  ApiResponse.paginated(res, items, meta);
});

export const getMine = asyncHandler(async (req, res) => {
  const product = await getMyProduct(req.user!.userId, String(req.params.id));
  ApiResponse.success(res, product);
});

export const update = asyncHandler(async (req, res) => {
  const data = updateProductSchema.parse(req.body);
  const product = await updateProduct(req.user!.userId, String(req.params.id), data);
  ApiResponse.success(res, product, 'Product updated');
});

export const remove = asyncHandler(async (req, res) => {
  await deleteProduct(req.user!.userId, String(req.params.id));
  ApiResponse.success(res, undefined, 'Product deleted');
});

export const addImages = asyncHandler(async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new ApiError('No image files provided', 400);

  const product = await addProductImages(
    req.user!.userId,
    String(req.params.id),
    files.map((f) => f.buffer),
  );
  ApiResponse.success(res, product, 'Images added');
});

export const removeImage = asyncHandler(async (req, res) => {
  const { publicId } = removeImageSchema.parse(req.body);
  const product = await removeProductImage(req.user!.userId, String(req.params.id), publicId);
  ApiResponse.success(res, product, 'Image removed');
});

/* ------------------------------- Public ------------------------------- */

export const browse = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const filters = productQuerySchema.parse(req.query);
  const { items, meta } = await browseProducts(pagination, filters);
  ApiResponse.paginated(res, items, meta);
});

export const suggest = asyncHandler(async (req, res) => {
  const { q, limit } = suggestQuerySchema.parse(req.query);
  const results = await suggestProducts(q, limit);
  ApiResponse.success(res, results);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const product = await getProductBySlug(String(req.params.slug));
  ApiResponse.success(res, product);
});

/* --------------------------- Recommendations -------------------------- */

export const similar = asyncHandler(async (req, res) => {
  const { limit } = recommendQuerySchema.parse(req.query);
  const items = await getSimilarProducts(String(req.params.id), limit);
  ApiResponse.success(res, items);
});

export const boughtTogether = asyncHandler(async (req, res) => {
  const { limit } = recommendQuerySchema.parse(req.query);
  const items = await getBoughtTogether(String(req.params.id), limit);
  ApiResponse.success(res, items);
});

// Personalized when authenticated (optional auth), popular otherwise.
export const recommended = asyncHandler(async (req, res) => {
  const { limit } = recommendQuerySchema.parse(req.query);
  const items = await getRecommendedProducts(req.user?.userId, limit);
  ApiResponse.success(res, items);
});

export const byIds = asyncHandler(async (req, res) => {
  const { ids } = byIdsQuerySchema.parse(req.query);
  const items = await getProductsByIds(ids);
  ApiResponse.success(res, items);
});
