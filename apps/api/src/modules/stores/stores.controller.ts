import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { getPagination } from '@/shared/utils/pagination';
import {
  applyForStore,
  getMyStore,
  updateMyStore,
  listPublicStores,
  getStoreBySlug,
  listStoresForAdmin,
  updateStoreByAdmin,
  listMyZones,
  createZone,
  updateZone,
  deleteZone,
} from './stores.service';
import {
  createStoreSchema,
  updateStoreSchema,
  adminUpdateStoreSchema,
  createZoneSchema,
  updateZoneSchema,
} from './stores.validation';
import type { StoreStatus } from '@/generated/prisma';

/* ------------------------------- Seller ------------------------------- */

export const createStore = asyncHandler(async (req, res) => {
  const data = createStoreSchema.parse(req.body);
  const store = await applyForStore(req.user!.userId, data);
  ApiResponse.created(res, store, 'Store submitted for approval');
});

export const getMine = asyncHandler(async (req, res) => {
  const store = await getMyStore(req.user!.userId);
  ApiResponse.success(res, store);
});

export const updateMine = asyncHandler(async (req, res) => {
  const data = updateStoreSchema.parse(req.body);
  const store = await updateMyStore(req.user!.userId, data);
  ApiResponse.success(res, store, 'Store updated');
});

/* ------------------------------- Public ------------------------------- */

export const browseStores = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const { items, meta } = await listPublicStores(pagination, search);
  ApiResponse.paginated(res, items, meta);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const store = await getStoreBySlug(String(req.params.slug));
  ApiResponse.success(res, store);
});

/* ------------------------------- Admin -------------------------------- */

export const adminListStores = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const status =
    typeof req.query.status === 'string' ? (req.query.status as StoreStatus) : undefined;
  const { items, meta } = await listStoresForAdmin(pagination, status);
  ApiResponse.paginated(res, items, meta);
});

export const adminUpdateStore = asyncHandler(async (req, res) => {
  const data = adminUpdateStoreSchema.parse(req.body);
  const store = await updateStoreByAdmin(String(req.params.id), data);
  ApiResponse.success(res, store, 'Store updated');
});

/* --------------------------- Delivery zones --------------------------- */

export const getMyZones = asyncHandler(async (req, res) => {
  const zones = await listMyZones(req.user!.userId);
  ApiResponse.success(res, zones);
});

export const addZone = asyncHandler(async (req, res) => {
  const data = createZoneSchema.parse(req.body);
  const zone = await createZone(req.user!.userId, data);
  ApiResponse.created(res, zone, 'Delivery zone added');
});

export const editZone = asyncHandler(async (req, res) => {
  const data = updateZoneSchema.parse(req.body);
  const zone = await updateZone(req.user!.userId, String(req.params.id), data);
  ApiResponse.success(res, zone, 'Delivery zone updated');
});

export const removeZone = asyncHandler(async (req, res) => {
  await deleteZone(req.user!.userId, String(req.params.id));
  ApiResponse.success(res, undefined, 'Delivery zone removed');
});
