// middleware.ts
// ═══════════════════════════════════════════════════════════════
// IDEA Haiti — Middleware Next.js
// Commun aux 3 plateformes
// Protège les routes privées et redirige vers /auth/connexion
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une connexion
const ROUTES_PROTEGEES = ['/dashboard', '/admin', '/paiement', '/profil'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  const estProtegee = ROUTES_PROTEGEES.some(r => pathname.startsWith(r));

  if (estProtegee && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/connexion';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/paiement/:path*', '/profil/:path*'],
};
