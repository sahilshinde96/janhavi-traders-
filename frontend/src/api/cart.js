import api from './axios';

export const getCart = () => api.get('/cart/');
export const addToCart = (product_id, quantity = 1) => api.post('/cart/add/', { product_id, quantity });
export const updateCartItem = (itemId, quantity) => api.put(`/cart/items/${itemId}/`, { quantity });
export const removeCartItem = (itemId) => api.delete(`/cart/items/${itemId}/`);
export const clearCart = () => api.delete('/cart/');
export const applyCoupon = (code) => api.post('/discounts/apply/', { code });
export const removeCoupon = () => api.delete('/discounts/apply/');
