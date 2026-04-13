// app/lives/page.tsx — LexHaiti
// ⚠️ SPÉCIFIQUE À LEXHAITI
// Conférences juridiques en direct et replays d'audiences simulées

'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const BORDEAUX = '#8B0000';
const OR       = '#D4AF37';

const getYoutubeThumb = (url: string) => {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
};

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0&autoplay=1`;
  return url;
};

// Lives de démonstration — thématique juridique
const LIVES_DEMO = [
  { id: 'L1', titre: 'Droit constitutionnel haïtien — Analyse de la Constitution de 1987', description: 'Maître Dupont et Maître Théodore analysent les articles fondamentaux de la Constitution de 1987 et leurs implications pratiques.', categorie: 'Droit constitutionnel', statut: 'TERMINE', vues: 1240, dateDebut: '2026-03-01', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 'L2', titre: 'Simulation d\'audience — Droit des affaires : contrat de vente litigieux', description: 'Simulation complète d\'une audience commerciale avec plaidoiries, objections et délibéré. Idéal pour les étudiants en droit.', categorie: 'Procédure civile', statut: 'TERMINE', vues: 890, dateDebut: '2026-03-15', youtubeUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
  { id: 'L3', titre: 'Réforme judiciaire en Haïti — Table ronde avec des juristes', description: 'Débat entre juristes haïtiens sur les réformes nécessaires du système judiciaire haïtien.', categorie: 'Droits civiques', statut: 'TERMINE', vues: 703, dateDebut: '2026-03-22', youtubeUrl: 'https://www.youtube.com/watch?v=L_jWHffIx5E' },
  { id: 'L4', titre: 'Droit foncier haïtien — Titres de propriété et conflits immobiliers', description: 'Comment naviguer les problèmes de titres en Haïti. Cas pratiques commentés par des spécialistes.', categorie: 'Droit immobilier', statut: 'TERMINE', vues: 2033, dateDebut: '2026-02-28', youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ' },
  { id: 'L5', titre: 'Procédure pénale — La défense en Haïti', description: 'Analyse des droits de la défense dans le système pénal haïtien. Avec Maître François, avocat au barreau de PAP.', categorie: 'Procédure pénale', statut: 'TERMINE', vues: 1450, dateDebut: '2026-02-14', youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0' },
  { id: 'L6', titre: 'Moot Court en direct — Finale du Championnat 2026', description: 'Regardez la finale du Championnat National de Plaidoirie 2026. Deux équipes s\'affrontent sur un cas de droit constitutionnel.', categorie: 'Moot Court', statut: 'PROGRAMME', vues: 0, dateDebut: '2026-05-30', youtubeUrl: '' },
];

const CATS = ['Tous', 'Droit constitutionnel', 'Procédure civile', 'Procédure pénale', 'Droit immobilier', 'Droits civiques', 'Moot Court'];

const CAT_COLORS: Record<string, string> = {
  'Droit constitutionnel': BORDEAUX,
  'Procédure civile': '#1B3A6B',
  'Procédure pénale': '#7C3AED',
  'Droit immobilier': '#065F46',
  'Droits civiques': '#D97706',
  'Moot Court': '#C2410C',
};

export default function PageLives() {
  const { utilisateur } = useAuthStore();
  const [lives, setLives] = useState(LIVES_DEMO);
  const [replay, setReplay] = useState<any>(null);
  const [filtre, setFiltre] = useState('Tous');
  const [chargement, setChargement] = useState(true);

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    api.get('/lives')
      .then(({ data }) => { if (Array.isArray(data) && data.length) setLives(data); })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const filtres = lives.filter(l => filtre === 'Tous' || l.categorie === filtre);
  const enDirect = lives.filter(l => l.statut === 'EN_DIRECT');
  const programmes = lives.filter(l => l.statut === 'PROGRAMME');
  const archives = filtres.filter(l => l.statut === 'TERMINE');

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Lecteur replay */}
      {replay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: 'white', margin: 0 }}>{replay.titre}</h3>
              <button onClick={() => setReplay(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe src={getEmbedUrl(replay.youtubeUrl)} title={replay.titre} allow="autoplay; encrypted-media" allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }} />
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: OR, fontWeight: 700, marginBottom: 14 }}>
            Conférences & Simulations d'audiences
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,4vw,48px)', color: 'white', margin: '0 0 14px', fontWeight: 'normal' }}>
            LexHaiti — En direct & Replays
          </h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 540, margin: 0, lineHeight: 1.7 }}>
            Conférences juridiques, simulations d'audiences, moot courts en direct et replays des grands débats du droit haïtien.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>

        {/* En direct */}
        {enDirect.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#1A1A1A', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              En direct maintenant
            </h2>
            {enDirect.map(l => (
              <div key={l.id} style={{ background: '#1A0000', border: `2px solid ${OR}`, borderRadius: 12, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: OR, fontWeight: 700, marginBottom: 6 }}>🔴 EN DIRECT</div>
                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: 'white', margin: '0 0 8px', fontWeight: 'normal' }}>{l.titre}</h3>
                  <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>{l.description}</p>
                </div>
                <button onClick={() => setReplay(l)}
                  style={{ padding: '13px 28px', background: OR, color: '#1A0000', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 14, cursor: 'pointer', flexShrink: 0 }}>
                  ▶ Regarder
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Programmes */}
        {programmes.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#1A1A1A', margin: '0 0 20px' }}>
              Prochaines conférences
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {programmes.map(l => (
                <div key={l.id} style={{ background: 'white', border: `1px solid ${OR}30`, borderRadius: 10, padding: '18px 20px' }}>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: OR, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    📅 {new Date(l.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: '#1A1A1A', margin: '0 0 6px', fontWeight: 'normal' }}>{l.titre}</h3>
                  <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{l.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtres catégorie */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setFiltre(cat)}
              style={{ padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${filtre === cat ? BORDEAUX : '#E2E8F0'}`, background: filtre === cat ? BORDEAUX : 'white', color: filtre === cat ? 'white' : '#64748B', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: filtre === cat ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Archives */}
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#1A1A1A', margin: '0 0 20px' }}>
          Replays & Archives
        </h2>

        {archives.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎥</div>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>Aucun replay dans cette catégorie.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {archives.map(l => {
              const thumb = getYoutubeThumb(l.youtubeUrl ?? '');
              const catColor = CAT_COLORS[l.categorie] ?? BORDEAUX;
              return (
                <div key={l.id} style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onClick={() => l.youtubeUrl && setReplay(l)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${BORDEAUX}12`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>

                  {/* Miniature */}
                  <div style={{ position: 'relative', height: 170, background: thumb ? `url(${thumb}) center/cover` : `linear-gradient(135deg, ${catColor}20, ${catColor}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!thumb && <span style={{ fontSize: 40 }}>⚖️</span>}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>▶</div>
                    </div>
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 8px', borderRadius: 4, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10 }}>
                      👁 {(l.vues ?? 0).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: catColor, fontWeight: 700, background: `${catColor}12`, padding: '2px 8px', borderRadius: 100 }}>
                        {l.categorie}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: '#1A1A1A', lineHeight: 1.45, margin: '0 0 8px', fontWeight: 'normal' }}>
                      {l.titre}
                    </h3>
                    <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: '0 0 8px' }}>
                      {l.description?.slice(0, 90)}{(l.description?.length ?? 0) > 90 ? '…' : ''}
                    </p>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8' }}>
                      📅 {new Date(l.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
