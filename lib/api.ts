import axios from 'axios';

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '') + '/api';
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'lex';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': TENANT_SLUG,
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Lire depuis idea-auth-storage OU access_token
    const raw = localStorage.getItem('idea-auth-storage');
    const token = raw ? JSON.parse(raw)?.state?.token : localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Tenant-ID'] = TENANT_SLUG;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const url = error.config?.url ?? '';
      // Ne jamais rediriger pour ces endpoints
      const ignorer = url.includes('/auth/') || 
                      url.includes('/notifications') || 
                      url.includes('/analytics') ||
                      url.includes('/sponsors') ||
                      url.includes('/config');
                      url.includes('/profils');
      const onAuthPage = window.location.pathname.startsWith('/auth/');

      if (!ignorer && !onAuthPage) {
        localStorage.removeItem('idea-auth-storage');
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        window.location.replace('/auth/connexion');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { TENANT_SLUG };