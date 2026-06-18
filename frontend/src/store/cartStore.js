import { create } from 'zustand';
import api from '../api/axios';

export const useCartStore = create((set, get) => ({
  cart: null,
  isOpen: false,
  loading: false,

  fetchCart: async () => {
    try {
      const { data } = await api.get('/cart/');
      set({ cart: data });
    } catch {
      // Silently fail if not logged in
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/cart/add/', { product_id: productId, quantity });
      set({ cart: data, isOpen: true, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.error || 'Failed to add to cart' };
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/items/${itemId}/`, { quantity });
      set({ cart: data });
    } catch {}
  },

  removeItem: async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/items/${itemId}/`);
      set({ cart: data });
    } catch {}
  },

  // clearCart was previously synchronous, but Checkout.jsx awaited it.
  // We updated it to be async, calling DELETE /cart/ on the backend server to clear the persistent session cart
  // before setting the client-side cart state to null (BUG-09 fix).
  clearCart: async () => {
    try { await api.delete('/cart/'); } catch {}
    set({ cart: null });
  },


  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  get itemCount() {
    return get().cart?.item_count || 0;
  },
}));
