import api from './axios';

export const getProducts = (params) => api.get('/products/', { params });
export const getProductBySlug = (slug) => api.get(`/products/${slug}/`);
export const getCategories = () => api.get('/products/categories/');
export const getFeaturedProducts = () => api.get('/products/', { params: { is_featured: true, limit: 8 } });
export const getNewArrivals = () => api.get('/products/', { params: { ordering: '-created_at', limit: 8 } });
export const createProduct = (data) => api.post('/products/', data);
export const updateProduct = (slug, data) => api.patch(`/products/${slug}/`, data);
export const deleteProduct = (slug) => api.delete(`/products/${slug}/`);
export const createCategory = (data) => api.post('/products/categories/', data);
export const updateCategory = (id, data) => api.patch(`/products/categories/${id}/`, data);
export const deleteCategory = (id) => api.delete(`/products/categories/${id}/`);
