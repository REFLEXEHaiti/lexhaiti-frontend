// app/formations/page.tsx — LexHaiti
// ⚠️ SPÉCIFIQUE À LEXHAITI
// Catalogue des formations juridiques avec catégories propres au droit haïtien

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import ModalPaiement from '@/components/paiement/ModalPaiement';

const BORDEAUX = '#8B0000';
const OR       = '#D4AF37';

const NIV: Record<string, { bg: string; text: string; label: string }> = {
  DEBUTANT:      { bg: '#DCFCE7', text: '#166534', label: 'Débutant' },
  INTERMEDIAIRE: { bg: '#FEF9C3', text: '#854D0E', label: 'Intermédiaire' },
  AVANCE:        { bg: '#FCE7F3', text: '#9D174D', label: 'Avancé' },
};

// Formations de démonstration spécifiques au droit haïtien
const FORMATIONS_DEMO = [
  { id: 'F1', titre: 'Introduction au débat juridique', description: 'Les fondamentaux du débat structuré et de l\'argumentation juridique en contexte haïtien.', niveau: 'DEBUTANT', categorie: 'Rhétorique juridique', publie: true, _count: { lecons: 8, inscriptions: 124 }, imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80' },
  { id: 'F2', titre: 'Droit constitutionnel haïtien', description: 'Les grands principes constitutionnels et leur application dans le système judiciaire haïtien.', niveau: 'INTERMEDIAIRE', categorie: 'Droit public', publie: true, _count: { lecons: 14, inscriptions: 67 }, imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' },
  { id: 'F3', titre: 'Rhétorique et plaidoirie avancée', description: 'Techniques de persuasion, plaidoirie et négociation pour les praticiens du droit.', niveau: 'AVANCE', categorie: 'Rhétorique juridique', publie: true, _count: { lecons: 18, inscriptions: 32 }, imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80' },
  { id: 'F4', titre: 'Procédure civile haïtienne', description: 'Maîtrisez les règles de procédure du Tribunal de Première Instance et de la Cour d\'Appel.', niveau: 'INTERMEDIAIRE', categorie: 'Procédure civile', publie: true, _count: { lecons: 12, inscriptions: 89 }, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
  { id: 'F5', titre: 'Droit foncier haïtien', description: 'Régime foncier, titres de propriété, conflits immobiliers et droit agraire en Haïti.', niveau: 'AVANCE', categorie: 'Droit immobilier', publie: true, _count: { lecons: 16, inscriptions: 45 }, imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80' },
  { id: 'F6', titre: 'Droit du travail haïtien', description: 'Code du Travail haïtien, contrats, licenciements et protection des travailleurs.', niveau: 'DEBUTANT', categorie: 'Droit social', publie: true, _count: { lecons: 10, inscriptions: 178 }, imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80' },
];

const CATEGORIES = ['Tous', 'Rhétorique juridique', 'Droit public', 'Procédure civile', 'Droit immobilier', 'Droit des affaires', 'Droit social', 'Droit pénal'];

export default function PageFormations() {
  const { estConnecte, utilisateur } = useAuthStore();
  const { config } = useTenant();
  const router = useRouter();

  const [formations, setFormations] = useState(FORMATIONS_DEMO);
  const [filtreNiveau, setFiltreNiveau]  = useState('tous');
  const [filtreCat, setFiltreCat]        = useState('Tous');
  const [chargement, setChargement]      = useState(true);
  const [modal, setModal]                = useState<{ montantHTG: number; description: string } | null>(null);

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    api.get('/cours')
      .then(({ data }) => { if (Array.isArray(data) && data.length) setFormations(data); })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const filtrees = formations.filter(f => {
    if (!f.publie && !estAdmin) return false;
    if (filtreNiveau !== 'tous' && f.niveau !== filtreNiveau) return false;
    if (filtreCat !== 'Tous' && f.categorie !== filtreCat) return false;
    return true;
  });

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      {modal && <ModalPaiement montantHTG={modal.montantHTG} description={modal.description} plan="PREMIUM" onFermer={() => setModal(null)} />}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: OR, fontWeight: 700, marginBottom: 14 }}>
          Formation juridique professionnelle
        </div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,4vw,48px)', color: 'white', margin: '0 0 14px', fontWeight: 'normal' }}>
          Maîtrisez le droit haïtien
        </h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(14px,1.6vw,17px)', color: 'rgba(255,255,255,0.7)', maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Formations conçues par des juristes haïtiens. Du débat à la plaidoirie, progressez à votre rythme.
        </p>

        {/* Filtres niveau */}
        <div style={{ display: 'inline-flex', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, padding: 4 }}>
          {['tous', 'DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'].map(n => (
            <button key={n} onClick={() => setFiltreNiveau(n)}
              style={{ padding: '8px 16px', borderRadius: 100, border: 'none', background: filtreNiveau === n ? 'white' : 'transparent', color: filtreNiveau === n ? BORDEAUX : 'rgba(255,255,255,0.75)', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: filtreNiveau === n ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
              {n === 'tous' ? 'Tous' : NIV[n]?.label}
            </button>
          ))}
        </div>
      </section>

      {/* Filtres catégorie */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 56, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5vw,48px)', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFiltreCat(cat)}
              style={{ padding: '13px 14px', background: 'none', border: 'none', borderBottom: `2px solid ${filtreCat === cat ? BORDEAUX : 'transparent'}`, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: filtreCat === cat ? BORDEAUX : '#64748B', fontWeight: filtreCat === cat ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grille formations */}
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
                <Link key={f.id} href={`/formations/${f.id}`} style={{ textDecoration: 'none' }}>
                  <article style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${BORDEAUX}12`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>

                    {/* Image */}
                    {f.imageUrl ? (
                      <div style={{ height: 160, background: `url(${f.imageUrl}) center/cover`, backgroundColor: `${BORDEAUX}20` }} />
                    ) : (
                      <div style={{ height: 160, background: `linear-gradient(135deg, ${BORDEAUX}20, ${OR}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                        ⚖️
                      </div>
                    )}

                    <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ background: niv.bg, color: niv.text, fontSize: 10, padding: '2px 8px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>
                          {niv.label}
                        </span>
                        {f.categorie && (
                          <span style={{ background: `${BORDEAUX}10`, color: BORDEAUX, fontSize: 10, padding: '2px 8px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600 }}>
                            {f.categorie}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#1A1A1A', lineHeight: 1.4, margin: '0 0 8px', fontWeight: 'normal', flex: 1 }}>
                        {f.titre}
                      </h3>
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', lineHeight: 1.55, margin: '0 0 14px' }}>
                        {f.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>
                          📚 {f._count?.lecons ?? 0} leçons · 👥 {f._count?.inscriptions ?? 0} inscrits
                        </div>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: BORDEAUX }}>
                          Voir →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* Encart bibliothèque */}
        <div style={{ marginTop: 48, background: '#1A0000', borderRadius: 12, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: OR, margin: '0 0 8px' }}>Complétez vos formations avec la bibliothèque légale</h3>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: 480 }}>
              Accédez aux codes, jurisprudences et doctrine haïtienne pour approfondir chaque cours.
            </p>
          </div>
          <Link href="/bibliotheque" style={{ padding: '12px 24px', background: OR, color: '#1A0000', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
            Bibliothèque →
          </Link>
        </div>
      </div>
    </div>
  );
}
