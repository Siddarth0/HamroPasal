'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Role } from 'shared-types';
import { useAuthStore } from '@/store/auth';
import { fetchUsers, updateUser, type UpdateUserInput } from './api';

export function useUsers(
  params: { page?: number; role?: Role; isActive?: boolean; search?: string } = {},
) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => fetchUsers(params),
    enabled: status === 'authenticated',
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => updateUser(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}
