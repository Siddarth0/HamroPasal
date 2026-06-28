import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX = 20;

interface RecentlyViewedState {
  ids: string[];
  /** Record a product view — moves it to the front, de-duplicated, capped. */
  record: (id: string) => void;
  clear: () => void;
}

/**
 * Tracks recently viewed product ids in localStorage (no backend, no auth
 * needed). The ids are hydrated into product cards on demand via /products/by-ids.
 */
export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      record: (id) =>
        set((s) => ({ ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, MAX) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'hp-recently-viewed' },
  ),
);
