// app/auth/inscription/page.tsx
// ═══════════════════════════════════════════════════════════════
// IDEA Haiti — Page d'inscription
// ✅ COMMUN AUX 3 PLATEFORMES
// Les labels de rôles s'adaptent au domaine du tenant
// ═══════════════════════════════════════════════════════════════

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';

// Labels de rôle adaptés par tenant
const ROLES_PAR_TENANT: Record<string, { id: string; label: string }[]> = {
  lex:      [{ id: 'APPRENANT', label: 'Étudiant' }, { id: 'SPECTATEUR', label: 'Observateur' }, { id: 'FORMATEUR', label: 'Avocat/Prof' }],
  techpro:  [{ id: 'APPRENANT', label: 'Professionnel' }, { id: 'SPECTATEUR', label: 'Observateur' }, { id: 'FORMATEUR', label: 'Formateur' }],
  mediform: [{ id: 'APPRENANT', label: 'Infirmier(e)' }, { id: 'SPECTATEUR', label: 'Étudiant' }, { id: 'FORMATEUR', label: 'Médecin/Prof' }],
};

const VILLES = ['Port-au-Prince', 'Pétion-Ville', 'Cap-Haïtien', 'Gonaïves', 'Les Cayes', 'Jacmel', 'Saint-Marc', 'Miami', 'New York', 'Montréal', 'Paris', 'Autre'];

const inp: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  border: '1.5px solid #E2E8F0', borderRadius: 10,
  fontSize: 15, outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Helvetica Neue',Arial,sans-serif",
  color: '#0D1B2A', background: 'white', transition: 'border-color 0.2s',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13,
  fontFamily: "'Helvetica Neue',Arial,sans-serif",
  fontWeight: 600, color: '#1E293B', marginBottom: 6,
};

export default function PageInscription() {
  const { inscrire, chargement } = useAuth();
  const { config } = useTenant();

  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';
  const slug = config?.slug ?? 'lex';
  const roles = ROLES_PAR_TENANT[slug] ?? ROLES_PAR_TENANT['lex'];

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', motDePasse: '',
    ville: '', whatsapp: '', role: 'APPRENANT',
  });
  const [voirMDP, setVoirMDP] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGlobal, setErreurGlobal] = useState('');

  const set = useCallback((k: string, v: string) => setForm(f => ({ ...f, [k]: v })), []);

  const valider = () => {
    const e: Record<string, string> = {};
    if (!form.prenom.trim()) e.prenom = 'Requis';
    if (!form.nom.trim()) e.nom = 'Requis';
    if (!form.email.includes('@')) e.email = 'Email invalide';
    if (form.motDePasse.length < 6) e.motDePasse = 'Minimum 6 caractères';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valider()) return;
    setErreurGlobal('');
    try {
      await inscrire({ email: form.email, motDePasse: form.motDePasse, prenom: form.prenom, nom: form.nom, role: form.role, ville: form.ville, whatsapp: form.whatsapp });
    } catch (err: any) {
      setErreurGlobal(err?.message ?? "Erreur lors de l'inscription");
    }
  };

  const inpFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = primaire;
    e.target.style.background = '#F8FAFF';
  };
  const inpBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#E2E8F0';
    e.target.style.background = 'white';
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${primaire}22 0%, white 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,4vw,48px) 16px' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 'clamp(28px,4vw,44px)', width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.12)', border: '1px solid #F1F5F9' }}>

        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: primaire, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 18, fontFamily: 'Georgia,serif' }}>
              {(config?.nom ?? 'ID').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(22px,3vw,28px)', fontWeight: 700, color: '#0D1B2A', margin: '0 0 6px' }}>
            Créer un compte
          </h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B' }}>
            Rejoignez {config?.nom ?? 'la plateforme'}
          </p>
        </div>

        <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Rôle */}
          <div>
            <label style={lbl}>Vous êtes <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              {roles.map(r => (
                <button key={r.id} type="button" onClick={() => set('role', r.id)}
                  style={{ flex: 1, padding: '10px 6px', borderRadius: 10, border: `1.5px solid ${form.role === r.id ? primaire : '#E2E8F0'}`, background: form.role === r.id ? `${primaire}12` : 'white', color: form.role === r.id ? primaire : '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prénom + Nom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Prénom <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" value={form.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Jean"
                style={{ ...inp, borderColor: erreurs.prenom ? '#ef4444' : '#E2E8F0' }}
                onFocus={inpFocus} onBlur={inpBlur} />
              {erreurs.prenom && <span style={{ fontSize: 12, color: '#ef4444' }}>{erreurs.prenom}</span>}
            </div>
            <div>
              <label style={lbl}>Nom <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Pierre"
                style={{ ...inp, borderColor: erreurs.nom ? '#ef4444' : '#E2E8F0' }}
                onFocus={inpFocus} onBlur={inpBlur} />
              {erreurs.nom && <span style={{ fontSize: 12, color: '#ef4444' }}>{erreurs.nom}</span>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={lbl}>Email <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jean@exemple.com"
              style={{ ...inp, borderColor: erreurs.email ? '#ef4444' : '#E2E8F0' }}
              onFocus={inpFocus} onBlur={inpBlur} />
            {erreurs.email && <span style={{ fontSize: 12, color: '#ef4444' }}>{erreurs.email}</span>}
          </div>

          {/* Mot de passe */}
          <div>
            <label style={lbl}>Mot de passe <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input type={voirMDP ? 'text' : 'password'} value={form.motDePasse} onChange={e => set('motDePasse', e.target.value)} placeholder="Minimum 6 caractères"
                style={{ ...inp, paddingRight: 44, borderColor: erreurs.motDePasse ? '#ef4444' : '#E2E8F0' }}
                onFocus={inpFocus} onBlur={inpBlur} />
              <button type="button" onClick={() => setVoirMDP(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 16 }}>
                {voirMDP ? '🙈' : '👁'}
              </button>
            </div>
            {erreurs.motDePasse && <span style={{ fontSize: 12, color: '#ef4444' }}>{erreurs.motDePasse}</span>}
          </div>

          {/* Ville + WhatsApp */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Ville</label>
              <select value={form.ville} onChange={e => set('ville', e.target.value)}
                style={{ ...inp, appearance: 'none' as any }}
                onFocus={inpFocus as any} onBlur={inpBlur as any}>
                <option value="">— Choisir —</option>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+509 XXXX XXXX"
                style={inp} onFocus={inpFocus} onBlur={inpBlur} />
            </div>
          </div>

          {/* Erreur globale */}
          {erreurGlobal && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#EF4444', textAlign: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
              ⚠ {erreurGlobal}
            </div>
          )}

          {/* Bouton */}
          <button type="submit" disabled={chargement}
            style={{ width: '100%', padding: '17px', background: chargement ? '#94A3B8' : primaire, color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16, cursor: chargement ? 'not-allowed' : 'pointer', marginTop: 4, transition: 'background 0.2s' }}>
            {chargement ? 'Création du compte…' : 'Créer mon compte →'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, color: '#64748B', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
              Déjà inscrit ?{' '}
            </span>
            <Link href="/auth/connexion" style={{ color: primaire, fontWeight: 700, textDecoration: 'none', fontSize: 14, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
              Se connecter →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
