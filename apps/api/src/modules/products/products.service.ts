import { Product } from '@/models/product.model';
import { Category } from '@/models/category.model';
import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import { slugify } from '@/shared/utils/slug';
import { uploadImage, deleteImage } from '@/config/cloudinary';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';

const getOwnedStore = async (ownerId: string) => {
  const store = await prisma.store.findUnique({
    where: { ownerId },
    select: { id: true, status: true },
  });
  if (!store) throw new ApiError('Create a store before adding products', 404);
  return store;
};

const getOwnedStoreId = async (ownerId: string): Promise<string> =>
  (await getOwnedStore(ownerId)).id;

const generateUniqueSlug = async (name: string): Promise<string> => {
  const base = slugify(name) || 'product';
  let slug = base;
  let n = 1;
  while (await Product.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

const ensureCategoryExists = async (categoryId: string): Promise<void> => {
  if (!(await Category.exists({ _id: categoryId }))) {
    throw new ApiError('Category not found', 400);
  }
};

// Loads a product owned by the seller's store, or throws 404.
const getOwnedProduct = async (ownerId: string, productId: string) => {
  const storeId = await getOwnedStoreId(ownerId);
  const product = await Product.findOne({ _id: productId, storeId });
  if (!product) throw new ApiError('Product not found', 404);
  return product;
};

/* ------------------------------- Seller ------------------------------- */

export const createProduct = async (ownerId: string, data: Record<string, unknown>) => {
  const store = await getOwnedStore(ownerId);
  await ensureCategoryExists(data.categoryId as string);
  const slug = await generateUniqueSlug(data.name as string);
  // storeActive mirrors store status so a PENDING/SUSPENDED store's products stay hidden.
  return Product.create({
    ...data,
    storeId: store.id,
    slug,
    storeActive: store.status === 'ACTIVE',
  });
};

export const listMyProducts = async (
  ownerId: string,
  pagination: Pagination,
  search?: string,
) => {
  const storeId = await getOwnedStoreId(ownerId);
  const filter: Record<string, any> = {
    storeId,
    ...(search ? { $text: { $search: search } } : {}),
  };

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.take),
    Product.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const getMyProduct = (ownerId: string, productId: string) =>
  getOwnedProduct(ownerId, productId);

export const updateProduct = async (
  ownerId: string,
  productId: string,
  data: Record<string, unknown>,
) => {
  const product = await getOwnedProduct(ownerId, productId);
  if (data.categoryId) await ensureCategoryExists(data.categoryId as string);

  Object.assign(product, data);
  await product.save();
  return product;
};

export const deleteProduct = async (ownerId: string, productId: string): Promise<void> => {
  const product = await getOwnedProduct(ownerId, productId);
  // Clean up Cloudinary assets before removing the document.
  await Promise.all(product.images.map((img) => deleteImage(img.publicId)));
  await product.deleteOne();
};

export const addProductImages = async (
  ownerId: string,
  productId: string,
  files: Buffer[],
) => {
  const product = await getOwnedProduct(ownerId, productId);
  const uploaded = await Promise.all(files.map((buf) => uploadImage(buf, 'products')));
  product.images.push(...uploaded);
  await product.save();
  return product;
};

export const removeProductImage = async (
  ownerId: string,
  productId: string,
  publicId: string,
) => {
  const product = await getOwnedProduct(ownerId, productId);
  const exists = product.images.some((img) => img.publicId === publicId);
  if (!exists) throw new ApiError('Image not found on this product', 404);

  await deleteImage(publicId);
  product.images = product.images.filter((img) => img.publicId !== publicId);
  await product.save();
  return product;
};

/* ------------------------------- Public ------------------------------- */

interface BrowseFilters {
  search?: string;
  categoryId?: string;
  storeId?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
}

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { avgRating: -1 },
  popular: { soldCount: -1 },
};

export const browseProducts = async (pagination: Pagination, filters: BrowseFilters) => {
  const filter: Record<string, any> = { isActive: true, storeActive: true };

  if (filters.categoryId) filter.categoryId = filters.categoryId;
  if (filters.storeId) filter.storeId = filters.storeId;
  if (filters.tag) filter.tags = filters.tag;
  if (filters.search) filter.$text = { $search: filters.search };

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filter.price = {};
    if (filters.minPrice !== undefined) filter.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) filter.price.$lte = filters.maxPrice;
  }

  const sort = SORT_MAP[filters.sort ?? 'newest'];

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(pagination.skip).limit(pagination.take),
    Product.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const getProductBySlug = async (slug: string): Promise<Record<string, unknown>> => {
  const product = await Product.findOne({ slug, isActive: true, storeActive: true })
    .populate('categoryId', 'name slug')
    .lean();
  if (!product) throw new ApiError('Product not found', 404);

  // Attach the seller store (Postgres) so the detail page can link to it.
  const store = await prisma.store.findUnique({
    where: { id: product.storeId },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });

  return { ...product, store };
};
