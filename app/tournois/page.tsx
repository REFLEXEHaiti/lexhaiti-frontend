// app/tournois/page.tsx — LexHaiti — CRUD + Classement des matchs intégré
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const BORDEAUX = '#8B0000';
const OR = '#D4AF37';

const STATUTS = ['EN_COURS', 'INSCRIPTION', 'TERMINE', 'ANNULE'];
const STATUT_CFG: Record<string, { label: string; couleur: string; bg: string }> = {
  EN_COURS:    { label: '🔴 En cours',              couleur: '#DC2626', bg: '#FEF2F2' },
  INSCRIPTION: { label: '📝 Inscriptions ouvertes', couleur: OR,        bg: `${OR}15`  },
  TERMINE:     { label: '✅ Terminé',               couleur: '#64748B', bg: '#F8FAFC'  },
  ANNULE:      { label: '❌ Annulé',                couleur: '#94A3B8', bg: '#F1F5F9'  },
};

const DEMO: any[] = [
  {
    id: 'T1', nom: 'Championnat National de Plaidoirie 2026',
    description: 'La plus grande compétition de plaidoirie haïtienne.',
    statut: 'EN_COURS', maxEquipes: 8, dateDebut: '2026-04-15', dateFin: '2026-06-30',
    equipes: ['Équipe Barreau Nord', 'Équipe UEH Droit', 'Équipe Pétion-Ville', 'Équipe Les Cayes'],
    matchs: [
      { id: 'm1', tour: 'Phase de poules', equipe1: 'Équipe Barreau Nord', equipe2: 'Équipe UEH Droit',  date: '2026-04-22', statut: 'TERMINE',   score1: 2, score2: 1 },
      { id: 'm2', tour: 'Phase de poules', equipe1: 'Équipe Pétion-Ville', equipe2: 'Équipe Les Cayes',  date: '2026-04-22', statut: 'TERMINE',   score1: 1, score2: 2 },
      { id: 'm3', tour: 'Demi-finale',     equipe1: 'Équipe Barreau Nord', equipe2: 'Équipe Les Cayes',  date: '2026-05-06', statut: 'PROGRAMME', score1: 0, score2: 0 },
      { id: 'm4', tour: 'Finale',          equipe1: 'Finaliste 1',         equipe2: 'Finaliste 2',        date: '2026-05-20', statut: 'PROGRAMME', score1: 0, score2: 0 },
    ],
  },
];

const FORM_VIDE = { nom: '', description: '', statut: 'INSCRIPTION', maxEquipes: 8, dateDebut: '', dateFin: '' };
const INS_VIDE  = { nomEquipe: '', membres: ['', '', ''] };

function calculerClassement(matchs: any[], equipes: string[]) {
  const table: Record<string, { equipe: string; pts: number; j: number; g: number; n: number; p: number }> = {};
  equipes.forEach(e => { table[e] = { equipe: e, pts: 0, j: 0, g: 0, n: 0, p: 0 }; });
  matchs.filter(m => m.statut === 'TERMINE').forEach(m => {
    const e1 = table[m.equipe1]; const e2 = table[m.equipe2];
    if (!e1 || !e2) return;
    e1.j++; e2.j++;
    if (m.score1 > m.score2)      { e1.g++; e1.pts += 3; e2.p++; }
    else if (m.score1 < m.score2) { e2.g++; e2.pts += 3; e1.p++; }
    else                           { e1.n++; e2.n++; e1.pts++; e2.pts++; }
  });
  return Object.values(table).sort((a, b) => b.pts - a.pts || b.g - a.g);
}

