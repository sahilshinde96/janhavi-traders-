import api from './axios';

export const sendOtp = (data) => api.post('/auth/send-otp/', data);
export const verifyOtp = (data) => api.post('/auth/verify-otp/', data);
export const getProfile = () => api.get('/auth/profile/');
export const updateProfile = (data) => api.patch('/auth/profile/', data);
export const refreshToken = (refresh) => api.post('/auth/token/refresh/', { refresh });
