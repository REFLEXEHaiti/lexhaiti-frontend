// app/lives/page.tsx — LexHaiti
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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

const LIVES_DEMO = [
  { id: 'L1', titre: 'Droit constitutionnel haïtien — Analyse de la Constitution de 1987', description: 'Maître Dupont et Maître Théodore analysent les articles fondamentaux de la Constitution de 1987.', categorie: 'Droit constitutionnel', statut: 'TERMINE', vues: 1240, dateDebut: '2026-03-01', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', videoUrl: '' },
  { id: 'L2', titre: 'Simulation d\'audience — Droit des affaires : contrat de vente litigieux', description: 'Simulation complète d\'une audience commerciale avec plaidoiries, objections et délibéré.', categorie: 'Procédure civile', statut: 'TERMINE', vues: 890, dateDebut: '2026-03-15', youtubeUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U', videoUrl: '' },
  { id: 'L6', titre: 'Moot Court en direct — Finale du Championnat 2026', description: 'Regardez la finale du Championnat National de Plaidoirie 2026.', categorie: 'Moot Court', statut: 'PROGRAMME', vues: 0, dateDebut: '2026-05-30', youtubeUrl: '', videoUrl: '' },
];

const CATS = ['Tous', 'Droit constitutionnel', 'Procédure civile', 'Procédure pénale', 'Droit immobilier', 'Droits civiques', 'Moot Court'];
const CAT_COLORS: Record<string, string> = {
  'Droit constitutionnel': BORDEAUX, 'Procédure civile': '#1B3A6B',
  'Procédure pénale': '#7C3AED', 'Droit immobilier': '#065F46',
  'Droits civiques': '#D97706', 'Moot Court': '#C2410C',
};

const FORM_VIDE = { titre: '', description: '', categorie: 'Droit constitutionnel', statut: 'PROGRAMME', dateDebut: '', type: 'LIVE', youtubeUrl: '', videoUrl: '' };

export default function PageLives() {
  const { utilisateur } = useAuthStore();
  const [lives, setLives]       = useState(LIVES_DEMO);
  const [replay, setReplay]     = useState<any>(null);
  const [filtre, setFiltre]     = useState('Tous');
  const [chargement, setChargement] = useState(true);
  const [modalForm, setModalForm]   = useState(false);
  const [enEdition, setEnEdition]   = useState<any>(null);
  const [form, setForm]             = useState<any>(FORM_VIDE);
  const [videoFile, setVideoFile]   = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoErreur, setVideoErreur]   = useState('');
  const [envoi, setEnvoi]           = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    api.get('/lives')
      .then(({ data }) => { if (Array.isArray(data) && data.length) setLives(data); })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoErreur('');
    const formatsAcceptes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/quicktime'];
    if (!formatsAcceptes.includes(f.type)) {
      setVideoErreur('Format non supporté. Utilisez MP4, WebM, OGG ou MOV.');
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      setVideoErreur('Fichier trop lourd. Maximum 500 MB.');
      return;
    }
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
    setForm((p: any) => ({ ...p, youtubeUrl: '' })); // Effacer l'URL si fichier uploadé
  };

  const fileEnBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const ouvrir = (l?: any) => {
    setEnEdition(l ?? null);
    setForm(l ? { titre: l.titre, description: l.description, categorie: l.categorie, statut: l.statut, dateDebut: l.dateDebut?.slice(0, 10) ?? '', type: l.youtubeUrl ? 'LIVE' : 'UPLOAD', youtubeUrl: l.youtubeUrl ?? '', videoUrl: l.videoUrl ?? '' } : FORM_VIDE);
    setVideoFile(null);
    setVideoPreview('');
    setVideoErreur('');
    setModalForm(true);
  };

  const sauvegarder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) { toast.error('Le titre est requis'); return; }
    setEnvoi(true);
    try {
      let videoUrl = form.youtubeUrl;
      if (videoFile && form.type === 'UPLOAD') {
        videoUrl = await fileEnBase64(videoFile);
      }
      const payload = { ...form, youtubeUrl: form.type === 'LIVE' ? form.youtubeUrl : '', videoUrl: form.type === 'UPLOAD' ? videoUrl : '' };
      if (enEdition) {
        await api.patch(`/lives/${enEdition.id}`, payload).catch(() => {});
        setLives(prev => prev.map(l => l.id === enEdition.id ? { ...l, ...payload } : l));
        toast.success('✅ Live mis à jour !');
      } else {
        let nouveau: any;
        try {
          const { data } = await api.post('/lives', payload);
          nouveau = data;
        } catch {
          nouveau = { ...payload, id: 'local_' + Date.now(), vues: 0 };
        }
        setLives(prev => [nouveau, ...prev]);
        toast.success('✅ Live ajouté !');
      }
      setModalForm(false);
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    setEnvoi(false);
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer ce live ?')) return;
    await api.delete(`/lives/${id}`).catch(() => {});
    setLives(prev => prev.filter(l => l.id !== id));
    toast.success('Supprimé');
  };

  const filtres  = lives.filter(l => filtre === 'Tous' || l.categorie === filtre);
  const enDirect = lives.filter(l => l.statut === 'EN_DIRECT');
  const programmes = lives.filter(l => l.statut === 'PROGRAMME');
  const archives = filtres.filter(l => l.statut === 'TERMINE');

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', color: '#1A1A1A', background: 'white' };

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Lecteur replay */}
      {replay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: 'white', margin: 0 }}>{replay.titre}</h3>
              <button onClick={() => setReplay(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              {replay.youtubeUrl ? (
                <iframe src={getEmbedUrl(replay.youtubeUrl)} title={replay.titre} allow="autoplay; encrypted-media" allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }} />
              ) : replay.videoUrl ? (
                <video src={replay.videoUrl} controls autoPlay style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 8 }} />
              ) : (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                  Aucune vidéo disponible
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: OR, fontWeight: 700, marginBottom: 14 }}>Conférences & Simulations d'audiences</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,4vw,48px)', color: 'white', margin: '0 0 14px', fontWeight: 'normal' }}>LexHaiti — En direct & Replays</h1>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 540, margin: 0, lineHeight: 1.7 }}>
              Conférences juridiques, simulations d'audiences, moot courts en direct.
            </p>
          </div>
          {estAdmin && (
            <button onClick={() => ouvrir()}
              style={{ padding: '13px 24px', background: OR, color: '#1A0000', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              + Ajouter un live
            </button>
          )}
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
                  <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0 }}>{l.description}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setReplay(l)} style={{ padding: '13px 28px', background: OR, color: '#1A0000', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>▶ Regarder</button>
                  {estAdmin && <button onClick={() => ouvrir(l)} style={{ padding: '13px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>✏️</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Programmes */}
        {programmes.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#1A1A1A', margin: '0 0 20px' }}>Prochaines conférences</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {programmes.map(l => (
                <div key={l.id} style={{ background: 'white', border: `1px solid ${OR}30`, borderRadius: 10, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: OR, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                      📅 {new Date(l.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: '#1A1A1A', margin: '0 0 6px', fontWeight: 'normal' }}>{l.titre}</h3>
                    <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', margin: 0 }}>{l.description}</p>
                  </div>
                  {estAdmin && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                      <button onClick={() => ouvrir(l)} style={{ padding: '6px 10px', background: '#EBF3FB', color: '#1E5FA8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>✏️</button>
                      <button onClick={() => supprimer(l.id)} style={{ padding: '6px 10px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>🗑</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setFiltre(cat)}
              style={{ padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${filtre === cat ? BORDEAUX : '#E2E8F0'}`, background: filtre === cat ? BORDEAUX : 'white', color: filtre === cat ? 'white' : '#64748B', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: filtre === cat ? 700 : 400, cursor: 'pointer' }}>
              {cat}
            </button>
          ))}
        </div>

        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#1A1A1A', margin: '0 0 20px' }}>Replays & Archives</h2>

        {archives.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎥</div>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>Aucun replay dans cette catégorie.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {archives.map(l => {
              const thumb    = getYoutubeThumb(l.youtubeUrl ?? '');
              const catColor = CAT_COLORS[l.categorie] ?? BORDEAUX;
              return (
                <div key={l.id} style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${BORDEAUX}12`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>

                  <div style={{ position: 'relative', height: 170, background: thumb ? `url(${thumb}) center/cover` : `linear-gradient(135deg, ${catColor}20, ${catColor}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => (l.youtubeUrl || l.videoUrl) && setReplay(l)}>
                    {!thumb && !l.videoUrl && <span style={{ fontSize: 40 }}>⚖️</span>}
                    {l.videoUrl && !thumb && <span style={{ fontSize: 40 }}>🎬</span>}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>▶</div>
                    </div>
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 8px', borderRadius: 4, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10 }}>
                      👁 {(l.vues ?? 0).toLocaleString()}
                    </div>
                    {l.videoUrl && <div style={{ position: 'absolute', top: 10, left: 10, background: BORDEAUX, color: 'white', padding: '3px 8px', borderRadius: 4, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, fontWeight: 700 }}>📁 Fichier</div>}
                  </div>

                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: catColor, fontWeight: 700, background: `${catColor}12`, padding: '2px 8px', borderRadius: 100 }}>{l.categorie}</span>
                        </div>
                        <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: '#1A1A1A', lineHeight: 1.45, margin: '0 0 6px', fontWeight: 'normal' }}>{l.titre}</h3>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8' }}>
                          📅 {new Date(l.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      {estAdmin && (
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                          <button onClick={e => { e.stopPropagation(); ouvrir(l); }} style={{ padding: '6px 8px', background: '#EBF3FB', color: '#1E5FA8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>✏️</button>
                          <button onClick={e => { e.stopPropagation(); supprimer(l.id); }} style={{ padding: '6px 8px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>🗑</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal création/édition live */}
      {modalForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${BORDEAUX}` }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: BORDEAUX, margin: 0 }}>{enEdition ? 'Modifier le live' : 'Ajouter un live'}</h2>
              <button onClick={() => setModalForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>

            <form onSubmit={sauvegarder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Titre *</label><input value={form.titre} required onChange={e => setForm((p: any) => ({ ...p, titre: e.target.value }))} placeholder="Ex : Droit constitutionnel haïtien" style={inp} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Description</label><textarea value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' }} /></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm((p: any) => ({ ...p, categorie: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {CATS.filter(c => c !== 'Tous').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Statut</label>
                  <select value={form.statut} onChange={e => setForm((p: any) => ({ ...p, statut: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {['PROGRAMME', 'EN_DIRECT', 'TERMINE'].map(s => <option key={s} value={s}>{s === 'PROGRAMME' ? '📅 Programmé' : s === 'EN_DIRECT' ? '🔴 En direct' : '✅ Terminé'}</option>)}
                  </select>
                </div>
              </div>

              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Date</label><input type="date" value={form.dateDebut} onChange={e => setForm((p: any) => ({ ...p, dateDebut: e.target.value }))} style={inp} /></div>

              {/* Choix type vidéo */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Source de la vidéo</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[{ val: 'LIVE', label: '🔗 URL (YouTube/Lien)', desc: 'Pour les lives YouTube ou liens externes' }, { val: 'UPLOAD', label: '📁 Upload depuis PC', desc: 'MP4, WebM, MOV — max 500 MB' }].map(opt => (
                    <div key={opt.val} onClick={() => setForm((p: any) => ({ ...p, type: opt.val }))}
                      style={{ border: `2px solid ${form.type === opt.val ? BORDEAUX : '#E2E8F0'}`, borderRadius: 10, padding: '12px', cursor: 'pointer', background: form.type === opt.val ? `${BORDEAUX}06` : 'white', transition: 'all 0.15s' }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: form.type === opt.val ? BORDEAUX : '#374151', marginBottom: 4 }}>{opt.label}</div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8' }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>

                {form.type === 'LIVE' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>URL YouTube ou lien direct</label>
                    <input value={form.youtubeUrl} onChange={e => setForm((p: any) => ({ ...p, youtubeUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=... ou URL directe" style={inp} />
                    <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: '6px 0 0' }}>
                      Accepte YouTube, YouTube Live, et URLs directes de vidéos
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ background: '#F8F7F4', border: '1px solid #E8E4DC', borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                      📁 <strong>Formats acceptés :</strong> MP4, WebM, OGG, MOV<br />
                      📦 <strong>Taille max :</strong> 500 MB
                    </div>
                    <div onClick={() => videoRef.current?.click()}
                      style={{ border: `2px dashed ${videoPreview ? BORDEAUX : '#E2E8F0'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: videoPreview ? `${BORDEAUX}04` : '#F8FAFC' }}>
                      {videoPreview ? (
                        <div>
                          <video src={videoPreview} style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 6, marginBottom: 8 }} />
                          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#16A34A', margin: '0 0 4px', fontWeight: 600 }}>✓ {videoFile?.name}</p>
                          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: 0 }}>Cliquer pour changer</p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: 0, fontWeight: 600 }}>Cliquer pour sélectionner une vidéo</p>
                          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>Depuis votre ordinateur, clé USB, disque externe…</p>
                        </div>
                      )}
                    </div>
                    <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov" onChange={handleVideo} style={{ display: 'none' }} />
                    {videoErreur && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#DC2626', margin: '6px 0 0' }}>⚠ {videoErreur}</p>}
                  </div>
                )}
              </div>

              <button type="submit" disabled={envoi}
                style={{ width: '100%', padding: '14px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
                {envoi ? 'Sauvegarde…' : (enEdition ? 'Enregistrer →' : 'Ajouter le live →')}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
