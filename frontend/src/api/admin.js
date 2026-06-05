import api from './axios';

export const getDashboardStats = () => api.get('/orders/admin/dashboard/');
export const getAdminOrders = (params) => api.get('/orders/admin/', { params });
export const getAdminOrderById = (id) => api.get(`/orders/admin/${id}/`);
export const updateOrderStatus = (id, status) => api.put(`/orders/admin/${id}/status/`, { status });
export const updateShipment = (orderId, data) => api.post(`/shipments/admin/order/${orderId}/`, data);
export const getCoupons = () => api.get('/discounts/admin/coupons/');
export const createCoupon = (data) => api.post('/discounts/admin/coupons/', data);
export const updateCoupon = (id, data) => api.patch(`/discounts/admin/coupons/${id}/`, data);
export const deleteCoupon = (id) => api.delete(`/discounts/admin/coupons/${id}/`);
export const getInventory = (params) => api.get('/products/', { params });
export const updateStock = (slug, stock_qty) => api.patch(`/products/${slug}/`, { stock_qty });
