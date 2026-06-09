import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CartView } from 'shared-types';
import { useAuthStore } from '@/store/auth';
import { fetchCart, updateCartItem, removeCartItem, clearCart } from './api';

export const CART_KEY = ['cart'] as const;

export function useCart() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: CART_KEY,
    queryFn: fetchCart,
    enabled: status === 'authenticated',
  });
}

/** Header badge count (0 for guests / empty cart). */
export function useCartCount(): number {
  const { data } = useCart();
  return data?.totalQuantity ?? 0;
}

export function useCartMutations() {
  const qc = useQueryClient();
  const onSuccess = (data: CartView) => qc.setQueryData(CART_KEY, data);

  return {
    update: useMutation({ mutationFn: updateCartItem, onSuccess }),
    remove: useMutation({ mutationFn: removeCartItem, onSuccess }),
    clear: useMutation({ mutationFn: clearCart, onSuccess }),
  };
}
