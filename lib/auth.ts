// lib/auth.ts
// ═══════════════════════════════════════════════════════════════
// IDEA Haiti — Utilitaires d'authentification
// Commun aux 3 plateformes (LexHaiti, TechPro, MediForm)
// Le token JWT contient maintenant tenantId et tenantSlug
// ═══════════════════════════════════════════════════════════════

import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  tenantSlug: string;
  exp: number;
}

export function decoderToken(token: string): TokenPayload | null {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

export function tokenEstValide(token: string): boolean {
  const payload = decoderToken(token);
  if (!payload) return false;
  return payload.exp > Date.now() / 1000;
}

export function sauvegarderSession(token: string, utilisateur: object) {
  localStorage.setItem('access_token', token);
  localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
  // Cookie pour le middleware Next.js (routes protégées)
  document.cookie = `access_token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Strict`;
}

export function supprimerSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('utilisateur');
  document.cookie = 'access_token=; path=/; max-age=0';
}

export function getUtilisateurLocal() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('utilisateur');
  return data ? JSON.parse(data) : null;
}

export function getTenantSlugLocal(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  const payload = decoderToken(token);
  return payload?.tenantSlug ?? null;
}
