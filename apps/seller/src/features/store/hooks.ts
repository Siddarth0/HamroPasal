'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import {
  fetchMyStore,
  applyForStore,
  updateMyStore,
  uploadStoreImage,
  fetchMyZones,
  createZone,
  updateZone,
  deleteZone,
  type CreateStoreInput,
  type UpdateStoreInput,
  type ZoneInput,
} from './api';

export function useMyStore() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['my-store'],
    queryFn: fetchMyStore,
    enabled: status === 'authenticated',
  });
}

export function useApplyForStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStoreInput) => applyForStore(input),
    onSuccess: (store) => qc.setQueryData(['my-store'], store),
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStoreInput) => updateMyStore(input),
    onSuccess: (store) => qc.setQueryData(['my-store'], store),
  });
}

export function useUploadStoreImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, file }: { kind: 'logo' | 'cover'; file: File }) =>
      uploadStoreImage(kind, file),
    onSuccess: (store) => qc.setQueryData(['my-store'], store),
  });
}

/* ----------------------------- Delivery zones ----------------------------- */

export function useMyZones() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['my-zones'],
    queryFn: fetchMyZones,
    enabled: status === 'authenticated',
  });
}

export function useZoneMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['my-zones'] });

  const create = useMutation({ mutationFn: (i: ZoneInput) => createZone(i), onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ZoneInput> }) => updateZone(id, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: string) => deleteZone(id), onSuccess: invalidate });

  return { create, update, remove };
}
