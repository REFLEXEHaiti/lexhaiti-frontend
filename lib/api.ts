// lib/api.ts
// ═══════════════════════════════════════════════════════════════
// IDEA Haiti — Client Axios multi-tenant
// Injecte automatiquement :
//   - Le token JWT dans Authorization
//   - Le slug du tenant dans X-Tenant-ID (requis par le backend)
// ═══════════════════════════════════════════════════════════════

import axios from 'axios';

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '') + '/api';

// Le slug du tenant est fixé par variable d'env pour chaque projet
// LexHaiti    → NEXT_PUBLIC_TENANT_SLUG=lex
// TechPro     → NEXT_PUBLIC_TENANT_SLUG=techpro
// MediForm    → NEXT_PUBLIC_TENANT_SLUG=mediform
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'lex';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    // Header tenant — identifie la plateforme à chaque requête
    'X-Tenant-ID': TENANT_SLUG,
  },
});

// ── Intercepteur requête : injecte JWT ───────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Toujours forcer le tenant slug (sécurité)
    config.headers['X-Tenant-ID'] = TENANT_SLUG;
  }
  return config;
});

// ── Intercepteur réponse : gère les erreurs 401 ──────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('utilisateur');
      document.cookie = 'access_token=; path=/; max-age=0';
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/connexion';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { TENANT_SLUG };
