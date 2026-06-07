import { Category } from '@/models/category.model';
import { Product } from '@/models/product.model';
import { ApiError } from '@/shared/utils/api-error';
import { slugify } from '@/shared/utils/slug';
import { uploadImage, deleteImage } from '@/config/cloudinary';

interface CategoryInput {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

const generateUniqueSlug = async (name: string): Promise<string> => {
  const base = slugify(name) || 'category';
  let slug = base;
  let n = 1;
  while (await Category.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

const ensureParentExists = async (parentId: string): Promise<void> => {
  if (!(await Category.exists({ _id: parentId }))) {
    throw new ApiError('Parent category not found', 400);
  }
};

/* ------------------------------- Public ------------------------------- */

export const listCategories = () =>
  Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });

interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  image?: { url: string; publicId: string };
  sortOrder: number;
  children: CategoryTreeNode[];
}

export const getCategoryTree = async (): Promise<CategoryTreeNode[]> => {
  const cats = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const byId = new Map<string, CategoryTreeNode>();
  for (const c of cats) {
    byId.set(String(c._id), {
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      image: c.image,
      sortOrder: c.sortOrder,
      children: [],
    });
  }

  const roots: CategoryTreeNode[] = [];
  for (const c of cats) {
    const node = byId.get(String(c._id))!;
    const parentKey = c.parentId ? String(c.parentId) : null;
    if (parentKey && byId.has(parentKey)) {
      byId.get(parentKey)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await Category.findOne({ slug, isActive: true });
  if (!category) throw new ApiError('Category not found', 404);
  return category;
};

/* ------------------------------- Admin -------------------------------- */

export const createCategory = async (data: CategoryInput) => {
  if (data.parentId) await ensureParentExists(data.parentId);
  const slug = await generateUniqueSlug(data.name);
  return Category.create({ ...data, slug });
};

export const updateCategory = async (id: string, data: Partial<CategoryInput>) => {
  if (data.parentId) {
    if (data.parentId === id) throw new ApiError('A category cannot be its own parent', 400);
    await ensureParentExists(data.parentId);
  }
  const category = await Category.findByIdAndUpdate(id, data, { new: true });
  if (!category) throw new ApiError('Category not found', 404);
  return category;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const category = await Category.findById(id);
  if (!category) throw new ApiError('Category not found', 404);

  if (await Category.exists({ parentId: id })) {
    throw new ApiError('Cannot delete a category that has sub-categories', 409);
  }
  if (await Product.exists({ categoryId: id })) {
    throw new ApiError('Cannot delete a category that has products', 409);
  }

  await deleteImage(category.image?.publicId);
  await category.deleteOne();
};

export const setCategoryImage = async (id: string, fileBuffer: Buffer) => {
  const category = await Category.findById(id);
  if (!category) throw new ApiError('Category not found', 404);

  const uploaded = await uploadImage(fileBuffer, 'categories');
  await deleteImage(category.image?.publicId); // remove the old one, if any
  category.image = uploaded;
  await category.save();
  return category;
};

export const removeCategoryImage = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) throw new ApiError('Category not found', 404);

  await deleteImage(category.image?.publicId);
  category.image = undefined;
  await category.save();
  return category;
};
