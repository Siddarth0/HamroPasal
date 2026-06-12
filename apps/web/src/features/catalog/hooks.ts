import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchCategories,
  fetchStores,
  fetchProductBySlug,
  fetchCategoryBySlug,
  fetchStoreBySlug,
  fetchSuggestions,
  type ProductQuery,
} from './api';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
}

/** Header type-ahead. Pass an already-debounced query; only fires for 2+ chars. */
export function useSuggestions(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: ['suggest', term],
    queryFn: () => fetchSuggestions(term),
    enabled: term.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useProducts(params: ProductQuery = {}) {
  return useQuery({ queryKey: ['products', params], queryFn: () => fetchProducts(params) });
}

export function useStores(params: { page?: number; limit?: number; search?: string } = {}) {
  return useQuery({ queryKey: ['stores', params], queryFn: () => fetchStores(params) });
}

export function useStoreBySlug(slug: string) {
  return useQuery({
    queryKey: ['store', slug],
    queryFn: () => fetchStoreBySlug(slug),
    enabled: !!slug,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryBySlug(slug),
    enabled: !!slug,
  });
}
