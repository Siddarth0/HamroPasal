import { prisma } from '@/config/db.postgres';
import { Product } from '@/models/product.model';
import { ApiError } from '@/shared/utils/api-error';
import { uploadImageWithId } from '@/config/cloudinary';
import { slugify } from '@/shared/utils/slug';
import { buildPaginationMeta, type Pagination } from '@/shared/utils/pagination';
import type { StoreStatus } from '@/generated/prisma';

const publicStoreSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logoUrl: true,
  coverUrl: true,
  city: true,
  latitude: true,
  longitude: true,
  createdAt: true,
} as const;

const generateUniqueSlug = async (name: string): Promise<string> => {
  const base = slugify(name) || 'store';
  let slug = base;
  let n = 1;
  // Cheap loop — store names rarely collide.
  while (await prisma.store.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

/* ------------------------------- Seller ------------------------------- */

export const applyForStore = async (
  ownerId: string,
  data: {
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    addressLine?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  },
) => {
  const existing = await prisma.store.findUnique({
    where: { ownerId },
    select: { id: true },
  });
  if (existing) throw new ApiError('You already have a store', 409);

  const slug = await generateUniqueSlug(data.name);

  // status defaults to PENDING — awaits admin approval before going live.
  return prisma.store.create({ data: { ...data, ownerId, slug } });
};

export const getMyStore = async (ownerId: string) => {
  const store = await prisma.store.findUnique({
    where: { ownerId },
    include: { deliveryZones: { orderBy: { distanceKm: 'asc' } } },
  });
  if (!store) throw new ApiError('You have not created a store yet', 404);
  return store;
};

export const updateMyStore = async (
  ownerId: string,
  data: Record<string, unknown>,
) => {
  const store = await prisma.store.findUnique({
    where: { ownerId },
    select: { id: true },
  });
  if (!store) throw new ApiError('You have not created a store yet', 404);

  return prisma.store.update({ where: { ownerId }, data });
};

// Uploads logo/cover to a fixed publicId per store and saves the URL.
export const updateStoreImage = async (
  ownerId: string,
  kind: 'logo' | 'cover',
  fileBuffer: Buffer,
) => {
  const store = await prisma.store.findUnique({
    where: { ownerId },
    select: { id: true },
  });
  if (!store) throw new ApiError('You have not created a store yet', 404);

  const { url } = await uploadImageWithId(fileBuffer, `stores/${store.id}/${kind}`);
  return prisma.store.update({
    where: { ownerId },
    data: kind === 'logo' ? { logoUrl: url } : { coverUrl: url },
  });
};

/* ------------------------------- Public ------------------------------- */

export const listPublicStores = async (pagination: Pagination, search?: string) => {
  const where = {
    status: 'ACTIVE' as StoreStatus,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.store.findMany({
      where,
      select: publicStoreSelect,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.store.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const getStoreBySlug = async (slug: string) => {
  const store = await prisma.store.findFirst({
    where: { slug, status: 'ACTIVE' },
    select: {
      ...publicStoreSelect,
      deliveryZones: {
        where: { isActive: true },
        orderBy: { distanceKm: 'asc' },
        select: { id: true, name: true, distanceKm: true, shippingFee: true },
      },
    },
  });
  if (!store) throw new ApiError('Store not found', 404);
  return store;
};

/* ------------------------------- Admin -------------------------------- */

export const listStoresForAdmin = async (
  pagination: Pagination,
  status?: StoreStatus,
) => {
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.store.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.store.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
};

export const updateStoreByAdmin = async (
  storeId: string,
  data: { status?: StoreStatus; commissionRate?: number },
) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  });
  if (!store) throw new ApiError('Store not found', 404);

  const updated = await prisma.store.update({ where: { id: storeId }, data });

  // Keep catalog visibility in sync: a store's products are browsable only while ACTIVE.
  if (data.status !== undefined) {
    await Product.updateMany(
      { storeId },
      { storeActive: data.status === 'ACTIVE' },
    );
  }

  return updated;
};

/* --------------------------- Delivery zones --------------------------- */

const getOwnedStoreId = async (ownerId: string): Promise<string> => {
  const store = await prisma.store.findUnique({
    where: { ownerId },
    select: { id: true },
  });
  if (!store) throw new ApiError('Create a store before adding delivery zones', 404);
  return store.id;
};

export const listMyZones = async (ownerId: string) => {
  const storeId = await getOwnedStoreId(ownerId);
  return prisma.deliveryZone.findMany({
    where: { storeId },
    orderBy: { distanceKm: 'asc' },
  });
};

export const createZone = async (
  ownerId: string,
  data: { name: string; distanceKm: number; shippingFee: number; isActive?: boolean },
) => {
  const storeId = await getOwnedStoreId(ownerId);
  return prisma.deliveryZone.create({ data: { ...data, storeId } });
};

export const updateZone = async (
  ownerId: string,
  zoneId: string,
  data: Record<string, unknown>,
) => {
  // Scope by ownership via the relation filter.
  const zone = await prisma.deliveryZone.findFirst({
    where: { id: zoneId, store: { ownerId } },
    select: { id: true },
  });
  if (!zone) throw new ApiError('Delivery zone not found', 404);

  return prisma.deliveryZone.update({ where: { id: zoneId }, data });
};

export const deleteZone = async (ownerId: string, zoneId: string): Promise<void> => {
  const zone = await prisma.deliveryZone.findFirst({
    where: { id: zoneId, store: { ownerId } },
    select: { id: true },
  });
  if (!zone) throw new ApiError('Delivery zone not found', 404);

  await prisma.deliveryZone.delete({ where: { id: zoneId } });
};
