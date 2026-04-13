// app/bibliotheque/page.tsx — LexHaiti
// ⚠️ SPÉCIFIQUE À LEXHAITI
// Bibliothèque légale haïtienne : codes annotés, jurisprudences,
// doctrine, constitution, formulaires et règlements

'use client';

import { useState } from 'react';
import Link from 'next/link';

const BORDEAUX = '#8B0000';
const OR       = '#D4AF37';

const COLLECTIONS = [
  {
    id: 'codes',
    titre: 'Codes Haïtiens',
    description: 'Versions annotées et mises à jour des principaux codes de droit haïtien',
    icone: '📚',
    couleur: BORDEAUX,
    items: [
      { titre: 'Code Civil Haïtien', pages: 312, annee: '1826 (rev. 2006)', gratuit: true },
      { titre: 'Code Pénal Haïtien', pages: 187, annee: '1835 (rev. 2020)', gratuit: true },
      { titre: 'Code de Procédure Civile', pages: 428, annee: '1825 (rev. 2015)', gratuit: false },
      { titre: 'Code du Commerce', pages: 256, annee: '1826 (rev. 2019)', gratuit: false },
      { titre: "Code du Travail", pages: 198, annee: '1984 (rev. 2021)', gratuit: true },
      { titre: 'Code Fiscal Haïtien', pages: 344, annee: '2012 (rev. 2023)', gratuit: false },
    ],
  },
  {
    id: 'constitutions',
    titre: 'Constitutions & Lois Fondamentales',
    description: 'Textes constitutionnels historiques et commentaires doctrinaux',
    icone: '🏛️',
    couleur: '#1A3A6B',
    items: [
      { titre: 'Constitution de 1987 (amendée 2012)', pages: 98, annee: '1987', gratuit: true },
      { titre: 'Constitutions historiques 1801-1983', pages: 420, annee: 'Recueil', gratuit: false },
      { titre: 'Déclaration de Bois-Caïman — Analyse', pages: 45, annee: '1791', gratuit: true },
      { titre: 'Acte de l\'Indépendance 1804', pages: 12, annee: '1804', gratuit: true },
    ],
  },
  {
    id: 'jurisprudences',
    titre: 'Jurisprudences',
    description: 'Décisions de la Cour de Cassation, tribunaux civils et cours d\'appel',
    icone: '⚖️',
    couleur: '#065F46',
    items: [
      { titre: 'Arrêts Cour de Cassation 2020-2026', pages: 890, annee: '2020-2026', gratuit: false },
      { titre: 'Jurisprudences droit foncier 2015-2024', pages: 445, annee: '2015-2024', gratuit: false },
      { titre: 'Décisions Cour d\'Appel PAP 2022-2026', pages: 312, annee: '2022-2026', gratuit: false },
      { titre: 'Jurisprudences droit des affaires', pages: 234, annee: '2018-2025', gratuit: false },
    ],
  },
  {
    id: 'doctrine',
    titre: 'Doctrine & Articles',
    description: 'Articles doctrinaux, thèses et commentaires de juristes haïtiens',
    icone: '✍️',
    couleur: '#7C2D12',
    items: [
      { titre: 'Droit foncier haïtien — Traité complet', pages: 567, annee: '2023', gratuit: false },
      { titre: 'La procédure pénale haïtienne expliquée', pages: 345, annee: '2022', gratuit: true },
      { titre: 'Droit des sociétés en Haïti', pages: 289, annee: '2021', gratuit: false },
      { titre: 'Introduction au droit haïtien', pages: 198, annee: '2020', gratuit: true },
    ],
  },
  {
    id: 'formulaires',
    titre: 'Formulaires & Modèles',
    description: 'Actes types, formulaires officiels et modèles de plaidoiries',
    icone: '📝',
    couleur: '#4C1D95',
    items: [
      { titre: 'Modèles de contrats civils haïtiens', pages: 124, annee: '2024', gratuit: false },
      { titre: 'Formulaires Tribunal Civil PAP', pages: 78, annee: '2024', gratuit: true },
      { titre: 'Modèles de plaidoiries commentés', pages: 156, annee: '2023', gratuit: false },
      { titre: 'Actes notariaux types', pages: 89, annee: '2024', gratuit: false },
    ],
  },
];

