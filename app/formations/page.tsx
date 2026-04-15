// app/formations/page.tsx — LexHaiti
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import ModalPaiement from '@/components/paiement/ModalPaiement';
import toast from 'react-hot-toast';

const BORDEAUX = '#8B0000';
const OR       = '#D4AF37';

const NIV: Record<string, { bg: string; text: string; label: string }> = {
  DEBUTANT:      { bg: '#DCFCE7', text: '#166534', label: 'Débutant' },
  INTERMEDIAIRE: { bg: '#FEF9C3', text: '#854D0E', label: 'Intermédiaire' },
  AVANCE:        { bg: '#FCE7F3', text: '#9D174D', label: 'Avancé' },
};

const FORMATIONS_DEMO = [
  { id: 'F1', titre: 'Introduction au débat juridique', description: 'Les fondamentaux du débat structuré et de l\'argumentation juridique en contexte haïtien.', niveau: 'DEBUTANT', categorie: 'Rhétorique juridique', publie: true, gratuit: true, _count: { lecons: 8, inscriptions: 124 }, imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80' },
  { id: 'F2', titre: 'Droit constitutionnel haïtien', description: 'Les grands principes constitutionnels et leur application dans le système judiciaire haïtien.', niveau: 'INTERMEDIAIRE', categorie: 'Droit public', publie: true, gratuit: false, _count: { lecons: 14, inscriptions: 67 }, imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' },
  { id: 'F3', titre: 'Rhétorique et plaidoirie avancée', description: 'Techniques de persuasion, plaidoirie et négociation pour les praticiens du droit.', niveau: 'AVANCE', categorie: 'Rhétorique juridique', publie: true, gratuit: false, _count: { lecons: 18, inscriptions: 32 }, imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80' },
  { id: 'F4', titre: 'Procédure civile haïtienne', description: 'Maîtrisez les règles de procédure du Tribunal de Première Instance et de la Cour d\'Appel.', niveau: 'INTERMEDIAIRE', categorie: 'Procédure civile', publie: true, gratuit: false, _count: { lecons: 12, inscriptions: 89 }, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
];

const CATEGORIES = ['Tous', 'Rhétorique juridique', 'Droit public', 'Procédure civile', 'Droit immobilier', 'Droit des affaires', 'Droit social', 'Droit pénal'];

const FORM_VIDE = { titre: '', description: '', niveau: 'DEBUTANT', categorie: 'Rhétorique juridique', publie: true, gratuit: true, typeVideo: 'UPLOAD' as 'UPLOAD' | 'URL', videoUrl: '', imageUrl: '' };

export default function PageFormations() {
  const { estConnecte, utilisateur } = useAuthStore();
  const { config } = useTenant();

  const [formations, setFormations]   = useState(FORMATIONS_DEMO);
  const [filtreNiveau, setFiltreNiveau] = useState('tous');
  const [filtreCat, setFiltreCat]       = useState('Tous');
  const [chargement, setChargement]     = useState(true);
  const [modal, setModal]               = useState<{ montantHTG: number; description: string } | null>(null);
  const [modalForm, setModalForm]       = useState(false);
  const [enEdition, setEnEdition]       = useState<any>(null);
  const [form, setForm]                 = useState<any>(FORM_VIDE);
  const [videoFile, setVideoFile]       = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoErreur, setVideoErreur]   = useState('');
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [envoi, setEnvoi]               = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    api.get('/cours')
      .then(({ data }) => { if (Array.isArray(data) && data.length) setFormations(data); })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoErreur('');
    if (!['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(f.type)) {
      setVideoErreur('Format non supporté. Utilisez MP4, WebM, OGG ou MOV.'); return;
    }
    if (f.size > 500 * 1024 * 1024) { setVideoErreur('Fichier trop lourd. Maximum 500 MB.'); return; }
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) return;
    if (f.size > 2 * 1024 * 1024) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const fileEnBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file);
  });

  const ouvrir = (f?: any) => {
    setEnEdition(f ?? null);
    setForm(f ? { titre: f.titre, description: f.description, niveau: f.niveau, categorie: f.categorie, publie: f.publie, gratuit: f.gratuit ?? true, typeVideo: 'UPLOAD', videoUrl: f.videoUrl ?? '', imageUrl: f.imageUrl ?? '' } : FORM_VIDE);
    setVideoFile(null); setVideoPreview(''); setVideoErreur('');
    setImageFile(null); setImagePreview('');
    setModalForm(true);
  };

  const sauvegarder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) { toast.error('Le titre est requis'); return; }
    setEnvoi(true);
    try {
      let videoUrl = form.typeVideo === 'URL' ? form.videoUrl : '';
      let imageUrl = form.imageUrl;
      if (videoFile && form.typeVideo === 'UPLOAD') videoUrl = await fileEnBase64(videoFile);
      if (imageFile) imageUrl = await fileEnBase64(imageFile);
      const payload = { titre: form.titre, description: form.description, niveau: form.niveau, categorie: form.categorie, publie: form.publie, gratuit: form.gratuit, videoUrl, imageUrl };
      if (enEdition) {
        await api.patch(`/cours/${enEdition.id}`, payload).catch(() => {});
        setFormations(prev => prev.map(f => f.id === enEdition.id ? { ...f, ...payload } : f));
        toast.success('✅ Formation mise à jour !');
      } else {
        let nouveau: any;
        try { const { data } = await api.post('/cours', payload); nouveau = { ...data, _count: { lecons: 0, inscriptions: 0 } }; }
        catch { nouveau = { ...payload, id: 'local_' + Date.now(), _count: { lecons: 0, inscriptions: 0 } }; }
        setFormations(prev => [nouveau, ...prev]);
        toast.success('✅ Formation créée !');
      }
      setModalForm(false);
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    setEnvoi(false);
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return;
    await api.delete(`/cours/${id}`).catch(() => {});
    setFormations(prev => prev.filter(f => f.id !== id));
    toast.success('Formation supprimée');
  };

  const filtrees = formations.filter(f => {
    if (!f.publie && !estAdmin) return false;
    if (filtreNiveau !== 'tous' && f.niveau !== filtreNiveau) return false;
    if (filtreCat !== 'Tous' && f.categorie !== filtreCat) return false;
    return true;
  });

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', color: '#1A1A1A', background: 'white' };

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      {modal && <ModalPaiement montantHTG={modal.montantHTG} description={modal.description} plan="PREMIUM" onFermer={() => setModal(null)} />}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: OR, fontWeight: 700, marginBottom: 14 }}>Formation juridique professionnelle</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,4vw,48px)', color: 'white', margin: '0 0 14px', fontWeight: 'normal' }}>Maîtrisez le droit haïtien</h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(14px,1.6vw,17px)', color: 'rgba(255,255,255,0.7)', maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Formations conçues par des juristes haïtiens. Du débat à la plaidoirie, progressez à votre rythme.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, padding: 4 }}>
            {['tous', 'DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'].map(n => (
              <button key={n} onClick={() => setFiltreNiveau(n)}
                style={{ padding: '8px 16px', borderRadius: 100, border: 'none', background: filtreNiveau === n ? 'white' : 'transparent', color: filtreNiveau === n ? BORDEAUX : 'rgba(255,255,255,0.75)', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: filtreNiveau === n ? 700 : 400, cursor: 'pointer' }}>
                {n === 'tous' ? 'Tous' : NIV[n]?.label}
              </button>
            ))}
          </div>
          {estAdmin && (
            <button onClick={() => ouvrir()}
              style={{ padding: '8px 20px', background: OR, color: '#1A0000', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
              + Nouvelle formation
            </button>
          )}
        </div>
      </section>

      {/* Filtres catégorie */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 56, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5vw,48px)', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFiltreCat(cat)}
              style={{ padding: '13px 14px', background: 'none', border: 'none', borderBottom: `2px solid ${filtreCat === cat ? BORDEAUX : 'transparent'}`, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: filtreCat === cat ? BORDEAUX : '#64748B', fontWeight: filtreCat === cat ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>
        {chargement ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Chargement…</div>
        ) : filtrees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B' }}>Aucune formation dans cette catégorie.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filtrees.map(f => {
              const niv = NIV[f.niveau] ?? NIV['DEBUTANT'];
              return (
                <div key={f.id} style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', position: 'relative' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${BORDEAUX}12`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>

                  {estAdmin && (
                    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 4 }}>
                      <button onClick={() => ouvrir(f)} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>✏️</button>
                      <button onClick={() => supprimer(f.id)} style={{ padding: '4px 8px', background: 'rgba(254,242,242,0.9)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#DC2626' }}>🗑</button>
                    </div>
                  )}

                  <Link href={`/formations/${f.id}`} style={{ textDecoration: 'none', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {f.imageUrl ? (
                      <div style={{ height: 160, background: `url(${f.imageUrl}) center/cover`, backgroundColor: `${BORDEAUX}20` }} />
                    ) : (
                      <div style={{ height: 160, background: `linear-gradient(135deg, ${BORDEAUX}20, ${OR}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>⚖️</div>
                    )}
                    <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ background: niv.bg, color: niv.text, fontSize: 10, padding: '2px 8px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>{niv.label}</span>
                        {f.gratuit !== false && <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>Gratuit</span>}
                        {!f.publie && estAdmin && <span style={{ background: '#FEF2F2', color: '#DC2626', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>Non publié</span>}
                      </div>
                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#1A1A1A', lineHeight: 1.4, margin: '0 0 8px', fontWeight: 'normal', flex: 1 }}>{f.titre}</h3>
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', lineHeight: 1.55, margin: '0 0 14px' }}>{f.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>
                          📚 {f._count?.lecons ?? 0} leçons · 👥 {f._count?.inscriptions ?? 0} inscrits
                        </div>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: BORDEAUX }}>Voir →</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 48, background: '#1A0000', borderRadius: 12, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: OR, margin: '0 0 8px' }}>Complétez vos formations avec la bibliothèque légale</h3>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: 480 }}>Accédez aux codes, jurisprudences et doctrine haïtienne pour approfondir chaque cours.</p>
          </div>
          <Link href="/bibliotheque" style={{ padding: '12px 24px', background: OR, color: '#1A0000', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>Bibliothèque →</Link>
        </div>
      </div>

      {/* Modal création/édition formation */}
      {modalForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${BORDEAUX}` }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: BORDEAUX, margin: 0 }}>{enEdition ? 'Modifier la formation' : 'Nouvelle formation'}</h2>
              <button onClick={() => setModalForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>

            <form onSubmit={sauvegarder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Titre *</label><input value={form.titre} required onChange={e => setForm((p: any) => ({ ...p, titre: e.target.value }))} placeholder="Ex : Introduction au droit haïtien" style={inp} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Description</label><textarea value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' }} /></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Niveau</label>
                  <select value={form.niveau} onChange={e => setForm((p: any) => ({ ...p, niveau: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'].map(n => <option key={n} value={n}>{NIV[n].label}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm((p: any) => ({ ...p, categorie: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {CATEGORIES.filter(c => c !== 'Tous').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" checked={form.publie} onChange={e => setForm((p: any) => ({ ...p, publie: e.target.checked }))} /> Publier
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" checked={form.gratuit} onChange={e => setForm((p: any) => ({ ...p, gratuit: e.target.checked }))} /> Gratuit
                </label>
              </div>

              {/* Image de couverture */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Image de couverture</label>
                <div onClick={() => imageRef.current?.click()}
                  style={{ border: `2px dashed ${imagePreview ? BORDEAUX : '#E2E8F0'}`, borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer', background: imagePreview ? `${BORDEAUX}04` : '#F8FAFC', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imagePreview ? (
                    <img src={imagePreview} style={{ maxHeight: 64, maxWidth: '100%', objectFit: 'contain', borderRadius: 4 }} />
                  ) : (
                    <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>🖼 Cliquer pour ajouter une image (PNG, JPG — max 2MB)</span>
                  )}
                </div>
                <input ref={imageRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImage} style={{ display: 'none' }} />
              </div>

              {/* Vidéo de la formation */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Vidéo de la formation (pré-enregistrée)</label>
                <div style={{ background: '#F8F7F4', border: '1px solid #E8E4DC', borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                  📁 <strong>Formats :</strong> MP4, WebM, OGG, MOV · <strong>Max :</strong> 500 MB
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
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: 0, fontWeight: 600 }}>Cliquer pour sélectionner la vidéo</p>
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>Depuis votre ordinateur, clé USB, disque externe, Google Drive…</p>
                    </div>
                  )}
                </div>
                <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov" onChange={handleVideo} style={{ display: 'none' }} />
                {videoErreur && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#DC2626', margin: '6px 0 0' }}>⚠ {videoErreur}</p>}
              </div>

              <button type="submit" disabled={envoi}
                style={{ width: '100%', padding: '14px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
                {envoi ? 'Sauvegarde…' : (enEdition ? 'Enregistrer →' : 'Créer la formation →')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
