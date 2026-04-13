// app/auth/connexion/page.tsx
// ═══════════════════════════════════════════════════════════════
// IDEA Haiti — Page de connexion
// ✅ COMMUN AUX 3 PLATEFORMES
// Le design s'adapte automatiquement via les variables CSS du tenant
// (--tenant-primaire, --tenant-secondaire)
// ═══════════════════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';

export default function PageConnexion() {
  const { seConnecter, chargement } = useAuth();
  const { config } = useTenant();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [voirMDP, setVoirMDP] = useState(false);
  const [erreur, setErreur] = useState('');

  // Couleurs du tenant — fallback sur des valeurs neutres si pas encore chargé
  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';
  const nomPlateforme = config?.nom ?? 'IDEA Haiti';
  const slogan        = config?.sloganCourt ?? 'Formation professionnelle';

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setErreur('Email invalide'); return; }
    setErreur('');
    try {
      await seConnecter(email, motDePasse);
    } catch {
      setErreur('Email ou mot de passe incorrect');
    }
  };

  const inpStyle: React.CSSProperties = {
    width: '100%', padding: '16px 16px 16px 48px',
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.18)',
    borderRadius: 12, fontSize: 16, outline: 'none',
    color: 'white', boxSizing: 'border-box', transition: 'border-color 0.2s',
    fontFamily: "'Helvetica Neue',Arial,sans-serif",
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${primaire}dd 0%, ${primaire}99 40%, ${primaire}66 100%)`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Fond texturé */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px 0', position: 'relative', zIndex: 1 }}>

        {/* Logo + nom */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: secondaire, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 22, fontFamily: 'Georgia,serif' }}>
              {nomPlateforme.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(22px,4vw,32px)', color: 'white', marginBottom: 6, fontWeight: 'normal' }}>
            {nomPlateforme}
          </h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {slogan}
          </p>
          <div style={{ width: 40, height: 2, background: secondaire, margin: '14px auto 0', borderRadius: 2 }} />
        </div>

        {/* Formulaire */}
        <form onSubmit={soumettre} style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.55, fontSize: 18 }}>✉️</span>
            <input
              type="email" value={email} required
              onChange={e => { setEmail(e.target.value); setErreur(''); }}
              placeholder="Adresse email"
              style={inpStyle}
              onFocus={e => { e.target.style.borderColor = secondaire; e.target.style.background = 'rgba(255,255,255,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.18)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
            />
          </div>

          {/* Mot de passe */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.55, fontSize: 18 }}>🔒</span>
            <input
              type={voirMDP ? 'text' : 'password'} value={motDePasse} required
              onChange={e => setMotDePasse(e.target.value)}
              placeholder="Mot de passe"
              style={{ ...inpStyle, paddingRight: 48 }}
              onFocus={e => { e.target.style.borderColor = secondaire; e.target.style.background = 'rgba(255,255,255,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.18)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
            />
            <button type="button" onClick={() => setVoirMDP(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 16 }}>
              {voirMDP ? '🙈' : '👁'}
            </button>
          </div>

          {/* Lien mot de passe oublié */}
          <div style={{ textAlign: 'right', marginTop: -6 }}>
            <Link href="/auth/mot-de-passe-oublie" style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Erreur inline */}
          {erreur && (
            <div style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#FCA5A5', textAlign: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
              ⚠ {erreur}
            </div>
          )}

          {/* Bouton connexion */}
          <button
            type="submit" disabled={chargement}
            style={{ width: '100%', padding: '17px', background: chargement ? 'rgba(0,0,0,0.3)' : secondaire, color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16, cursor: chargement ? 'not-allowed' : 'pointer', boxShadow: `0 8px 28px ${secondaire}55`, marginTop: 4, transition: 'opacity 0.2s' }}
          >
            {chargement ? 'Connexion en cours…' : 'Se connecter →'}
          </button>

          {/* Lien inscription */}
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px' }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
              Pas encore de compte ?{' '}
            </span>
            <Link href="/auth/inscription" style={{ color: secondaire, fontWeight: 800, textDecoration: 'none', fontSize: 14, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
              S'inscrire gratuitement →
            </Link>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
              ← Retour à l'accueil
            </Link>
          </div>
        </form>
      </div>

      {/* Partenaires en bas */}
      {config?.partenaires && config.partenaires.length > 0 && (
        <div style={{ position: 'relative', zIndex: 1, padding: '24px 16px 28px', textAlign: 'center' }}>
          <div style={{ width: '70%', height: 1, background: 'rgba(255,255,255,0.12)', margin: '0 auto 16px' }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {config.partenaires.map((p, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.12)', color: 'white', padding: '6px 14px', borderRadius: 6, fontSize: 11, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600 }}>
                {p.nom}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
