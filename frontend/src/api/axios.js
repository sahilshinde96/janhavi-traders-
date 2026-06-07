import axios from 'axios';

// Normalize the API URL. Ensure it has a trailing /api suffix even if configured with just the root domain.
let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
if (rawApiUrl && !rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  rawApiUrl = rawApiUrl.replace(/\/$/, '') + '/api';
}
const API_URL = rawApiUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post(
          `${API_URL}/auth/token/refresh/`,
          { refresh }
        );
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
