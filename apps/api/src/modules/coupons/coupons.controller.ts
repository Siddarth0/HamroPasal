import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { ApiError } from '@/shared/utils/api-error';
import { getPagination } from '@/shared/utils/pagination';
import {
  createCoupon,
  listStoreCoupons,
  listAllCoupons,
  updateCoupon,
  validateCouponForUser,
} from './coupons.service';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from './coupons.validation';

const bool = (q: unknown) => (q === 'true' ? true : q === 'false' ? false : undefined);

export const create = asyncHandler(async (req, res) => {
  const data = createCouponSchema.parse(req.body);
  const coupon = await createCoupon(
    { userId: req.user!.userId, role: req.user!.role, storeId: req.user!.storeId },
    data,
  );
  ApiResponse.created(res, coupon, 'Coupon created');
});

export const mine = asyncHandler(async (req, res) => {
  if (!req.user!.storeId) throw new ApiError('You do not have a store', 403);
  const pagination = getPagination(req.query);
  const { items, meta } = await listStoreCoupons(req.user!.storeId, pagination);
  ApiResponse.paginated(res, items, meta);
});

export const adminList = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listAllCoupons(pagination, {
    storeId: typeof req.query.storeId === 'string' ? req.query.storeId : undefined,
    isActive: bool(req.query.isActive),
  });
  ApiResponse.paginated(res, items, meta);
});

export const update = asyncHandler(async (req, res) => {
  const data = updateCouponSchema.parse(req.body);
  const coupon = await updateCoupon(
    { userId: req.user!.userId, role: req.user!.role, storeId: req.user!.storeId },
    String(req.params.id),
    data,
  );
  ApiResponse.success(res, coupon, 'Coupon updated');
});

export const validate = asyncHandler(async (req, res) => {
  const { code } = validateCouponSchema.parse(req.body);
  const result = await validateCouponForUser(req.user!.userId, code);
  ApiResponse.success(res, result, 'Coupon is valid');
});
