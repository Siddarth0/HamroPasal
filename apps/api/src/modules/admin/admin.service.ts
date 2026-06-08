import { prisma } from '@/config/db.postgres';
import { Product } from '@/models/product.model';
import { ApiError } from '@/shared/utils/api-error';
import { deleteImage } from '@/config/cloudinary';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';
import type { OrderStatus, PaymentStatus, Role } from '@/generated/prisma';

/* --------------------------------- Users -------------------------------- */

const adminUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  isActive: true,
  isEmailVerified: true,
  createdAt: true,
  store: { select: { id: true, name: true, status: true } },
} as const;

export const listUsers = async (
  pagination: Pagination,
  filters: { role?: Role; isActive?: boolean; search?: string },
) => {
  const where = {
    ...(filters.role ? { role: filters.role } : {}),
    ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' as const } },
            { email: { contains: filters.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: adminUserSelect,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.user.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...adminUserSelect, addresses: true },
  });
  if (!user) throw new ApiError('User not found', 404);
  return user;
};

export const updateUser = async (
  userId: string,
  data: { isActive?: boolean; role?: Role },
) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new ApiError('User not found', 404);
  return prisma.user.update({ where: { id: userId }, data, select: adminUserSelect });
};

/* --------------------------------- Orders ------------------------------- */

export const listOrders = async (
  pagination: Pagination,
  filters: { status?: OrderStatus; paymentStatus?: PaymentStatus },
) => {
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        user: { select: { id: true, name: true, email: true } },
        subOrders: { select: { id: true, storeId: true, status: true, subtotal: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const getOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: true,
      payment: true,
      subOrders: { include: { orderItems: true, store: { select: { id: true, name: true } } } },
    },
  });
  if (!order) throw new ApiError('Order not found', 404);
  return order;
};

/* ------------------------------ Product moderation ---------------------- */

export const listProducts = async (
  pagination: Pagination,
  filters: { search?: string; storeId?: string; isActive?: boolean },
) => {
  const filter: Record<string, any> = {};
  if (filters.storeId) filter.storeId = filters.storeId;
  if (filters.isActive !== undefined) filter.isActive = filters.isActive;
  if (filters.search) filter.$text = { $search: filters.search };

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.take),
    Product.countDocuments(filter),
  ]);
  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const setProductActive = async (productId: string, isActive: boolean) => {
  const product = await Product.findByIdAndUpdate(productId, { isActive }, { new: true });
  if (!product) throw new ApiError('Product not found', 404);
  return product;
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError('Product not found', 404);
  await Promise.all(product.images.map((img) => deleteImage(img.publicId)));
  await product.deleteOne();
};
