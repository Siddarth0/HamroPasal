'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import {
  fetchMyProducts,
  fetchMyProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductInput,
} from './api';

export function useMyProducts(params: { page?: number; search?: string } = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['my-products', params],
    queryFn: () => fetchMyProducts(params),
    enabled: status === 'authenticated',
  });
}

export function useMyProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['my-product', id],
    queryFn: () => fetchMyProduct(id as string),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      updateProduct(id, input),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['my-products'] });
      qc.setQueryData(['my-product', product._id], product);
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-products'] }),
  });
}
