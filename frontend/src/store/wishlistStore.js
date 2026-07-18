import { create } from 'zustand';
import api from '../api/axios';

export const useWishlistStore = create((set, get) => ({
  wishlistedIds: new Set(),
  items: [],
  loading: false,
  fetched: false,

  fetchWishlist: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/products/wishlist/');
      const items = data.results || data;
      const ids = new Set(items.map(item => item.product.id));
      set({ items, wishlistedIds: ids, loading: false, fetched: true });
    } catch {
      set({ loading: false });
    }
  },

  isWishlisted: (productId) => {
    return get().wishlistedIds.has(productId);
  },

  toggleWishlist: async (productId) => {
    const { wishlistedIds } = get();
    const isCurrently = wishlistedIds.has(productId);

    if (isCurrently) {
      // Optimistic remove
      const newIds = new Set(wishlistedIds);
      newIds.delete(productId);
      set({
        wishlistedIds: newIds,
        items: get().items.filter(item => item.product.id !== productId),
      });
      try {
        await api.delete(`/products/wishlist/${productId}/`);
      } catch {
        // Revert on failure
        const revertIds = new Set(get().wishlistedIds);
        revertIds.add(productId);
        set({ wishlistedIds: revertIds });
      }
      return { added: false };
    } else {
      // Optimistic add
      const newIds = new Set(wishlistedIds);
      newIds.add(productId);
      set({ wishlistedIds: newIds });
      try {
        await api.post('/products/wishlist/', { product_id: productId });
        // Refetch to get full product data in items list
        get().fetchWishlist();
      } catch {
        // Revert on failure
        const revertIds = new Set(get().wishlistedIds);
        revertIds.delete(productId);
        set({ wishlistedIds: revertIds });
      }
      return { added: true };
    }
  },

  clearWishlist: () => {
    set({ wishlistedIds: new Set(), items: [], fetched: false });
  },
}));
