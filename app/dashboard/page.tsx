// app/dashboard/page.tsx — LexHaiti — Dashboard + gestion sponsors avec upload logo PC
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const BORDEAUX = '#8B0000';
const OR = '#D4AF37';
const NIVEAU_LABELS = ['', 'Débutant', 'Initié', 'Confirmé', 'Expert', 'Maître'];

export default function PageDashboard() {
  const { estConnecte, utilisateur } = useAuthStore();
  const { config } = useTenant();
  const router = useRouter();

  const [pret, setPret]             = useState(false);
  const [data, setData]             = useState<any>(null);
  const [sponsors, setSponsors]     = useState<any[]>([]);
  const [onglet, setOnglet]         = useState<'accueil' | 'sponsors'>('accueil');
  const [modalSponsor, setModalSponsor] = useState(false);
  const [formSponsor, setFormSponsor]   = useState({ nom: '', siteWeb: '', typeContrat: 'OR', couleur: BORDEAUX });
  const [logoFile, setLogoFile]     = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoErreur, setLogoErreur] = useState('');
  const [envoi, setEnvoi]           = useState(false);
  const logoRef                     = useRef<HTMLInputElement>(null);

  const primaire = config?.couleursTheme.primaire ?? BORDEAUX;
  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    const t = setTimeout(() => setPret(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!pret) return;
    if (!estConnecte) { router.replace('/auth/connexion'); return; }
    api.get('/analytics/dashboard').then(r => setData(r.data)).catch(() => {});
    api.get('/sponsors').then(({ data }) => { if (Array.isArray(data)) setSponsors(data); }).catch(() => {});
  }, [pret, estConnecte]);

  // Validation du logo uploadé
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoErreur('');

    // Vérifier format
    const formatsAcceptes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!formatsAcceptes.includes(f.type)) {
      setLogoErreur('Format non supporté. Utilisez PNG, JPG, SVG ou WebP.');
      return;
    }

    // Vérifier taille (max 2MB)
    if (f.size > 2 * 1024 * 1024) {
      setLogoErreur('Fichier trop lourd. Maximum 2 MB.');
      return;
    }

    // Vérifier dimensions avec Image
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < 100 || img.height < 50) {
        setLogoErreur('Image trop petite. Minimum 100×50 px.');
        return;
      }
      if (img.width > 2000 || img.height > 1000) {
        setLogoErreur('Image trop grande. Maximum 2000×1000 px.');
        return;
      }
      setLogoFile(f);
      setLogoPreview(URL.createObjectURL(f));
    };
    img.onerror = () => { setLogoErreur('Impossible de lire ce fichier image.'); };
    img.src = url;
  };

  // Convertir le fichier en base64 pour l'envoyer
  const fileEnBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const ajouterSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSponsor.nom.trim()) { toast.error('Le nom est requis'); return; }
    setEnvoi(true);
    try {
      let logoUrl = '';
      if (logoFile) {
        logoUrl = await fileEnBase64(logoFile);
      }
      const { data: created } = await api.post('/sponsors', { ...formSponsor, logoUrl });
      setSponsors(prev => [created, ...prev]);
      toast.success('Sponsor ajouté !');
      setModalSponsor(false);
      setFormSponsor({ nom: '', siteWeb: '', typeContrat: 'OR', couleur: BORDEAUX });
      setLogoFile(null);
      setLogoPreview('');
    } catch { toast.error('Erreur lors de l\'ajout'); }
    setEnvoi(false);
  };

  const supprimerSponsor = async (id: string) => {
    if (!confirm('Retirer ce sponsor ?')) return;
    try {
      await api.delete(`/sponsors/${id}`);
      setSponsors(prev => prev.filter(s => s.id !== id));
      toast.success('Retiré');
    } catch { toast.error('Erreur'); }
  };

  if (!pret) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#64748B', fontSize: 14 }}>Chargement…</div>
    </div>
  );

  if (!estConnecte) return null;

  const points = data?.points?.points ?? 0;
  const niveau = data?.points?.niveau ?? 1;

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', color: '#1A1A1A', background: 'white' };

  return (
    <div style={{ background: '#F8FAFB', minHeight: '100vh' }}>

      {/* Entête */}
      <div style={{ background: `linear-gradient(135deg, #1A0000 0%, ${primaire} 100%)`, padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 20, color: '#1A0000', flexShrink: 0 }}>
              {(utilisateur?.prenom?.[0] ?? '') + (utilisateur?.nom?.[0] ?? '')}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(20px,3vw,26px)', color: 'white', margin: '0 0 4px', fontWeight: 'normal' }}>
                Bonjour, {utilisateur?.prenom} !
              </h1>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  {NIVEAU_LABELS[Math.min(niveau, 5)]} · {points} pts
                </span>
                <span style={{ background: OR, color: '#1A0000', padding: '2px 10px', borderRadius: 100, fontSize: 11, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>
                  {utilisateur?.role}
                </span>
              </div>
            </div>
          </div>

          {estAdmin && (
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ id: 'accueil', label: '🏠 Tableau de bord' }, { id: 'sponsors', label: '🤝 Sponsors' }].map(o => (
                <button key={o.id} onClick={() => setOnglet(o.id as any)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: onglet === o.id ? 'white' : 'rgba(255,255,255,0.15)', color: onglet === o.id ? primaire : 'rgba(255,255,255,0.8)', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: onglet === o.id ? 700 : 400, cursor: 'pointer' }}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(24px,4vw,40px) clamp(16px,4vw,40px)' }}>

        {onglet === 'accueil' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#1A1A1A', margin: 0, fontWeight: 'normal' }}>Mes formations en cours</h2>
                <Link href="/formations" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: primaire, textDecoration: 'none', fontWeight: 600 }}>Voir tout →</Link>
              </div>
              {(!data?.inscriptions || data.inscriptions.length === 0) ? (
                <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: '32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                  <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', margin: '0 0 16px' }}>Aucune formation en cours.</p>
                  <Link href="/formations" style={{ display: 'inline-block', padding: '10px 24px', background: primaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13 }}>
                    Découvrir les formations →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {data.inscriptions.slice(0, 6).map((insc: any) => {
                    const pct = insc.progression?.pourcentage ?? 0;
                    return (
                      <Link key={insc.id} href={`/formations/${insc.coursId}`} style={{ textDecoration: 'none' }}>
                        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '14px 16px' }}>
                          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', marginBottom: 8, lineHeight: 1.4 }}>{insc.cours?.titre}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>
                            <span>{insc.progression?.terminees ?? 0}/{insc.cours?._count?.lecons ?? 0} leçons</span>
                            <span style={{ fontWeight: 700, color: pct === 100 ? '#059669' : primaire }}>{pct}%</span>
                          </div>
                          <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: pct === 100 ? '#059669' : primaire, width: `${pct}%` }} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: '20px 24px' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#1A1A1A', margin: '0 0 16px', fontWeight: 'normal' }}>Navigation rapide</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { href: '/debats',      label: '⚖️ Débats juridiques',     bg: `${primaire}08`, color: primaire },
                  { href: '/tournois',    label: '🏆 Tournois',              bg: `${OR}10`,       color: '#7C5200' },
                  { href: '/formations',  label: '📚 Formations',            bg: '#F0FDF4',       color: '#059669' },
                  { href: '/bibliotheque',label: '📖 Bibliothèque',          bg: '#F5F3FF',       color: '#7C3AED' },
                  { href: '/lives',       label: '🎥 Lives & Conférences',   bg: '#FEF2F2',       color: '#DC2626' },
                  { href: '/profil/' + utilisateur?.id, label: '👤 Mon profil', bg: '#F8F7F4',    color: '#374151' },
                  ...(!estAdmin ? [{ href: '/premium', label: '⭐ Abonnements Premium', bg: `${OR}10`, color: '#7C5200' }] : []),
                  ...(estAdmin  ? [{ href: '/admin',   label: '⚙️ Administration',       bg: '#F1F5F9',  color: '#374151' }] : []),
                ].map(({ href, label, bg, color }) => (
                  <Link key={href} href={href}
                    style={{ display: 'block', padding: '11px 14px', background: bg, borderRadius: 10, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: '20px 24px' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#1A1A1A', margin: '0 0 16px', fontWeight: 'normal' }}>Mes badges</h2>
              {(!data?.badges || data.badges.length === 0) ? (
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>Complétez des formations pour obtenir des badges.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.badges.map((b: any) => (
                    <div key={b.id} style={{ background: `${primaire}10`, border: `1px solid ${primaire}25`, borderRadius: 6, padding: '5px 10px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: primaire }}>
                      🏅 {b.titre}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {onglet === 'sponsors' && estAdmin && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#1A1A1A', margin: '0 0 6px', fontWeight: 'normal' }}>Gestion des sponsors</h2>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: 0 }}>
                  Apparaissent dans la bannière défilante sur Accueil, Tournois et Connexion.
                </p>
              </div>
              <button onClick={() => setModalSponsor(true)}
                style={{ padding: '11px 22px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                + Ajouter un sponsor
              </button>
            </div>

            {sponsors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>Aucun sponsor pour l'instant.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sponsors.map(s => (
                  <div key={s.id} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 10, background: '#F8F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid #E8E4DC' }}>
                      {s.logoUrl ? <img src={s.logoUrl} alt={s.nom} style={{ maxWidth: 56, maxHeight: 56, objectFit: 'contain' }} /> : <span style={{ fontWeight: 700, color: s.couleur ?? primaire, fontSize: 22 }}>{s.nom?.[0]}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 4 }}>{s.nom}</div>
                      <span style={{ background: '#F1F5F9', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, color: '#475569', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{s.typeContrat}</span>
                    </div>
                    <button onClick={() => supprimerSponsor(s.id)}
                      style={{ padding: '8px 14px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      🗑 Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal sponsor — upload logo depuis PC */}
      {modalSponsor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${primaire}` }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: primaire, margin: 0 }}>Ajouter un sponsor</h2>
              <button onClick={() => setModalSponsor(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={ajouterSponsor} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Upload logo */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                  Logo de l'entreprise
                </label>
                <div style={{ background: '#F8F7F4', border: '1px solid #E8E4DC', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                  📐 <strong>Dimensions recommandées :</strong> 300×100 px (ratio 3:1)<br />
                  📁 <strong>Formats acceptés :</strong> PNG, JPG, SVG, WebP<br />
                  📦 <strong>Taille max :</strong> 2 MB · <strong>Min :</strong> 100×50 px
                </div>

                <div onClick={() => logoRef.current?.click()}
                  style={{ border: `2px dashed ${logoPreview ? primaire : '#E2E8F0'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: logoPreview ? `${primaire}04` : '#F8FAFC', transition: 'all 0.2s' }}>
                  {logoPreview ? (
                    <div>
                      <img src={logoPreview} alt="Aperçu" style={{ maxWidth: 200, maxHeight: 80, objectFit: 'contain', margin: '0 auto', display: 'block', borderRadius: 6 }} />
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#16A34A', margin: '8px 0 0', fontWeight: 600 }}>✓ {logoFile?.name}</p>
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>Cliquer pour changer</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: 0, fontWeight: 600 }}>Cliquer pour sélectionner un logo</p>
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>Depuis votre ordinateur ou autre source</p>
                    </div>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" onChange={handleLogo} style={{ display: 'none' }} />
                {logoErreur && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#DC2626', margin: '6px 0 0' }}>⚠ {logoErreur}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Nom du sponsor *</label>
                <input required value={formSponsor.nom} onChange={e => setFormSponsor(p => ({ ...p, nom: e.target.value }))} placeholder="Ex : Barreau de Port-au-Prince" style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Site web</label>
                <input type="url" value={formSponsor.siteWeb} onChange={e => setFormSponsor(p => ({ ...p, siteWeb: e.target.value }))} placeholder="https://..." style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Niveau partenariat</label>
                  <select value={formSponsor.typeContrat} onChange={e => setFormSponsor(p => ({ ...p, typeContrat: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {['PLATINE', 'OR', 'ARGENT', 'BRONZE'].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Couleur de fond</label>
                  <input type="color" value={formSponsor.couleur} onChange={e => setFormSponsor(p => ({ ...p, couleur: e.target.value }))} style={{ ...inp, height: 44, padding: 4, cursor: 'pointer' }} />
                </div>
              </div>

              <button type="submit" disabled={envoi || !!logoErreur || !formSponsor.nom.trim()}
                style={{ width: '100%', padding: '14px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4, opacity: (envoi || !!logoErreur || !formSponsor.nom.trim()) ? 0.5 : 1 }}>
                {envoi ? 'Ajout…' : 'Ajouter le sponsor →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
