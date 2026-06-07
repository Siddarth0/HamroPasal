import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import {
  listCategories,
  getCategoryTree,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  setCategoryImage,
  removeCategoryImage,
} from './categories.service';
import { createCategorySchema, updateCategorySchema } from './categories.validation';

/* ------------------------------- Public ------------------------------- */

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await listCategories();
  ApiResponse.success(res, categories);
});

export const getTree = asyncHandler(async (_req, res) => {
  const tree = await getCategoryTree();
  ApiResponse.success(res, tree);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const category = await getCategoryBySlug(String(req.params.slug));
  ApiResponse.success(res, category);
});

/* ------------------------------- Admin -------------------------------- */

export const create = asyncHandler(async (req, res) => {
  const data = createCategorySchema.parse(req.body);
  const category = await createCategory(data);
  ApiResponse.created(res, category, 'Category created');
});

export const update = asyncHandler(async (req, res) => {
  const data = updateCategorySchema.parse(req.body);
  const category = await updateCategory(String(req.params.id), data);
  ApiResponse.success(res, category, 'Category updated');
});

export const remove = asyncHandler(async (req, res) => {
  await deleteCategory(String(req.params.id));
  ApiResponse.success(res, undefined, 'Category deleted');
});

export const uploadCategoryImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError('No image file provided', 400);
  const category = await setCategoryImage(String(req.params.id), req.file.buffer);
  ApiResponse.success(res, category, 'Category image updated');
});

export const deleteCategoryImage = asyncHandler(async (req, res) => {
  const category = await removeCategoryImage(String(req.params.id));
  ApiResponse.success(res, category, 'Category image removed');
});
