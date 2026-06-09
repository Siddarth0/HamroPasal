import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { fetchWishlist, addToWishlist, removeFromWishlist, type WishlistProduct } from './api';

export const WISHLIST_KEY = ['wishlist'] as const;

export function useWishlist() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: fetchWishlist,
    enabled: status === 'authenticated',
  });
}

/** Set of wishlisted product ids — for the filled-heart state on cards. */
export function useWishlistIds(): Set<string> {
  const { data } = useWishlist();
  return new Set((data ?? []).map((p) => p._id));
}

export function useWishlistCount(): number {
  const { data } = useWishlist();
  return data?.length ?? 0;
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  const onSuccess = (d: WishlistProduct[]) => qc.setQueryData(WISHLIST_KEY, d);
  const add = useMutation({ mutationFn: addToWishlist, onSuccess });
  const remove = useMutation({ mutationFn: removeFromWishlist, onSuccess });

  return {
    toggle: (productId: string, isWishlisted: boolean) =>
      isWishlisted ? remove.mutate(productId) : add.mutate(productId),
    isPending: add.isPending || remove.isPending,
  };
}
