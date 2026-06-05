import api from './axios';

export const getOrders = () => api.get('/orders/');
export const getOrderById = (id) => api.get(`/orders/${id}/`);
export const placeOrder = (data) => api.post('/orders/place/', data);
export const getAddresses = () => api.get('/auth/addresses/');
export const addAddress = (data) => api.post('/auth/addresses/', data);
export const updateAddress = (id, data) => api.patch(`/auth/addresses/${id}/`, data);
export const deleteAddress = (id) => api.delete(`/auth/addresses/${id}/`);
