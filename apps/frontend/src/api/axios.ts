import axios from 'axios';
import { useAuthStore } from '@/features/auth/stores/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop if refresh itself fails
      if (originalRequest.url === '/refresh' || originalRequest.url === '/login') {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const { refreshAccessToken } = await import('@/features/auth/api/authApi');
          const data = await refreshAccessToken(refreshToken);
          
          useAuthStore.getState().setAuth(data.access_token, data.refresh_token, useAuthStore.getState().user);
          
          // Update the header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);