export default function PageBibliotheque() {
  const [categorieActive, setCategorieActive] = useState('codes');
  const [recherche, setRecherche]             = useState('');

  const collection = COLLECTIONS.find(c => c.id === categorieActive) ?? COLLECTIONS[0];
  const itemsFiltres = collection.items.filter(item =>
    !recherche || item.titre.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Hero bibliothèque */}
      <section style={{ background: '#1A0000', padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 48, height: 2, background: OR, margin: '0 auto 20px' }} />
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,4vw,52px)', color: 'white', margin: '0 0 14px', fontWeight: 'normal' }}>
            Bibliothèque Légale Haïtienne
          </h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(13px,1.6vw,17px)', color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Codes annotés, jurisprudences, doctrine et formulaires. La référence juridique complète pour les praticiens du droit haïtien.
          </p>
          {/* Barre de recherche */}
          <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
            <input
              type="text" value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher un code, une loi, une jurisprudence…"
              style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(255,255,255,0.1)', border: `1px solid ${OR}50`, borderRadius: 8, fontSize: 14, outline: 'none', color: 'white', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = OR; e.target.style.background = 'rgba(255,255,255,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = `${OR}50`; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
            />
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'start' }}>

        {/* Sidebar — catégories */}
        <aside>
          <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, overflow: 'hidden', position: 'sticky', top: 72 }}>
            <div style={{ padding: '14px 16px', background: BORDEAUX }}>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: OR, fontWeight: 700 }}>Collections</span>
            </div>
            {COLLECTIONS.map(col => (
              <button key={col.id} onClick={() => setCategorieActive(col.id)}
                style={{ width: '100%', padding: '12px 16px', background: categorieActive === col.id ? `${BORDEAUX}08` : 'white', border: 'none', borderLeft: `3px solid ${categorieActive === col.id ? BORDEAUX : 'transparent'}`, cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 18 }}>{col.icone}</span>
                <div>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: categorieActive === col.id ? 700 : 400, color: categorieActive === col.id ? BORDEAUX : '#374151' }}>{col.titre}</div>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{col.items.length} documents</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Contenu principal */}
        <main>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: '#1A1A1A', margin: '0 0 6px', fontWeight: 'normal' }}>
              {collection.icone} {collection.titre}
            </h2>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', margin: 0 }}>{collection.description}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {itemsFiltres.map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#1A1A1A', margin: 0, fontWeight: 'normal' }}>{item.titre}</h3>
                    {item.gratuit && (
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: 100, fontWeight: 700, flexShrink: 0 }}>
                        GRATUIT
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>
                    <span>📄 {item.pages} pages</span>
                    <span>📅 {item.annee}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {item.gratuit ? (
                    <button style={{ padding: '8px 16px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Lire →
                    </button>
                  ) : (
                    <Link href="/premium" style={{ padding: '8px 16px', background: OR, color: '#1A0000', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700 }}>
                      Premium →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Appel à l'action premium */}
          <div style={{ marginTop: 32, background: `linear-gradient(135deg, ${BORDEAUX}10, ${OR}10)`, border: `1px solid ${BORDEAUX}25`, borderRadius: 12, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: BORDEAUX, margin: '0 0 6px' }}>Accès illimité à toute la bibliothèque</h3>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: 0 }}>Plus de 3 000 documents juridiques disponibles avec le plan Avocat ou Institution.</p>
            </div>
            <Link href="/premium" style={{ padding: '12px 24px', background: BORDEAUX, color: 'white', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              Voir les plans →
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
