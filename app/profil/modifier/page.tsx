// app/profil/modifier/page.tsx — LexHaiti — Modifier profil + changer mot de passe
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const BORDEAUX = '#8B0000';
const OR = '#D4AF37';

const VILLES = ['Port-au-Prince','Pétion-Ville','Cap-Haïtien','Gonaïves','Les Cayes','Jacmel','Saint-Marc','Hinche','Jérémie','Fort-Liberté','Miami','New York','Boston','Montréal','Paris','Autre'];

export default function PageModifierProfil() {
  return <ProtectedRoute><Contenu /></ProtectedRoute>;
}

function Contenu() {
  const { utilisateur } = useAuthStore();
  const router = useRouter();
  const [onglet, setOnglet] = useState<'profil' | 'securite'>('profil');
  const [chargement, setChargement] = useState(false);
  const [form, setForm]             = useState({ prenom: '', nom: '', bio: '', ville: '', whatsapp: '' });
  const [mdp, setMdp]               = useState({ actuel: '', nouveau: '', confirmation: '' });
  const [voirMdp, setVoirMdp]       = useState({ actuel: false, nouveau: false, confirmation: false });

  useEffect(() => {
    if (utilisateur) setForm(f => ({ ...f, prenom: utilisateur.prenom ?? '', nom: utilisateur.nom ?? '' }));
    api.get('/profils/moi').then(({ data }) => {
      setForm({ prenom: data.prenom ?? '', nom: data.nom ?? '', bio: data.bio ?? '', ville: data.ville ?? '', whatsapp: data.whatsapp ?? '' });
    }).catch(() => {});
  }, [utilisateur]);

  const sauvegarderProfil = async (e: React.FormEvent) => {
    e.preventDefault(); setChargement(true);
    try {
      await api.patch('/profils/moi', form);
      toast.success('Profil mis à jour !');
      router.push(`/profil/${utilisateur?.id}`);
    } catch { toast.error('Erreur lors de la mise à jour'); }
    finally { setChargement(false); }
  };

  const changerMotDePasse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mdp.nouveau.length < 6) { toast.error('Le nouveau mot de passe doit avoir au moins 6 caractères'); return; }
    if (mdp.nouveau !== mdp.confirmation) { toast.error('Les mots de passe ne correspondent pas'); return; }
    setChargement(true);
    try {
      await api.patch('/auth/changer-mot-de-passe', { motDePasseActuel: mdp.actuel, nouveauMotDePasse: mdp.nouveau });
      toast.success('Mot de passe changé avec succès !');
      setMdp({ actuel: '', nouveau: '', confirmation: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Mot de passe actuel incorrect');
    } finally { setChargement(false); }
  };

  const initiales = utilisateur ? (utilisateur.prenom?.[0] ?? '') + (utilisateur.nom?.[0] ?? '') : '?';

  const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#1A1A1A', background: 'white', boxSizing: 'border-box', transition: 'border-color 0.2s' };
  const focus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = BORDEAUX; };
  const blur  = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#E2E8F0'; };

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,24px)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Entête profil */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: BORDEAUX, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 24, color: 'white', margin: '0 auto 14px' }}>
            {initiales.toUpperCase()}
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 6px' }}>Mon compte</h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B' }}>{utilisateur?.email}</p>
          <Link href={`/profil/${utilisateur?.id}`} style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: BORDEAUX, textDecoration: 'none', fontWeight: 600 }}>
            Voir mon profil public →
          </Link>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, padding: 4 }}>
          {[{ id: 'profil', label: '👤 Informations' }, { id: 'securite', label: '🔒 Sécurité' }].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id as any)}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: onglet === o.id ? BORDEAUX : 'transparent', color: onglet === o.id ? 'white' : '#64748B', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: onglet === o.id ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
              {o.label}
            </button>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 'clamp(24px,4vw,36px)', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* Onglet profil */}
          {onglet === 'profil' && (
            <form onSubmit={sauvegarderProfil} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 8px' }}>Informations personnelles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Prénom *</label>
                  <input type="text" value={form.prenom} required onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} style={inp} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Nom *</label>
                  <input type="text" value={form.nom} required onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={inp} onFocus={focus} onBlur={blur} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Biographie</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Votre spécialité juridique, établissement, objectifs…" style={{ ...inp, resize: 'vertical' }} onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Ville</label>
                  <select value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} style={{ ...inp, appearance: 'none' as any }} onFocus={focus} onBlur={blur}>
                    <option value="">— Choisir —</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>WhatsApp</label>
                  <input type="tel" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="+509 XXXX XXXX" style={inp} onFocus={focus} onBlur={blur} />
                </div>
              </div>
              <button type="submit" disabled={chargement} style={{ width: '100%', padding: '14px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
                {chargement ? 'Sauvegarde…' : 'Enregistrer les modifications →'}
              </button>
            </form>
          )}

          {/* Onglet sécurité */}
          {onglet === 'securite' && (
            <form onSubmit={changerMotDePasse} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 8px' }}>Changer le mot de passe</h2>

              {[
                { key: 'actuel',       label: 'Mot de passe actuel',       placeholder: 'Votre mot de passe actuel' },
                { key: 'nouveau',      label: 'Nouveau mot de passe',       placeholder: 'Minimum 6 caractères' },
                { key: 'confirmation', label: 'Confirmer le nouveau mot de passe', placeholder: 'Répétez le nouveau mot de passe' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={(voirMdp as any)[f.key] ? 'text' : 'password'}
                      value={(mdp as any)[f.key]}
                      required
                      onChange={e => setMdp(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ ...inp, paddingRight: 44 }}
                      onFocus={focus} onBlur={blur}
                    />
                    <button type="button" onClick={() => setVoirMdp(p => ({ ...p, [f.key]: !(p as any)[f.key] }))}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 16 }}>
                      {(voirMdp as any)[f.key] ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              ))}

              {mdp.nouveau && mdp.confirmation && mdp.nouveau !== mdp.confirmation && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF4444', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                  ⚠ Les mots de passe ne correspondent pas
                </div>
              )}

              <div style={{ background: '#F8F7F4', borderRadius: 10, padding: '12px 16px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
                💡 Pour réinitialiser votre mot de passe sans connaître l'actuel, utilisez{' '}
                <Link href="/auth/mot-de-passe-oublie" style={{ color: BORDEAUX, fontWeight: 700, textDecoration: 'none' }}>Mot de passe oublié</Link>.
              </div>

              <button type="submit" disabled={chargement} style={{ width: '100%', padding: '14px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
                {chargement ? 'Changement…' : 'Changer le mot de passe →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
