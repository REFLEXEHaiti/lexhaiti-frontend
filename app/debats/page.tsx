// app/debats/page.tsx — LexHaiti
// ⚠️ SPÉCIFIQUE À LEXHAITI
// Liste des débats juridiques avec filtres par catégorie de droit
// + formulaire de création pour Admin/Formateur

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const BORDEAUX = '#8B0000';
const OR       = '#D4AF37';

// Catégories juridiques propres à LexHaiti
const CATEGORIES = [
  { id: 'tous',                label: 'Tous les débats' },
  { id: 'Droit constitutionnel', label: '⚖️ Constitutionnel' },
  { id: 'Procédure civile',    label: '📋 Procédure civile' },
  { id: 'Procédure pénale',    label: '🔏 Procédure pénale' },
  { id: 'Droit des affaires',  label: '💼 Droit des affaires' },
  { id: 'Droits civiques',     label: '🗳️ Droits civiques' },
  { id: 'Droit foncier',       label: '🏠 Droit foncier' },
  { id: 'ouverts',             label: '💬 Ouverts seulement' },
];

const CATS_ADMIN = ['Droit constitutionnel', 'Procédure civile', 'Procédure pénale', 'Droit des affaires', 'Droits civiques', 'Droit foncier', 'Droit international'];

const DEBATS_DEMO = [
  { id: '1', titre: 'La réforme constitutionnelle haïtienne est-elle nécessaire ?', description: 'Analyse des enjeux constitutionnels et démocratiques.', statut: 'OUVERT', categorie: 'Droit constitutionnel', vues: 312, _count: { messages: 58 }, votes: { pourcentagePour: 63, pourcentageContre: 37 }, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', titre: 'Le droit foncier haïtien protège-t-il suffisamment les petits propriétaires ?', description: 'Les conflits fonciers en Haïti et les lacunes juridiques.', statut: 'OUVERT', categorie: 'Droit foncier', vues: 189, _count: { messages: 34 }, votes: { pourcentagePour: 44, pourcentageContre: 56 }, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', titre: "L'accès à la justice est-il réel pour les citoyens haïtiens ?", description: 'Entre idéal constitutionnel et réalité du terrain.', statut: 'OUVERT', categorie: 'Droits civiques', vues: 241, _count: { messages: 47 }, votes: { pourcentagePour: 71, pourcentageContre: 29 }, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', titre: 'La peine de mort devrait-elle être réintroduite en Haïti ?', description: 'Débat sur la politique pénale haïtienne.', statut: 'OUVERT', categorie: 'Procédure pénale', vues: 520, _count: { messages: 94 }, votes: { pourcentagePour: 38, pourcentageContre: 62 }, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '5', titre: 'La corruption judiciaire peut-elle être combattue efficacement ?', description: 'Analyse des mécanismes de lutte contre la corruption dans le système judiciaire.', statut: 'OUVERT', categorie: 'Procédure civile', vues: 178, _count: { messages: 29 }, votes: { pourcentagePour: 55, pourcentageContre: 45 }, createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: '6', titre: 'Le droit haïtien des affaires encourage-t-il vraiment l\'investissement ?', description: 'Évaluation du cadre juridique des entreprises en Haïti.', statut: 'OUVERT', categorie: 'Droit des affaires', vues: 134, _count: { messages: 21 }, votes: { pourcentagePour: 30, pourcentageContre: 70 }, createdAt: new Date(Date.now() - 345600000).toISOString() },
];

