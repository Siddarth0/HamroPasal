import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories, fetchStores, type ProductQuery } from './api';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
}

export function useProducts(params: ProductQuery = {}) {
  return useQuery({ queryKey: ['products', params], queryFn: () => fetchProducts(params) });
}

export function useStores(params: { page?: number; limit?: number; search?: string } = {}) {
  return useQuery({ queryKey: ['stores', params], queryFn: () => fetchStores(params) });
}
