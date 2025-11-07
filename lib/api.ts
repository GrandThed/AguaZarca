import axios from 'axios';
import Cookies from 'js-cookie';

let redirectToLogin: (() => void) | null = null;

export const setRedirectToLogin = (callback: () => void) => {
  redirectToLogin = callback;
};

// API Configuration - centralized URL handling
const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    // Production fallback - use the actual production API
    return 'https://api.aguazarca.com.ar';
  }

  // If the base URL already ends with /api, use it as-is
  // Otherwise, append /api to the base URL
  if (baseUrl.endsWith('/api')) {
    return baseUrl;
  }

  return `${baseUrl}/api`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { data } = response.data;
          const { accessToken } = data;
          Cookies.set('token', accessToken, { expires: 1 });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          Cookies.remove('token');
          Cookies.remove('refreshToken');
          if (redirectToLogin) {
            redirectToLogin();
          } else {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;