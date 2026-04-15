// app/auth/connexion/page.tsx — LexHaiti + bannière sponsors
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';

export default function PageConnexion() {
  const { seConnecter, chargement } = useAuth();
  const { config } = useTenant();

  const primaire   = config?.couleursTheme.primaire   ?? '#8B0000';
  const secondaire = config?.couleursTheme.secondaire ?? '#D4AF37';
  const nomCourt   = config?.nom ?? 'LexHaiti';

  const [email, setEmail]         = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [voirMDP, setVoirMDP]     = useState(false);
  const [erreur, setErreur]       = useState('');
  const [sponsors, setSponsors]   = useState<any[]>([]);
  const defilRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(0);

  useEffect(() => {
    api.get('/sponsors').then(({ data }) => { if (Array.isArray(data)) setSponsors(data); }).catch(() => {});
  }, []);

  useEffect(() => {
    const el = defilRef.current;
    if (!el || sponsors.length === 0) return;
    const anim = setInterval(() => {
      posRef.current += 0.4;
      if (posRef.current >= el.scrollWidth / 2) posRef.current = 0;
      el.scrollLeft = posRef.current;
    }, 16);
    return () => clearInterval(anim);
  }, [sponsors]);

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
    background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.18)',
    borderRadius: 12, fontSize: 16, outline: 'none', color: 'white',
    fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, #1A0000 0%, ${primaire} 60%, #5C0000 100%)`, display: 'flex', flexDirection: 'column' }}>

      {/* Bannière sponsors en haut */}
      {sponsors.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 0' }}>
          <div ref={defilRef} style={{ display: 'flex', overflow: 'hidden', alignItems: 'center', scrollBehavior: 'auto' }}>
            {[...sponsors, ...sponsors].map((s, i) => (
              <div key={i} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 140, height: 36, margin: '0 12px', opacity: 0.6 }}>
                {s.logoUrl ? (
                  <img src={s.logoUrl} alt={s.nom} style={{ maxWidth: 120, maxHeight: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                ) : (
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{s.nom}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire centré */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Logo */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${secondaire}20`, border: `2px solid ${secondaire}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 900, color: secondaire }}>LE</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: 'white', margin: '0 0 6px', fontWeight: 'normal', textAlign: 'center' }}>{nomCourt}</h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 36px' }}>
            {config?.sloganCourt ?? 'DROIT & AVOCATURE'}
          </p>
          <div style={{ width: '100%', max: 480 }}>
            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${secondaire}, transparent)`, marginBottom: 32 }} />
          </div>

          <form onSubmit={soumettre} style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.55, fontSize: 18 }}>✉️</span>
              <input type="email" value={email} required onChange={e => { setEmail(e.target.value); setErreur(''); }} placeholder="Adresse email" style={inpStyle}
                onFocus={e => { e.target.style.borderColor = secondaire; e.target.style.background = 'rgba(255,255,255,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.18)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }} />
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.55, fontSize: 18 }}>🔒</span>
              <input type={voirMDP ? 'text' : 'password'} value={motDePasse} required onChange={e => { setMotDePasse(e.target.value); setErreur(''); }} placeholder="Mot de passe" style={{ ...inpStyle, paddingRight: 44 }}
                onFocus={e => { e.target.style.borderColor = secondaire; e.target.style.background = 'rgba(255,255,255,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.18)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }} />
              <button type="button" onClick={() => setVoirMDP(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
                {voirMDP ? '🙈' : '👁'}
              </button>
            </div>

            {erreur && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', textAlign: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#FCA5A5' }}>
                ⚠ {erreur}
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <Link href="/auth/mot-de-passe-oublie" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" disabled={chargement}
              style={{ width: '100%', padding: '16px', background: chargement ? 'rgba(255,255,255,0.2)' : secondaire, color: chargement ? 'rgba(255,255,255,0.5)' : '#1A0000', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 16, cursor: chargement ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              {chargement ? 'Connexion…' : 'Se connecter →'}
            </button>

            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
              Pas encore de compte ?{' '}
              <Link href="/auth/inscription" style={{ color: secondaire, fontWeight: 700, textDecoration: 'none' }}>
                S'inscrire gratuitement →
              </Link>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href="/" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                ← Retour à l'accueil
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
