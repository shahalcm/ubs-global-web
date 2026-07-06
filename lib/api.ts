import axios from 'axios';

let BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ubsglobalapp.com/api';

if (BASE_URL) {
  BASE_URL = BASE_URL.replace(/\/+$/, '');
  if (!BASE_URL.endsWith('/api')) {
    BASE_URL += '/api';
  }
} else {
  BASE_URL = 'https://api.ubsglobalapp.com/api';
}

console.log('🔌 [API Config] Web API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

api.interceptors.request.use(
  (config) => {
    if (config.url && (config.url.startsWith('/api/') || config.url === '/api')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config, response } = error;

    if (!config) {
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;

    const isNetworkError = !response || (response.status >= 500 && response.status <= 599);

    if (isNetworkError && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      const delay = RETRY_DELAY_BASE * Math.pow(2, config.__retryCount);
      console.warn(`⚠️ [API Retry] ${config.method?.toUpperCase()} ${config.url} failed. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    if (response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      // Redirect to login if on client side and not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/otp') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
