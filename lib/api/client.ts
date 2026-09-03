import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

let BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ubsglobalapp.com/api';

if (BASE_URL) {
  BASE_URL = BASE_URL.replace(/\/+$/, '');
  if (!BASE_URL.endsWith('/api')) {
    BASE_URL += '/api';
  }
} else {
  BASE_URL = 'https://api.ubsglobalapp.com/api';
}

console.log('🔌 [API Client] Initialized with Base URL:', BASE_URL);

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

// Centralized Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Strip redundant /api prefixes to prevent duplicate /api/api paths
    if (config.url && (config.url.startsWith('/api/') || config.url === '/api')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    // 2. Attach Authorization token safely in client environment
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        if (token && token.trim() !== '' && token !== 'null' && token !== 'undefined') {
          config.headers.Authorization = `Bearer ${token.trim()}`;
        }

        // Attach user preferred language header
        const userLang =
          localStorage.getItem('ubs_selected_language') ||
          localStorage.getItem('language') ||
          'en';
        config.headers['X-User-Language'] = userLang;
      } catch (err) {
        console.warn('[API Client] Error reading auth from localStorage:', err);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config, response } = error;

    if (!config) {
      return Promise.reject(error);
    }

    // Retry only on genuine network failure or 5xx server drops (never on 4xx client errors)
    const isNetworkOrServerError = !response || (response.status >= 500 && response.status <= 599);
    config.__retryCount = config.__retryCount || 0;

    if (isNetworkOrServerError && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      const delay = RETRY_DELAY_BASE * Math.pow(2, config.__retryCount);
      console.warn(
        `⚠️ [API Retry] ${config.method?.toUpperCase()} ${config.url} failed. Retrying in ${delay}ms... (Attempt ${config.__retryCount}/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(config);
    }

    // Handle 401 Unauthorized safely
    if (response?.status === 401 && typeof window !== 'undefined') {
      const sentAuthHeader = Boolean(config.headers?.Authorization);
      const resMessage = (response.data?.message || '').toLowerCase();
      const isTokenInvalid =
        resMessage.includes('token') ||
        resMessage.includes('expired') ||
        resMessage.includes('user not found') ||
        resMessage.includes('not authorized');

      // Only invalidate stored session if the request actually sent credentials that failed
      if (sentAuthHeader && isTokenInvalid) {
        console.warn('🔒 [API Client] Authenticated request rejected with 401. Clearing stale session.');
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('auth_expiry');
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
        } catch (e) {
          console.error('[API Client] Error clearing credentials:', e);
        }

        // Only redirect to login if currently on an authenticated protected route
        const protectedRoutes = ['/profile', '/orders', '/checkout', '/seller', '/settings'];
        const currentPath = window.location.pathname;
        const isProtectedRoute = protectedRoutes.some((route) => currentPath.startsWith(route));
        const isAuthRoute =
          currentPath === '/login' || currentPath === '/signup' || currentPath === '/otp';

        if (isProtectedRoute && !isAuthRoute) {
          const redirectTarget = encodeURIComponent(currentPath + window.location.search);
          window.location.href = `/login?redirect=${redirectTarget}`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
