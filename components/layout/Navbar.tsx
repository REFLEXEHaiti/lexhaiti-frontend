'use client';
// components/layout/Navbar.tsx — LexHaiti

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';
import ClochNotifications from '@/components/notifications/ClochNotifications';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin', FORMATEUR: 'Formateur', APPRENANT: 'Juriste', SPECTATEUR: 'Observateur',
};

export default function Navbar() {
  const { estConnecte, utilisateur, _hasHydrated } = useAuthStore();
  const { seDeconnecter } = useAuth();
  const { config } = useTenant();
  const pathname = usePathname();

  const [profilOuvert, setProfilOuvert] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const profilRef = useRef<HTMLDivElement>(null);

  const primaire   = config?.couleursTheme.primaire   ?? '#8B0000';
  const secondaire = config?.couleursTheme.secondaire ?? '#D4AF37';
  const nom        = config?.nom ?? 'LexHaiti';
  const sloganCourt = config?.sloganCourt ?? 'DROIT & AVOCATURE';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profilRef.current && !profilRef.current.contains(e.target as Node)) setProfilOuvert(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const moduleActif = (mod: string) => !config?.modulesActifs || (Array.isArray(config.modulesActifs) ? config.modulesActifs.includes(mod) : true);
  const isActive    = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const liensNav = [
    ...(moduleActif('debats')       ? [{ label: 'Débats',       href: '/debats' }]       : []),
    ...(moduleActif('tournois')     ? [{ label: 'Tournois',     href: '/tournois' }]     : []),
    { label: 'Formations', href: '/formations' },
    { label: 'Lives',      href: '/lives' },
    ...(moduleActif('bibliotheque') ? [{ label: 'Bibliothèque', href: '/bibliotheque' }] : []),
  ];

  const navLinkStyle = (href: string): React.CSSProperties => ({
    fontFamily: "'Helvetica Neue',Arial,sans-serif",
    fontSize: 13,
    fontWeight: isActive(href) ? 700 : 400,
    color: isActive(href) ? primaire : '#64748B',
    textDecoration: 'none',
    padding: '6px 0',
    borderBottom: isActive(href) ? `2px solid ${primaire}` : '2px solid transparent',
    transition: 'color 0.15s, border-color 0.15s',
    whiteSpace: 'nowrap' as const,
  });

  // Liens du menu profil — PAS de classement, profil pointe vers /profil/[id]
  const liensMenu = [
    { href: '/dashboard',                    label: 'Tableau de bord' },
    { href: `/profil/${utilisateur?.id}`,    label: 'Mon profil' },
    { href: '/premium',                      label: 'Mon abonnement' },
    ...(utilisateur?.role === 'ADMIN' ? [{ href: '/admin', label: 'Administration' }] : []),
  ];

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: 'white', borderBottom: '1px solid #E8E4DC', height: 64, display: 'flex', alignItems: 'center', padding: '0 clamp(16px,4vw,40px)' }}>
      <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: primaire, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: primaire, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 14 }}>
            {nom.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: primaire, lineHeight: 1 }}>{nom}</div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 9, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{sloganCourt}</div>
          </div>
        </Link>

        {/* Liens nav — desktop */}
        <div className="idea-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
          {liensNav.map(({ label, href }) => (
            <Link key={href} href={href} style={navLinkStyle(href)}>{label}</Link>
          ))}
        </div>

        {/* Actions droite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto', flexShrink: 0 }}>
          {!_hasHydrated ? null : estConnecte ? (
            <>
              <ClochNotifications />
              <div style={{ position: 'relative' }} ref={profilRef}>
                <button onClick={() => setProfilOuvert(v => !v)}
                  style={{ width: 40, height: 40, borderRadius: '50%', background: primaire, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 14, color: 'white' }}>
                  {(utilisateur?.prenom?.[0] ?? '') + (utilisateur?.nom?.[0] ?? '')}
                </button>

                {profilOuvert && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 220, zIndex: 300, overflow: 'hidden' }}>
                    {/* En-tête profil */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5F0E8', background: '#FAFAF8' }}>
                      <div style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{utilisateur?.prenom} {utilisateur?.nom}</div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{utilisateur?.email}</div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: primaire, fontWeight: 700, marginTop: 4 }}>
                        {ROLE_LABEL[utilisateur?.role ?? ''] ?? utilisateur?.role}
                      </div>
                    </div>

                    {/* Liens */}
                    {liensMenu.map(({ href, label }) => (
                      <Link key={href} href={href} onClick={() => setProfilOuvert(false)}
                        style={{ display: 'block', padding: '11px 16px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', textDecoration: 'none', transition: 'background 0.1s', borderBottom: '1px solid #F5F0E8' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8F7F4'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        {label}
                      </Link>
                    ))}

                    {/* Déconnexion */}
                    <button onClick={() => { setProfilOuvert(false); seDeconnecter(); }}
                      style={{ display: 'block', width: '100%', padding: '11px 16px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/connexion" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: primaire, textDecoration: 'none', padding: '8px 16px', border: `2px solid ${primaire}`, borderRadius: 6 }}>
                Connexion
              </Link>
              <Link href="/auth/inscription" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: 'white', textDecoration: 'none', padding: '8px 16px', background: primaire, borderRadius: 6 }}>
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