export default function PageDebats() {
  const { estConnecte, utilisateur } = useAuthStore();
  const [debats, setDebats]         = useState(DEBATS_DEMO);
  const [filtre, setFiltre]         = useState('tous');
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm]             = useState({ titre: '', description: '', categorie: 'Droit constitutionnel', statut: 'OUVERT', dateDebut: '' });
  const [envoi, setEnvoi]           = useState(false);

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    api.get('/debats?limite=20')
      .then(({ data }) => { if (data?.debats?.length) setDebats(data.debats); })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const debatsFiltres = debats.filter(d => {
    if (filtre === 'tous') return true;
    if (filtre === 'ouverts') return d.statut === 'OUVERT';
    return d.categorie === filtre;
  });

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      const { data } = await api.post('/debats', { ...form, dateDebut: form.dateDebut ? new Date(form.dateDebut).toISOString() : new Date().toISOString() });
      setDebats(prev => [{ ...data, vues: 0, _count: { messages: 0 }, votes: { pourcentagePour: 50, pourcentageContre: 50 } }, ...prev]);
      setModalOuvert(false);
      setForm({ titre: '', description: '', categorie: 'Droit constitutionnel', statut: 'OUVERT', dateDebut: '' });
    } catch { /* optimistic add */ }
    setEnvoi(false);
  };

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(32px,5vw,64px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: OR, fontWeight: 700, marginBottom: 12 }}>
              LexHaiti — Débats juridiques
            </div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,4vw,48px)', color: 'white', margin: '0 0 10px', fontWeight: 'normal' }}>
              L'arène du droit haïtien
            </h1>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
              Défendez votre position, argumentez avec rigueur juridique, et façonnez le droit haïtien de demain.
            </p>
          </div>
          {estAdmin && (
            <button onClick={() => setModalOuvert(true)}
              style={{ padding: '13px 24px', background: OR, color: '#1A0000', border: 'none', borderRadius: 4, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
              + Nouveau débat
            </button>
          )}
        </div>
      </section>

      {/* Filtres par catégorie juridique */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 56, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5vw,48px)', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setFiltre(cat.id)}
              style={{ padding: '14px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${filtre === cat.id ? BORDEAUX : 'transparent'}`, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: filtre === cat.id ? BORDEAUX : '#64748B', fontWeight: filtre === cat.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s', letterSpacing: '0.03em' }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de débats */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>
        {chargement ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>
            Chargement des débats…
          </div>
        ) : debatsFiltres.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: '#64748B' }}>Aucun débat dans cette catégorie pour l'instant.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {debatsFiltres.map(d => (
              <Link key={d.id} href={`/debats/${d.id}`} style={{ textDecoration: 'none' }}>
                <article style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${BORDEAUX}15`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                  {/* Barre de statut */}
                  <div style={{ height: 4, background: d.statut === 'OUVERT' ? `linear-gradient(90deg, ${BORDEAUX}, ${OR})` : '#E2E8F0' }} />

                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: BORDEAUX, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: `${BORDEAUX}10`, padding: '3px 10px', borderRadius: 100 }}>
                        {d.categorie}
                      </span>
                      {d.statut === 'OUVERT' && (
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#16A34A', fontWeight: 700 }}>
                          ● Ouvert
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#1A1A1A', lineHeight: 1.45, margin: '0 0 14px', fontWeight: 'normal' }}>
                      {d.titre}
                    </h3>

                    {/* Barre de votes Pour/Contre */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, marginBottom: 4 }}>
                        <span style={{ color: '#16A34A', fontWeight: 700 }}>Pour {d.votes?.pourcentagePour ?? 50}%</span>
                        <span style={{ color: '#DC2626', fontWeight: 700 }}>Contre {d.votes?.pourcentageContre ?? 50}%</span>
                      </div>
                      <div style={{ height: 4, background: '#DC2626', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#16A34A', width: `${d.votes?.pourcentagePour ?? 50}%`, borderRadius: 2 }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8' }}>
                      <span>💬 {d._count?.messages ?? 0} arguments</span>
                      <span>👁 {d.vues ?? 0} vues</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal création débat (Admin) ── */}
      {modalOuvert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '28px 32px', width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: `2px solid ${BORDEAUX}`, paddingBottom: 16 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: BORDEAUX, margin: 0 }}>Nouveau débat juridique</h2>
              <button onClick={() => setModalOuvert(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'titre', label: 'Proposition à débattre', placeholder: 'Ex : La réforme X devrait être adoptée en Haïti', type: 'text' },
                { key: 'description', label: 'Description', placeholder: 'Contexte et enjeux du débat', type: 'textarea' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#1E293B', marginBottom: 6 }}>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={3}
                      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = BORDEAUX; }} onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }} />
                  ) : (
                    <input type="text" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} required
                      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = BORDEAUX; }} onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }} />
                  )}
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#1E293B', marginBottom: 6 }}>Catégorie juridique</label>
                  <select value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}
                    onFocus={e => { e.target.style.borderColor = BORDEAUX; }} onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}>
                    {CATS_ADMIN.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#1E293B', marginBottom: 6 }}>Statut</label>
                  <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                    <option value="BROUILLON">Brouillon</option>
                    <option value="OUVERT">Ouvert</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={envoi}
                style={{ width: '100%', padding: '15px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: envoi ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                {envoi ? 'Publication…' : 'Publier le débat →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
