import type { Store, DeliveryZone } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface CreateStoreInput {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  addressLine?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export type UpdateStoreInput = Partial<CreateStoreInput>;

/** Returns the seller's store, or null if they haven't applied yet (404). */
export async function fetchMyStore(): Promise<Store | null> {
  try {
    const { data } = await api.get<ApiEnvelope<Store>>('/stores/me');
    return data.data;
  } catch (err) {
    if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
    throw err;
  }
}

export async function applyForStore(input: CreateStoreInput): Promise<Store> {
  const { data } = await api.post<ApiEnvelope<Store>>('/stores', input);
  return data.data;
}

export async function updateMyStore(input: UpdateStoreInput): Promise<Store> {
  const { data } = await api.patch<ApiEnvelope<Store>>('/stores/me', input);
  return data.data;
}

export async function uploadStoreImage(kind: 'logo' | 'cover', file: File): Promise<Store> {
  const form = new FormData();
  form.append(kind, file);
  const { data } = await api.post<ApiEnvelope<Store>>(`/stores/me/${kind}`, form);
  return data.data;
}

/* ----------------------------- Delivery zones ----------------------------- */

export interface ZoneInput {
  name: string;
  distanceKm: number;
  shippingFee: number;
  isActive?: boolean;
}

export async function fetchMyZones(): Promise<DeliveryZone[]> {
  const { data } = await api.get<ApiEnvelope<DeliveryZone[]>>('/stores/me/delivery-zones');
  return data.data;
}

export async function createZone(input: ZoneInput): Promise<DeliveryZone> {
  const { data } = await api.post<ApiEnvelope<DeliveryZone>>('/stores/me/delivery-zones', input);
  return data.data;
}

export async function updateZone(id: string, input: Partial<ZoneInput>): Promise<DeliveryZone> {
  const { data } = await api.patch<ApiEnvelope<DeliveryZone>>(
    `/stores/me/delivery-zones/${id}`,
    input,
  );
  return data.data;
}

export async function deleteZone(id: string): Promise<void> {
  await api.delete(`/stores/me/delivery-zones/${id}`);
}
