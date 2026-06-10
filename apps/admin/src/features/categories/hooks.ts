'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  type CategoryInput,
} from './api';

export function useCategories() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
    enabled: status === 'authenticated',
  });
}

export function useCategoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-categories'] });

  const create = useMutation({ mutationFn: (i: CategoryInput) => createCategory(i), onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) => updateCategory(id, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: string) => deleteCategory(id), onSuccess: invalidate });
  const uploadImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadCategoryImage(id, file),
    onSuccess: invalidate,
  });

  return { create, update, remove, uploadImage };
}
