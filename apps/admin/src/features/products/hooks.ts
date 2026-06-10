'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { fetchProducts, setProductActive, deleteProduct } from './api';

export function useProducts(params: { page?: number; search?: string; isActive?: boolean } = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => fetchProducts(params),
    enabled: status === 'authenticated',
  });
}

export function useProductModeration() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-products'] });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setProductActive(id, isActive),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: string) => deleteProduct(id), onSuccess: invalidate });

  return { toggle, remove };
}
