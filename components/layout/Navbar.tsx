// components/layout/Navbar.tsx
// ✅ COMMUN AUX 3 PLATEFORMES
// La navbar s'adapte automatiquement :
//  - Nom et couleur selon le tenant
//  - Liens affichés uniquement si le module est actif
//  - Ex: "Débats" et "Tournois" masqués sur TechPro et MediForm

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';
import ClochNotifications from '@/components/notifications/ClochNotifications';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin', FORMATEUR: 'Formateur',
  APPRENANT: 'Apprenant', SPECTATEUR: 'Spectateur',
};

export default function Navbar() {
  const { estConnecte, utilisateur, _hasHydrated } = useAuthStore();
  const { seDeconnecter } = useAuth();
  const { config, moduleActif } = useTenant();
  const pathname  = usePathname();

  const [menuOuvert,  setMenuOuvert]  = useState(false);
  const [profilOuvert, setProfilOuvert] = useState(false);
  const profilRef = useRef<HTMLDivElement>(null);

  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';
  const nomCourt   = config?.nom ?? 'IDEA Haiti';

  useEffect(() => { setMenuOuvert(false); setProfilOuvert(false); }, [pathname]);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profilRef.current && !profilRef.current.contains(e.target as Node)) setProfilOuvert(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const initiales = utilisateur ? (utilisateur.prenom?.[0] ?? '') + (utilisateur.nom?.[0] ?? '') : '?';

  // Liens conditionnels selon les modules actifs du tenant
  const liensNav = [
    ...(moduleActif('debats')    ? [{ label: 'Débats',      href: '/debats' }]     : []),
    ...(moduleActif('tournois')  ? [{ label: 'Tournois',    href: '/tournois' }]   : []),
    { label: 'Formations', href: '/formations' },
    { label: 'Lives',      href: '/lives' },
    ...(moduleActif('bibliotheque') ? [{ label: 'Bibliothèque', href: '/bibliotheque' }] : []),
  ];

  const navLinkStyle = (href: string): React.CSSProperties => ({
    padding: '0 14px', height: 56, display: 'flex', alignItems: 'center',
    fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    color: isActive(href) ? primaire : '#64748B',
    textDecoration: 'none',
    borderBottom: isActive(href) ? `2px solid ${primaire}` : '2px solid transparent',
    transition: 'color .15s, border-color .15s', whiteSpace: 'nowrap',
  });

  return (
    <>
      <nav style={{ height: 56, background: 'white', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px,4vw,40px)' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: primaire, flexShrink: 0 }}>
          {/* Carré de couleur comme logo — chaque frontend peut remplacer par une vraie image */}
          <div style={{ width: 28, height: 28, borderRadius: 6, background: primaire, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 12, fontFamily: 'Georgia,serif' }}>
              {nomCourt.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: primaire }}>
            {nomCourt}
          </span>
          {config?.sloganCourt && (
            <>
              <span style={{ width: 1, height: 14, background: '#E2E8F0', margin: '0 2px' }} />
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8' }}>
                {config.sloganCourt}
              </span>
            </>
          )}
        </Link>

        {/* Liens navigation — masqués sur mobile */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }} className="idea-nav-links">
          {liensNav.map(({ label, href }) => (
            <Link key={href} href={href} style={navLinkStyle(href)}>
              {label}
            </Link>
          ))}
          {/* Classement */}
          <Link href="/classement" style={navLinkStyle('/classement')}>Classement</Link>
        </div>

        {/* Droite : actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {!_hasHydrated ? null : estConnecte ? (
            <>
              <ClochNotifications />
              <div style={{ position: 'relative' }} ref={profilRef}>
                <button
                  onClick={() => setProfilOuvert(o => !o)}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: primaire, color: 'white', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={`${utilisateur?.prenom} ${utilisateur?.nom}`}
                >
                  {initiales.toUpperCase()}
                </button>

                {/* Dropdown profil */}
                {profilOuvert && (
                  <div style={{ position: 'absolute', top: 44, right: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 220, zIndex: 300, overflow: 'hidden' }}>
                    {/* Entête */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: `${primaire}08` }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, color: '#0D1B2A' }}>
                        {utilisateur?.prenom} {utilisateur?.nom}
                      </div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        {utilisateur?.email}
                      </div>
                      <div style={{ display: 'inline-block', marginTop: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', border: `1px solid ${primaire}40`, color: primaire, borderRadius: 4 }}>
                        {ROLE_LABEL[utilisateur?.role ?? ''] ?? utilisateur?.role}
                      </div>
                    </div>

                    {/* Liens */}
                    {[
                      { href: '/dashboard', label: 'Tableau de bord' },
                      { href: '/profil/modifier', label: 'Mon profil' },
                      { href: '/classement', label: 'Classement' },
                      { href: '/premium', label: 'Mon abonnement' },
                      ...(utilisateur?.role === 'ADMIN' ? [{ href: '/admin', label: 'Administration' }] : []),
                    ].map(({ href, label }) => (
                      <Link key={href} href={href} onClick={() => setProfilOuvert(false)}
                        style={{ display: 'block', padding: '11px 16px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', textDecoration: 'none', transition: 'background 0.1s' }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.background = `${primaire}08`; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}>
                        {label}
                      </Link>
                    ))}

                    <div style={{ borderTop: '1px solid #F1F5F9' }}>
                      <button onClick={() => { setProfilOuvert(false); seDeconnecter(); }}
                        style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#EF4444', textAlign: 'left' }}>
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/auth/connexion" style={{ padding: '8px 16px', border: `1px solid ${primaire}`, borderRadius: 8, color: primaire, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 600 }}>
                Connexion
              </Link>
              <Link href="/auth/inscription" style={{ padding: '8px 16px', background: primaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 600 }}>
                S'inscrire
              </Link>
            </div>
          )}

          {/* Burger mobile */}
          <button
            onClick={() => setMenuOuvert(o => !o)}
            className="idea-burger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none', flexDirection: 'column', gap: 5 }}
            aria-label="Menu"
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: 'block', width: 22, height: 2, background: primaire, borderRadius: 2 }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {menuOuvert && (
        <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 190, padding: '80px 24px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setMenuOuvert(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748B' }}>✕</button>
          {liensNav.map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setMenuOuvert(false)}
              style={{ padding: '14px 0', fontFamily: 'Georgia,serif', fontSize: 20, color: isActive(href) ? primaire : '#0D1B2A', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
              {label}
            </Link>
          ))}
          {!estConnecte && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="/auth/connexion" onClick={() => setMenuOuvert(false)} style={{ padding: '14px', border: `1.5px solid ${primaire}`, borderRadius: 12, color: primaire, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, textAlign: 'center' }}>
                Connexion
              </Link>
              <Link href="/auth/inscription" onClick={() => setMenuOuvert(false)} style={{ padding: '14px', background: primaire, color: 'white', borderRadius: 12, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, textAlign: 'center' }}>
                S'inscrire gratuitement
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