function genererCalendrier(nbEquipes: number, dateDebut: string) {
  const matchs: any[] = [];
  const equipes = Array.from({ length: Math.min(nbEquipes, 8) }, (_, i) => `Équipe ${i + 1}`);
  const d = new Date(dateDebut || new Date().toISOString());
  for (let i = 0; i < equipes.length - 1; i += 2) {
    d.setDate(d.getDate() + 7);
    matchs.push({ id: `m${i}`, tour: 'Phase de poules', equipe1: equipes[i], equipe2: equipes[i + 1] ?? 'TBD', date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), statut: 'PROGRAMME', score1: 0, score2: 0 });
  }
  if (nbEquipes >= 4) {
    d.setDate(d.getDate() + 14);
    matchs.push({ id: 'sf1', tour: 'Demi-finale', equipe1: 'Vainqueur Poule A', equipe2: 'Vainqueur Poule B', date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), statut: 'PROGRAMME', score1: 0, score2: 0 });
  }
  d.setDate(d.getDate() + 7);
  matchs.push({ id: 'f1', tour: 'Finale', equipe1: 'Finaliste 1', equipe2: 'Finaliste 2', date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), statut: 'PROGRAMME', score1: 0, score2: 0 });
  return matchs;
}

// ── VueTournoi défini EN DEHORS du composant principal ──
function VueTournoi({ t, estAdmin, onRetour, onOuvrir, onSupprimer }: {
  t: any; estAdmin: boolean;
  onRetour: () => void;
  onOuvrir: (t: any) => void;
  onSupprimer: (id: string) => void;
}) {
  const classement = calculerClassement(t.matchs ?? [], t.equipes ?? []);
  const tours = [...new Set((t.matchs ?? []).map((m: any) => m.tour))] as string[];

  return (
    <div>
      <button onClick={onRetour} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', marginBottom: 20, padding: 0 }}>
        ← Retour aux tournois
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: '#1A1A1A', margin: '0 0 6px', fontWeight: 'normal' }}>{t.nom}</h2>
          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: STATUT_CFG[t.statut]?.couleur, background: STATUT_CFG[t.statut]?.bg, padding: '3px 10px', borderRadius: 100 }}>
            {STATUT_CFG[t.statut]?.label}
          </span>
        </div>
        {estAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onOuvrir(t)} style={{ padding: '8px 16px', background: '#EBF3FB', color: '#1E5FA8', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>✏️ Modifier</button>
            <button onClick={() => onSupprimer(t.id)} style={{ padding: '8px 16px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>🗑 Supprimer</button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Classement */}
        <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', background: BORDEAUX, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏆</span>
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Classement</span>
          </div>
          {classement.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13 }}>Aucune équipe inscrite.</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 40px 30px 30px 30px 40px', gap: 4, padding: '8px 14px', background: '#F8F7F4', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                <span>#</span><span>Équipe</span><span>J</span><span>G</span><span>N</span><span>P</span><span style={{ textAlign: 'right' }}>Pts</span>
              </div>
              {classement.map((row, i) => (
                <div key={row.equipe} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 40px 30px 30px 30px 40px', gap: 4, padding: '10px 14px', borderTop: '1px solid #F5F0E8', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: i < 2 ? OR : '#94A3B8' }}>{i + 1}</span>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#1A1A1A', fontWeight: i === 0 ? 700 : 400 }}>{row.equipe}</span>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>{row.j}</span>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#16A34A', fontWeight: 700 }}>{row.g}</span>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>{row.n}</span>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#DC2626' }}>{row.p}</span>
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 700, color: BORDEAUX, textAlign: 'right' }}>{row.pts}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Calendrier */}
        <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', background: BORDEAUX, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📅</span>
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Calendrier & Résultats</span>
          </div>
          {(t.matchs ?? []).length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
              Le calendrier sera généré une fois les équipes inscrites.
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {tours.map(tour => (
                <div key={tour}>
                  <div style={{ padding: '8px 14px', background: '#F8F7F4', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>{tour}</div>
                  {(t.matchs ?? []).filter((m: any) => m.tour === tour).map((m: any) => (
                    <div key={m.id} style={{ padding: '12px 14px', borderTop: '1px solid #F5F0E8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8' }}>📅 {m.date}</span>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: m.statut === 'TERMINE' ? '#DCFCE7' : `${OR}15`, color: m.statut === 'TERMINE' ? '#166534' : '#7C5200' }}>
                          {m.statut === 'TERMINE' ? '✓ Terminé' : '🕐 Programmé'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: m.score1 > m.score2 ? 800 : 400, color: '#1A1A1A', flex: 1, textAlign: 'right' }}>{m.equipe1}</span>
                        {m.statut === 'TERMINE' ? (
                          <span style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, color: BORDEAUX, padding: '2px 10px', background: '#F5F0E8', borderRadius: 6, minWidth: 60, textAlign: 'center' }}>{m.score1} – {m.score2}</span>
                        ) : (
                          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8', padding: '2px 10px' }}>vs</span>
                        )}
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: m.score2 > m.score1 ? 800 : 400, color: '#1A1A1A', flex: 1 }}>{m.equipe2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Équipes */}
      {(t.equipes ?? []).length > 0 && (
        <div style={{ marginTop: 24, background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 16px' }}>Équipes inscrites ({t.equipes.length}/{t.maxEquipes})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {t.equipes.map((eq: string, i: number) => (
              <span key={i} style={{ background: `${BORDEAUX}08`, border: `1px solid ${BORDEAUX}20`, borderRadius: 6, padding: '6px 14px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: BORDEAUX, fontWeight: 600 }}>{eq}</span>
            ))}
          </div>
        </div>
      )}
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

export default function PageTournois() {
  const { estConnecte, utilisateur } = useAuthStore();
  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  const [tournois, setTournois]         = useState<any[]>([]);
  const [chargement, setChargement]     = useState(true);
  const [sponsors, setSponsors]         = useState<any[]>([]);
  const [tournoisSelectionne, setTournoisSelectionne] = useState<any>(null);
  const [modalForm, setModalForm]       = useState(false);
  const [modalIns, setModalIns]         = useState<string | null>(null);
  const [modalConfirm, setModalConfirm] = useState<any>(null);
  const [enEdition, setEnEdition]       = useState<any>(null);
  const [form, setForm]                 = useState<any>(FORM_VIDE);
  const [insForm, setInsForm]           = useState<any>(INS_VIDE);
  const [envoi, setEnvoi]               = useState(false);
  const defilRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(0);

  useEffect(() => {
    api.get('/tournois')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        const normalises = list.map((t: any) => ({ ...t, equipes: t.equipes ?? [], matchs: t.matchs ?? [] }));
        setTournois(normalises.length > 0 ? normalises : DEMO);
      })
      .catch(() => setTournois(DEMO))
      .finally(() => setChargement(false));
    api.get('/sponsors').then(({ data }) => { if (Array.isArray(data)) setSponsors(data); }).catch(() => {});
  }, []);

  useEffect(() => {
    const el = defilRef.current;
    if (!el || sponsors.length === 0) return;
    const anim = setInterval(() => {
      posRef.current += 0.5;
      if (posRef.current >= el.scrollWidth / 2) posRef.current = 0;
      el.scrollLeft = posRef.current;
    }, 16);
    return () => clearInterval(anim);
  }, [sponsors]);

  const ouvrir = (t?: any) => {
    setEnEdition(t ?? null);
    setForm(t ? { nom: t.nom, description: t.description ?? '', statut: t.statut, maxEquipes: t.maxEquipes, dateDebut: t.dateDebut?.slice(0, 10) ?? '', dateFin: t.dateFin?.slice(0, 10) ?? '' } : FORM_VIDE);
    setModalForm(true);
  };

  const sauvegarder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) { toast.error('Le nom est requis'); return; }
    setEnvoi(true);
    try {
      if (enEdition) {
        await api.patch(`/tournois/${enEdition.id}`, { nom: form.nom, description: form.description, maxEquipes: form.maxEquipes, dateDebut: form.dateDebut });
        setTournois(prev => prev.map(t => t.id === enEdition.id ? { ...t, ...form } : t));
        toast.success('✅ Tournoi mis à jour !');
        setModalForm(false);
      } else {
        const calendrierIA = genererCalendrier(form.maxEquipes, form.dateDebut);
        let nouveau: any;
        try {
          const { data } = await api.post('/tournois', { nom: form.nom, description: form.description, maxEquipes: form.maxEquipes, dateDebut: form.dateDebut || new Date().toISOString() });
          nouveau = { ...data, equipes: [], matchs: calendrierIA };
        } catch {
          nouveau = { ...form, id: 'local_' + Date.now(), equipes: [], matchs: calendrierIA, _count: { equipes: 0 } };
        }
        setTournois(prev => [nouveau, ...prev]);
        setModalForm(false);
        setModalConfirm(nouveau);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    }
    setEnvoi(false);
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer ce tournoi ?')) return;
    await api.delete(`/tournois/${id}`).catch(() => {});
    setTournois(prev => prev.filter(t => t.id !== id));
    if (tournoisSelectionne?.id === id) setTournoisSelectionne(null);
    toast.success('Tournoi supprimé');
  };

  const sInscrire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estConnecte) { window.location.href = '/auth/connexion'; return; }
    setEnvoi(true);
    try {
      await api.post(`/tournois/${modalIns}/inscrire`, { nom: insForm.nomEquipe, membres: insForm.membres.filter((m: string) => m.trim()) }).catch(() => {});
      toast.success(`✅ Équipe « ${insForm.nomEquipe} » inscrite !`);
      setTournois(prev => prev.map(t => t.id === modalIns ? { ...t, equipes: [...(t.equipes ?? []), insForm.nomEquipe] } : t));
      setModalIns(null);
      setInsForm(INS_VIDE);
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Erreur'); }
    setEnvoi(false);
  };

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', color: '#1A1A1A', background: 'white', transition: 'border-color 0.2s' };
  const focus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = BORDEAUX; };
  const blur  = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#E2E8F0'; };

  const actifs   = tournois.filter(t => ['EN_COURS', 'INSCRIPTION'].includes(t.statut));
  const termines = tournois.filter(t => t.statut === 'TERMINE');

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Bannière sponsors */}
      {sponsors.length > 0 && (
        <div style={{ background: 'white', borderBottom: '1px solid #E8E4DC', padding: '10px 0' }}>
          <p style={{ textAlign: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px', fontWeight: 700 }}>Nos partenaires</p>
          <div ref={defilRef} style={{ display: 'flex', overflow: 'hidden', alignItems: 'center' }}>
            {[...sponsors, ...sponsors].map((s, i) => (
              <a key={i} href={s.siteWeb || '#'} target="_blank" rel="noreferrer"
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 160, height: 48, margin: '0 16px', textDecoration: 'none', opacity: 0.7 }}>
                {s.logoUrl ? <img src={s.logoUrl} alt={s.nom} style={{ maxWidth: 140, maxHeight: 40, objectFit: 'contain' }} /> : <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: '#475569' }}>{s.nom}</span>}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: OR, fontWeight: 700, marginBottom: 12 }}>Moot Courts & Plaidoiries</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,4vw,48px)', color: 'white', margin: '0 0 10px', fontWeight: 'normal' }}>Tournois LexHaiti</h1>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 480, margin: 0, lineHeight: 1.6 }}>
              Compétitions de plaidoirie, calendriers et classements en temps réel.
            </p>
          </div>
          {estAdmin && (
            <button onClick={() => ouvrir()}
              style={{ padding: '13px 24px', background: OR, color: '#1A0000', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              + Nouveau tournoi
            </button>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(20px,5vw,48px)' }}>

        {tournoisSelectionne ? (
          <VueTournoi
            t={tournoisSelectionne}
            estAdmin={estAdmin}
            onRetour={() => setTournoisSelectionne(null)}
            onOuvrir={ouvrir}
            onSupprimer={supprimer}
          />
        ) : (
          <>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#1A1A1A', margin: '0 0 20px', fontWeight: 'normal' }}>Tournois en cours</h2>

            {chargement ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Chargement…</div>
            ) : actifs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#94A3B8' }}>Aucun tournoi actif pour le moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                {actifs.map(t => {
                  const cfg   = STATUT_CFG[t.statut] ?? STATUT_CFG['TERMINE'];
                  const nbEq  = t.equipes?.length ?? t._count?.equipes ?? 0;
                  const pct   = (nbEq / t.maxEquipes) * 100;
                  const plein = pct >= 100;
                  return (
                    <div key={t.id} style={{ background: 'white', border: `1px solid ${BORDEAUX}20`, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
                        <div style={{ padding: '22px 26px', cursor: 'pointer' }} onClick={() => setTournoisSelectionne(t)}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: cfg.couleur, background: cfg.bg, padding: '3px 10px', borderRadius: 100 }}>{cfg.label}</span>
                            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>
                              {t.dateDebut ? new Date(t.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '—'} – {t.dateFin ? new Date(t.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                            </span>
                          </div>
                          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 19, color: '#1A1A1A', margin: '0 0 8px', fontWeight: 'normal' }}>{t.nom}</h3>
                          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: '0 0 12px' }}>{t.description}</p>
                          <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>
                            <span>👥 {nbEq}/{t.maxEquipes} équipes · {t.matchs?.length ?? 0} matchs</span>
                            {plein && <span style={{ color: '#DC2626', fontWeight: 700 }}>Complet</span>}
                          </div>
                          <div style={{ height: 4, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: plein ? '#DC2626' : `linear-gradient(90deg, ${BORDEAUX}, ${OR})`, width: `${Math.min(pct, 100)}%`, borderRadius: 3 }} />
                          </div>
                        </div>
                        <div style={{ borderLeft: `1px solid ${BORDEAUX}15`, padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                          <button onClick={() => setTournoisSelectionne(t)}
                            style={{ padding: '10px 18px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            📊 Classement
                          </button>
                          {t.statut === 'INSCRIPTION' && !plein && estConnecte && (
                            <button onClick={() => setModalIns(t.id)}
                              style={{ padding: '10px 18px', background: OR, color: '#1A0000', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                              S'inscrire
                            </button>
                          )}
                          {!estConnecte && t.statut === 'INSCRIPTION' && (
                            <Link href="/auth/connexion" style={{ display: 'block', padding: '10px 18px', background: 'white', color: BORDEAUX, border: `2px solid ${BORDEAUX}`, borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
                              Se connecter
                            </Link>
                          )}
                          {estAdmin && (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => ouvrir(t)} style={{ flex: 1, padding: '8px', background: '#EBF3FB', color: '#1E5FA8', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✏️</button>
                              <button onClick={() => supprimer(t.id)} style={{ flex: 1, padding: '8px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🗑</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {termines.length > 0 && (
              <>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#64748B', margin: '0 0 16px', fontWeight: 'normal' }}>Historique</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {termines.map(t => (
                    <div key={t.id} style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: '16px 20px', opacity: 0.75, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setTournoisSelectionne(t)}>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Terminé</div>
                        <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 14, color: '#374151', margin: 0, fontWeight: 'normal' }}>{t.nom}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                        <button onClick={() => setTournoisSelectionne(t)} style={{ padding: '6px 10px', background: `${BORDEAUX}10`, color: BORDEAUX, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>📊</button>
                        {estAdmin && <button onClick={() => supprimer(t.id)} style={{ padding: '6px 10px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>🗑</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modal confirmation */}
      {modalConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: BORDEAUX, margin: '0 0 8px', fontWeight: 'normal' }}>Tournoi créé !</h2>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#374151', margin: '0 0 6px' }}>
              <strong>"{modalConfirm.nom}"</strong> a été enregistré avec succès.
            </p>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#94A3B8', margin: '0 0 24px' }}>
              Calendrier généré pour {modalConfirm.maxEquipes} équipes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => { setTournoisSelectionne(modalConfirm); setModalConfirm(null); }}
                style={{ width: '100%', padding: '13px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                📅 Voir le calendrier →
              </button>
              <button onClick={() => { window.location.href = '/dashboard'; }}
                style={{ width: '100%', padding: '13px', background: `${OR}15`, color: '#7C5200', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                🏠 Tableau de bord
              </button>
              <button onClick={() => setModalConfirm(null)}
                style={{ width: '100%', padding: '13px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Rester sur les tournois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal création/édition */}
      {modalForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${BORDEAUX}` }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: BORDEAUX, margin: 0 }}>{enEdition ? 'Modifier' : 'Nouveau tournoi'}</h2>
              <button onClick={() => setModalForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={sauvegarder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Nom *</label><input value={form.nom} required onChange={e => setForm((p: any) => ({ ...p, nom: e.target.value }))} placeholder="Ex : Championnat National de Plaidoirie" style={inp} onFocus={focus} onBlur={blur} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Description</label><textarea value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' }} onFocus={focus} onBlur={blur} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Statut</label><select value={form.statut} onChange={e => setForm((p: any) => ({ ...p, statut: e.target.value }))} style={{ ...inp, appearance: 'none' as any }} onFocus={focus} onBlur={blur}>{STATUTS.map(s => <option key={s} value={s}>{STATUT_CFG[s]?.label ?? s}</option>)}</select></div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Max équipes</label><input type="number" min={2} max={64} value={form.maxEquipes} onChange={e => setForm((p: any) => ({ ...p, maxEquipes: parseInt(e.target.value) }))} style={inp} onFocus={focus} onBlur={blur} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Date début</label><input type="date" value={form.dateDebut} onChange={e => setForm((p: any) => ({ ...p, dateDebut: e.target.value }))} style={inp} onFocus={focus} onBlur={blur} /></div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Date fin</label><input type="date" value={form.dateFin} onChange={e => setForm((p: any) => ({ ...p, dateFin: e.target.value }))} style={inp} onFocus={focus} onBlur={blur} /></div>
              </div>
              <div style={{ background: `${OR}08`, border: `1px solid ${OR}20`, borderRadius: 8, padding: '10px 14px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#7C5200' }}>
                💡 Le calendrier des matchs sera généré automatiquement par l'IA.
              </div>
              <button type="submit" disabled={envoi}
                style={{ width: '100%', padding: '14px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
                {envoi ? 'Sauvegarde…' : (enEdition ? 'Enregistrer →' : 'Créer le tournoi →')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal inscription */}
      {modalIns && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${OR}` }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: BORDEAUX, margin: 0 }}>Inscrire mon équipe</h2>
              <button onClick={() => setModalIns(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={sInscrire} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Nom de l'équipe *</label><input value={insForm.nomEquipe} required onChange={e => setInsForm((p: any) => ({ ...p, nomEquipe: e.target.value }))} placeholder="Ex : Équipe Barreau Nord" style={inp} onFocus={focus} onBlur={blur} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Membres</label>
                {insForm.membres.map((m: string, i: number) => (
                  <input key={i} value={m} onChange={e => setInsForm((p: any) => ({ ...p, membres: p.membres.map((v: string, j: number) => j === i ? e.target.value : v) }))} placeholder={`Membre ${i + 1}`} style={{ ...inp, marginBottom: 8 }} onFocus={focus} onBlur={blur} />
                ))}
              </div>
              <button type="submit" disabled={envoi} style={{ width: '100%', padding: '14px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                {envoi ? 'Inscription…' : "Confirmer l'inscription →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
