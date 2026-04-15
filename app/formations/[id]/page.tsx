// app/formations/[id]/page.tsx — LexHaiti
// Accessible sans connexion — redirection vers premium si payant
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import ModalPaiement from '@/components/paiement/ModalPaiement';

const BORDEAUX = '#8B0000';
const OR = '#D4AF37';

const NIV: Record<string, { bg: string; text: string; label: string }> = {
  DEBUTANT:      { bg: '#DCFCE7', text: '#166534', label: 'Débutant' },
  INTERMEDIAIRE: { bg: '#FEF9C3', text: '#854D0E', label: 'Intermédiaire' },
  AVANCE:        { bg: '#FCE7F3', text: '#9D174D', label: 'Avancé' },
};

const FORMATION_DEMO = {
  id: 'demo', titre: 'Introduction au débat juridique', description: 'Les fondamentaux de l\'argumentation juridique en droit haïtien.',
  niveau: 'DEBUTANT', categorie: 'Rhétorique juridique', publie: true, gratuit: true,
  lecons: [
    { id: 'l1', titre: 'Les techniques d\'argumentation', dureeMin: 25, quiz: false },
    { id: 'l2', titre: 'Structure d\'un plaidoyer', dureeMin: 30, quiz: true },
    { id: 'l3', titre: 'La réfutation en droit', dureeMin: 20, quiz: false },
  ],
  _count: { lecons: 8, inscriptions: 124 },
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
      .catch(() => setFormation(FORMATION_DEMO))
      .finally(() => setChargement(false));
    if (estConnecte) {
      api.get(`/cours/${id}/progression`).then(({ data }) => setProgression(data)).catch(() => {});
    }
  }, [id, estConnecte]);

  const sInscrire = async () => {
    if (!estConnecte) {
      // Rediriger vers inscription puis revenir ici
      router.push(`/auth/inscription?redirect=/formations/${id}`);
      return;
    }
    // Vérifier si la formation est payante
    if (formation?.gratuit === false || formation?.premiumRequis) {
      setModal(true);
      return;
    }
    try {
      await api.post(`/cours/${id}/inscrire`, {});
      setInscrit(true);
    } catch {}
  };

  if (chargement) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: `3px solid #F5F0E8`, borderTopColor: BORDEAUX, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!formation) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>📚</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 'normal', color: '#1A1A1A' }}>Formation introuvable</h2>
      <Link href="/formations" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: BORDEAUX, fontSize: 14 }}>← Retour aux formations</Link>
    </div>
  );

  const niv          = NIV[formation.niveau] ?? NIV['DEBUTANT'];
  const dejaInscrit  = inscrit || progression?.terminees !== undefined;
  const pct          = progression?.pourcentage ?? 0;
  const estGratuit   = formation.gratuit !== false;

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      {modal && (
        <ModalPaiement
          montantHTG={600}
          description={`Accès à la formation : ${formation.titre}`}
          plan="PREMIUM"
          onFermer={() => setModal(false)}
          onSucces={() => { setModal(false); setInscrit(true); }}
        />
      )}

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,56px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              <Link href="/formations" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Formations</Link>
              <span>/</span>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>{formation.categorie}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ background: niv.bg, color: niv.text, fontSize: 11, padding: '3px 12px', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>{niv.label}</span>
              {estGratuit ? (
                <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 11, padding: '3px 12px', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>✓ Gratuit</span>
              ) : (
                <span style={{ background: `${OR}25`, color: OR, fontSize: 11, padding: '3px 12px', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>⭐ Premium</span>
              )}
            </div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 'normal', color: 'white', margin: '0 0 12px', lineHeight: 1.2 }}>{formation.titre}</h1>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 16, maxWidth: 560 }}>{formation.description}</p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[`📚 ${formation.lecons?.length ?? formation._count?.lecons ?? 0} leçons`, `👥 ${formation._count?.inscriptions ?? 0} inscrits`].map(s => (
                <span key={s} style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Carte inscription */}
          <div style={{ background: 'white', borderRadius: 14, padding: '24px', minWidth: 220, boxShadow: '0 16px 48px rgba(0,0,0,0.25)', flexShrink: 0 }}>
            {dejaInscrit && progression ? (
              <>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#16A34A', fontWeight: 700, marginBottom: 8 }}>✅ Inscrit</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 700, color: BORDEAUX, marginBottom: 8 }}>{pct}%</div>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ height: '100%', background: BORDEAUX, width: `${pct}%`, borderRadius: 3 }} />
                </div>
                <Link href={`/formations/${id}/lecons/${formation.lecons?.[0]?.id ?? '1'}`}
                  style={{ display: 'block', padding: '13px', background: BORDEAUX, color: 'white', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                  {pct === 0 ? 'Commencer →' : pct === 100 ? 'Revoir →' : 'Continuer →'}
                </Link>
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 700, color: estGratuit ? '#16A34A' : BORDEAUX, marginBottom: 4 }}>
                  {estGratuit ? 'Gratuit' : '600 HTG'}
                </div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginBottom: 16, lineHeight: 1.5 }}>
                  ✓ Accès à vie · ✓ Certificat inclus
                </div>
                <button onClick={sInscrire}
                  style={{ width: '100%', padding: '13px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}>
                  {!estConnecte ? 'S\'inscrire pour accéder →' : (estGratuit ? 'Commencer gratuitement' : 'S\'abonner pour accéder')}
                </button>
                {!estConnecte && (
                  <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                    Créez un compte gratuit pour commencer
                  </p>
                )}
                {!estGratuit && estConnecte && (
                  <Link href="/premium" style={{ display: 'block', textAlign: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: BORDEAUX, textDecoration: 'none', fontWeight: 600 }}>
                    Voir les abonnements →
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Corps */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,56px)', display: 'grid', gridTemplateColumns: '1fr 240px', gap: 32 }}>
        <div>
          {/* Ce que vous apprendrez */}
          <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, padding: '24px', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 16px' }}>Ce que vous apprendrez</h2>
            {['Maîtriser l\'argumentation juridique haïtienne', 'Construire un plaidoyer solide', 'Réfuter les arguments adverses', 'Obtenir votre certification reconnue'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ color: BORDEAUX, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#374151' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Programme */}
          {formation.lecons?.length > 0 && (
            <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, padding: '24px' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 20px' }}>
                Programme — {formation.lecons.length} leçons
              </h2>
              {formation.lecons.map((l: any, i: number) => {
                const termine = progression && i < (progression.terminees ?? 0);
                const accessible = dejaInscrit || i === 0;
                return (
                  <div key={l.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < formation.lecons.length - 1 ? '1px solid #F5F0E8' : 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: termine ? `${BORDEAUX}10` : '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: termine ? BORDEAUX : '#94A3B8', fontWeight: 700, flexShrink: 0 }}>
                      {termine ? '✓' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      {accessible && dejaInscrit ? (
                        <Link href={`/formations/${id}/lecons/${l.id}`} style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', textDecoration: 'none', display: 'block', marginBottom: 2 }}>{l.titre}</Link>
                      ) : (
                        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>{l.titre}</p>
                      )}
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8' }}>⏱ {l.dureeMin} min{l.quiz ? ' · 📝 Quiz' : ''}</span>
                    </div>
                    {!dejaInscrit && i > 0 && <span style={{ color: '#CBD5E1', fontSize: 14 }}>🔒</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: '18px' }}>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 12px' }}>Certifications incluses</h3>
            {['Reconnu par les barreaux haïtiens', 'Badge numérique vérifiable', 'Accès à vie au contenu'].map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: BORDEAUX, fontWeight: 700, fontSize: 12 }}>✓</span>
                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151' }}>{c}</span>
              </div>
            ))}
          </div>
          {!estConnecte && (
            <div style={{ background: `${BORDEAUX}06`, border: `1px solid ${BORDEAUX}20`, borderRadius: 10, padding: '16px 18px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', margin: '0 0 12px', lineHeight: 1.6 }}>Créez un compte gratuit pour accéder aux formations.</p>
              <Link href="/auth/inscription" style={{ display: 'block', padding: '10px', background: BORDEAUX, color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
                S'inscrire gratuitement →
              </Link>
            </div>
          )}
        </div>
      </div>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr auto"]{grid-template-columns:1fr!important;}div[style*="grid-template-columns: 1fr 240px"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
