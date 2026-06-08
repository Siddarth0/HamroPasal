import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { getPagination } from '@/shared/utils/pagination';
import {
  listUsers,
  getUser,
  updateUser,
  listOrders,
  getOrder,
  listProducts,
  setProductActive,
  deleteProduct,
} from './admin.service';
import { updateUserSchema, setProductActiveSchema } from './admin.validation';
import type { OrderStatus, PaymentStatus, Role } from '@/generated/prisma';

const str = (q: unknown) => (typeof q === 'string' ? q : undefined);
const bool = (q: unknown) => (q === 'true' ? true : q === 'false' ? false : undefined);

/* --------------------------------- Users -------------------------------- */

export const users = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listUsers(pagination, {
    role: str(req.query.role) as Role | undefined,
    isActive: bool(req.query.isActive),
    search: str(req.query.search),
  });
  ApiResponse.paginated(res, items, meta);
});

export const user = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await getUser(String(req.params.id)));
});

export const updateUserById = asyncHandler(async (req, res) => {
  const data = updateUserSchema.parse(req.body);
  const updated = await updateUser(String(req.params.id), data);
  ApiResponse.success(res, updated, 'User updated');
});

/* --------------------------------- Orders ------------------------------- */

export const orders = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listOrders(pagination, {
    status: str(req.query.status) as OrderStatus | undefined,
    paymentStatus: str(req.query.paymentStatus) as PaymentStatus | undefined,
  });
  ApiResponse.paginated(res, items, meta);
});

export const order = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await getOrder(String(req.params.id)));
});

/* ------------------------------ Products -------------------------------- */

export const products = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listProducts(pagination, {
    search: str(req.query.search),
    storeId: str(req.query.storeId),
    isActive: bool(req.query.isActive),
  });
  ApiResponse.paginated(res, items, meta);
});

export const toggleProduct = asyncHandler(async (req, res) => {
  const { isActive } = setProductActiveSchema.parse(req.body);
  const product = await setProductActive(String(req.params.id), isActive);
  ApiResponse.success(res, product, 'Product updated');
});

export const removeProduct = asyncHandler(async (req, res) => {
  await deleteProduct(String(req.params.id));
  ApiResponse.success(res, undefined, 'Product deleted');
});
