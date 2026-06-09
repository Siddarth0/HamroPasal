import type { Address } from 'shared-types';
import { api, type ApiEnvelope } from '@/lib/api';

export interface CreateAddressInput {
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

export async function listAddresses(): Promise<Address[]> {
  const { data } = await api.get<ApiEnvelope<Address[]>>('/users/addresses');
  return data.data;
}

export async function createAddress(input: CreateAddressInput): Promise<Address> {
  const { data } = await api.post<ApiEnvelope<Address>>('/users/addresses', input);
  return data.data;
}
