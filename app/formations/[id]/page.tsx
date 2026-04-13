// app/formations/[id]/page.tsx — LexHaiti
// ⚠️ SPÉCIFIQUE À LEXHAITI — adapté au vocabulaire juridique

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import ModalPaiement from '@/components/paiement/ModalPaiement';

const BORDEAUX = '#8B0000';
const OR       = '#D4AF37';

const NIV: Record<string, { bg: string; text: string; label: string }> = {
  DEBUTANT:      { bg: '#DCFCE7', text: '#166534', label: 'Débutant' },
  INTERMEDIAIRE: { bg: '#FEF9C3', text: '#854D0E', label: 'Intermédiaire' },
  AVANCE:        { bg: '#FCE7F3', text: '#9D174D', label: 'Avancé' },
};

export default function PageFormationDetail() {
  const { id }    = useParams() as { id: string };
  const { estConnecte, utilisateur } = useAuthStore();
  const router    = useRouter();

  const [formation, setFormation] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [modal, setModal]           = useState(false);
  const [inscrit, setInscrit]       = useState(false);
  const [progression, setProgression] = useState<any>(null);

  useEffect(() => {
    api.get(`/cours/${id}`)
      .then(({ data }) => setFormation(data))
      .catch(() => {})
      .finally(() => setChargement(false));

    if (estConnecte) {
      api.get(`/cours/${id}/progression`)
        .then(({ data }) => setProgression(data))
        .catch(() => {});
    }
  }, [id, estConnecte]);

  const sInscrire = async () => {
    if (!estConnecte) { router.push('/auth/inscription'); return; }
    try {
      await api.post(`/cours/${id}/inscrire`, {});
      setInscrit(true);
    } catch {}
  };

  if (chargement) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: `3px solid #F1F5F9`, borderTopColor: BORDEAUX, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!formation) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>📚</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal' }}>Formation introuvable</h2>
      <Link href="/formations" style={{ color: BORDEAUX, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>← Retour aux formations</Link>
    </div>
  );

  const niv = NIV[formation.niveau] ?? NIV['DEBUTANT'];
  const pct = progression?.pourcentage ?? 0;
  const dejaInscrit = inscrit || (progression?.terminees !== undefined);

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      {modal && <ModalPaiement montantHTG={600} description={formation.titre} plan="PREMIUM" onFermer={() => setModal(false)} onSucces={() => { setModal(false); setInscrit(true); }} />}

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,56px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start', position: 'relative', zIndex: 1 }}>
          <div>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              <Link href="/formations" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Formations</Link>
              <span>/</span>
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{formation.categorie}</span>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ background: niv.bg, color: niv.text, fontSize: 11, padding: '3px 12px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>
                {niv.label}
              </span>
              {formation.categorie && (
                <span style={{ background: `${OR}25`, color: OR, fontSize: 11, padding: '3px 12px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600 }}>
                  ⚖️ {formation.categorie}
                </span>
              )}
            </div>

            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 'normal', color: 'white', lineHeight: 1.25, marginBottom: 14 }}>
              {formation.titre}
            </h1>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 20, maxWidth: 560 }}>
              {formation.description}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                `📚 ${formation.lecons?.length ?? formation._count?.lecons ?? 0} leçons`,
                `👥 ${formation._count?.inscriptions ?? 0} inscrits`,
                ...(formation.createur ? [`👨‍⚖️ ${formation.createur.prenom} ${formation.createur.nom}`] : []),
              ].map(s => (
                <span key={s} style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Carte d'inscription */}
          <div style={{ background: 'white', borderRadius: 14, padding: '24px', minWidth: 220, flexShrink: 0, boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}>
            {dejaInscrit && progression ? (
              <>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#16A34A', fontWeight: 700, marginBottom: 8 }}>✅ Inscrit</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 700, color: BORDEAUX, marginBottom: 8 }}>{pct}%</div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                  {progression.terminees}/{progression.totalLecons} leçons complétées
                </div>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ height: '100%', background: pct === 100 ? '#16A34A' : BORDEAUX, width: `${pct}%`, borderRadius: 3 }} />
                </div>
                <Link href={`/formations/${id}/lecons/${formation.lecons?.[0]?.id ?? '1'}`}
                  style={{ display: 'block', width: '100%', padding: '13px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                  {pct === 0 ? 'Commencer →' : pct === 100 ? 'Revoir →' : 'Continuer →'}
                </Link>
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>
                  Gratuit
                </div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>
                  ✓ Accès à vie · ✓ Certificat
                </div>
                <button onClick={sInscrire}
                  style={{ width: '100%', padding: '13px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10, boxShadow: `0 4px 16px ${BORDEAUX}40` }}>
                  {!estConnecte ? 'S\'inscrire →' : 'Commencer gratuitement'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Corps */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,56px)', display: 'grid', gridTemplateColumns: '1fr 240px', gap: 32 }}>

        {/* Contenu principal */}
        <div>
          {/* Programme */}
          {formation.lecons?.length > 0 && (
            <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 14, padding: '24px', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 20px' }}>
                Programme ({formation.lecons.length} leçons)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {formation.lecons.map((l: any, i: number) => {
                  const termine = progression && i < (progression.terminees ?? 0);
                  return (
                    <div key={l.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < formation.lecons.length - 1 ? '1px solid #F8F7F4' : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: termine ? '#DCFCE7' : `${BORDEAUX}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: termine ? '#16A34A' : BORDEAUX, fontFamily: 'Georgia,serif', fontWeight: 700, flexShrink: 0 }}>
                        {termine ? '✓' : i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        {dejaInscrit ? (
                          <Link href={`/formations/${id}/lecons/${l.id}`}
                            style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', textDecoration: 'none', display: 'block', marginBottom: 2 }}>
                            {l.titre}
                          </Link>
                        ) : (
                          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>
                            {l.titre}
                          </p>
                        )}
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8' }}>
                          ⏱ {l.dureeMin} min{l.quiz ? ' · 📝 Quiz inclus' : ''}
                        </span>
                      </div>
                      {!dejaInscrit && i > 0 && <span style={{ fontSize: 14, color: '#CBD5E1' }}>🔒</span>}
                      {dejaInscrit && <span style={{ fontSize: 12, color: BORDEAUX }}>▶</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Ce que vous apprendrez */}
          <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, padding: '18px' }}>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 12px' }}>
              Ce que vous apprendrez
            </h3>
            {['Argumentation juridique rigoureuse', 'Application au droit haïtien', 'Cas pratiques commentés', 'Certificat numérique'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ color: BORDEAUX, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Lien Bibliothèque */}
          <div style={{ background: '#1A0000', borderRadius: 12, padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📚</div>
            <p style={{ fontFamily: 'Georgia,serif', fontSize: 14, color: OR, margin: '0 0 10px' }}>Bibliothèque légale</p>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Accédez aux textes de loi référencés dans cette formation.
            </p>
            <Link href="/bibliotheque" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: OR, textDecoration: 'none', fontWeight: 700 }}>
              Accéder →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          div[style*="grid-template-columns: 1fr auto"]{grid-template-columns:1fr!important;}
          div[style*="grid-template-columns: 1fr 240px"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
