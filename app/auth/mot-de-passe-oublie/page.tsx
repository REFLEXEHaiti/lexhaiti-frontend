// app/auth/mot-de-passe-oublie/page.tsx
// ✅ COMMUN AUX 3 PLATEFORMES
// S'adapte automatiquement aux couleurs du tenant via useTenant()

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';

export default function PageMotDePasseOublie() {
  const { motDePasseOublie, chargement } = useAuth();
  const { config } = useTenant();

  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';

  const [email, setEmail]       = useState('');
  const [envoye, setEnvoye]     = useState(false);
  const [erreur, setErreur]     = useState('');

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setErreur('Adresse email invalide'); return; }
    setErreur('');
    await motDePasseOublie(email);
    setEnvoye(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${primaire}22 0%, white 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 'clamp(28px,4vw,44px)', width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.10)', border: '1px solid #F1F5F9' }}>

        {/* Icône */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${primaire}15`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            🔑
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: '#0D1B2A', margin: '0 0 8px' }}>
            Mot de passe oublié
          </h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
            Entrez votre adresse email. Si un compte existe, vous recevrez un lien de réinitialisation.
          </p>
        </div>

        {envoye ? (
          /* ── Message confirmation ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#166534', lineHeight: 1.6, margin: 0 }}>
                Si <strong>{email}</strong> est associé à un compte, vous recevrez un email dans quelques minutes.
              </p>
            </div>
            <Link href="/auth/connexion" style={{ display: 'inline-block', padding: '14px 32px', background: primaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15 }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          /* ── Formulaire ── */
          <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                Adresse email
              </label>
              <input
                type="email" value={email} required
                onChange={e => { setEmail(e.target.value); setErreur(''); }}
                placeholder="votre@email.com"
                style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${erreur ? '#ef4444' : '#E2E8F0'}`, borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#0D1B2A', background: 'white', transition: 'border-color 0.2s' }}
                onFocus={e => { e.target.style.borderColor = primaire; }}
                onBlur={e => { e.target.style.borderColor = erreur ? '#ef4444' : '#E2E8F0'; }}
              />
              {erreur && <span style={{ fontSize: 12, color: '#ef4444', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{erreur}</span>}
            </div>

            <button type="submit" disabled={chargement}
              style={{ width: '100%', padding: '16px', background: chargement ? '#94A3B8' : primaire, color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16, cursor: chargement ? 'not-allowed' : 'pointer' }}>
              {chargement ? 'Envoi en cours…' : 'Envoyer le lien →'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link href="/auth/connexion" style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
