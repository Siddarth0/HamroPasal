import { prisma } from '@/config/db.postgres';
import { ApiError } from '@/shared/utils/api-error';
import { uploadImageWithId } from '@/config/cloudinary';

const profileSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatarUrl: true,
  role: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

/* ------------------------------- Profile ------------------------------- */

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });
  if (!user) throw new ApiError('User not found', 404);
  return user;
};

export const updateProfile = async (
  userId: string,
  data: { name?: string; phone?: string; avatarUrl?: string },
) =>
  prisma.user.update({
    where: { id: userId },
    data,
    select: profileSelect,
  });

export const updateAvatar = async (userId: string, fileBuffer: Buffer) => {
  const { url } = await uploadImageWithId(fileBuffer, `avatars/${userId}`);
  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: url },
    select: profileSelect,
  });
};

/* ------------------------------ Addresses ------------------------------ */

interface AddressInput {
  label?: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const listAddresses = (userId: string) =>
  prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

export const createAddress = async (userId: string, data: AddressInput) => {
  const count = await prisma.address.count({ where: { userId } });
  // First address is always the default; otherwise honour the flag.
  const makeDefault = data.isDefault || count === 0;

  return prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return tx.address.create({
      data: { ...data, userId, isDefault: makeDefault },
    });
  });
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  data: Partial<AddressInput>,
) => {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
    select: { id: true },
  });
  if (!existing) throw new ApiError('Address not found', 404);

  return prisma.$transaction(async (tx) => {
    if (data.isDefault === true) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }
    return tx.address.update({ where: { id: addressId }, data });
  });
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
    select: { id: true },
  });
  if (!existing) throw new ApiError('Address not found', 404);

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId, isDefault: true, NOT: { id: addressId } },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);

  return prisma.address.findUnique({ where: { id: addressId } });
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
    select: { id: true, isDefault: true },
  });
  if (!existing) throw new ApiError('Address not found', 404);

  await prisma.address.delete({ where: { id: addressId } });

  // If we removed the default, promote the most recent remaining address.
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }
};
