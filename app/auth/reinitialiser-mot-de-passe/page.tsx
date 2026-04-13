// app/auth/reinitialiser-mot-de-passe/page.tsx
// ✅ COMMUN AUX 3 PLATEFORMES

'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';

function FormReinit() {
  const { reinitialiserMotDePasse, chargement } = useAuth();
  const { config } = useTenant();
  const searchParams = useSearchParams();

  const primaire = config?.couleursTheme.primaire ?? '#1B3A6B';
  const token    = searchParams.get('token') ?? '';

  const [motDePasse, setMotDePasse]           = useState('');
  const [confirmation, setConfirmation]       = useState('');
  const [voirMDP, setVoirMDP]                 = useState(false);
  const [erreur, setErreur]                   = useState('');

  useEffect(() => {
    if (!token) setErreur('Lien invalide ou expiré. Demandez un nouveau lien.');
  }, [token]);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (motDePasse.length < 6) { setErreur('Minimum 6 caractères'); return; }
    if (motDePasse !== confirmation) { setErreur('Les mots de passe ne correspondent pas'); return; }
    setErreur('');
    await reinitialiserMotDePasse(token, motDePasse);
  };

  const inpStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', border: `1.5px solid ${erreur ? '#ef4444' : '#E2E8F0'}`,
    borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#0D1B2A', background: 'white',
  };

  return (
    <div style={{ background: 'white', borderRadius: 24, padding: 'clamp(28px,4vw,44px)', width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.10)', border: '1px solid #F1F5F9' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: '#0D1B2A', margin: '0 0 8px' }}>
          Nouveau mot de passe
        </h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B' }}>
          Choisissez un mot de passe sécurisé d'au moins 6 caractères.
        </p>
      </div>

      {erreur && !token ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#EF4444', margin: 0 }}>{erreur}</p>
          </div>
          <Link href="/auth/mot-de-passe-oublie" style={{ display: 'inline-block', padding: '14px 32px', background: primaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15 }}>
            Demander un nouveau lien
          </Link>
        </div>
      ) : (
        <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
              Nouveau mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input type={voirMDP ? 'text' : 'password'} value={motDePasse} required
                onChange={e => { setMotDePasse(e.target.value); setErreur(''); }}
                placeholder="Minimum 6 caractères"
                style={{ ...inpStyle, paddingRight: 44 }}
                onFocus={e => { e.target.style.borderColor = primaire; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
              />
              <button type="button" onClick={() => setVoirMDP(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 16 }}>
                {voirMDP ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
              Confirmer le mot de passe
            </label>
            <input type="password" value={confirmation} required
              onChange={e => { setConfirmation(e.target.value); setErreur(''); }}
              placeholder="Répétez le mot de passe"
              style={inpStyle}
              onFocus={e => { e.target.style.borderColor = primaire; }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
            />
          </div>

          {erreur && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#EF4444', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
              ⚠ {erreur}
            </div>
          )}

          <button type="submit" disabled={chargement || !token}
            style={{ width: '100%', padding: '16px', background: chargement ? '#94A3B8' : primaire, color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16, cursor: chargement ? 'not-allowed' : 'pointer' }}>
            {chargement ? 'Mise à jour…' : 'Changer le mot de passe →'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link href="/auth/connexion" style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
              ← Retour à la connexion
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function PageReinitialiser() {
  const { config } = useTenant();
  const primaire = config?.couleursTheme.primaire ?? '#1B3A6B';

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${primaire}22 0%, white 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <Suspense fallback={<div style={{ color: '#64748B', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Chargement…</div>}>
        <FormReinit />
      </Suspense>
    </div>
  );
}
