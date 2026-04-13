// app/tournois/page.tsx — LexHaiti
// ⚠️ SPÉCIFIQUE À LEXHAITI
// Tournois de plaidoirie, moot courts et simulations d'audiences

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const BORDEAUX = '#8B0000';
const OR       = '#D4AF37';

const TOURNOIS_DEMO = [
  { id: 'T1', nom: 'Championnat National de Plaidoirie 2026', description: 'La plus grande compétition de plaidoirie haïtienne. Équipes de toute la nation s\'affrontent devant un jury de magistrats et avocats.', statut: 'EN_COURS', maxEquipes: 16, dateDebut: '2026-04-15', dateFin: '2026-06-30', prixInscription: 0, _count: { equipes: 12, matchs: 8 } },
  { id: 'T2', nom: 'Moot Court — Droit des Affaires Haïtien', description: 'Simulation d\'audience commerciale. Les équipes plaident des cas réels de droit des affaires devant des avocats d\'affaires haïtiens.', statut: 'INSCRIPTION', maxEquipes: 8, dateDebut: '2026-05-10', dateFin: '2026-05-25', prixInscription: 0, _count: { equipes: 3, matchs: 0 } },
  { id: 'T3', nom: 'Tournoi Droit Constitutionnel UEH 2026', description: 'En partenariat avec la Faculté de Droit de l\'UEH. Débats constitutionnels sur les grands enjeux haïtiens.', statut: 'INSCRIPTION', maxEquipes: 12, dateDebut: '2026-05-20', dateFin: '2026-06-10', prixInscription: 0, _count: { equipes: 5, matchs: 0 } },
  { id: 'T4', nom: 'Simulation d\'Audience Pénale — Saison 3', description: 'Jouez le rôle du procureur, de la défense ou du juge. Cas fictifs basés sur des affaires haïtiennes réelles.', statut: 'TERMINE', maxEquipes: 8, dateDebut: '2026-02-01', dateFin: '2026-03-15', prixInscription: 0, _count: { equipes: 8, matchs: 14 } },
];

const STATUT_CONFIG: Record<string, { label: string; couleur: string; bg: string }> = {
  EN_COURS:    { label: '🔴 En cours',             couleur: '#DC2626', bg: '#FEF2F2' },
  INSCRIPTION: { label: '📝 Inscriptions ouvertes', couleur: OR,       bg: `${OR}15` },
  TERMINE:     { label: '✅ Terminé',               couleur: '#64748B', bg: '#F8FAFC' },
  ANNULE:      { label: '❌ Annulé',                couleur: '#94A3B8', bg: '#F1F5F9' },
};

export default function PageTournois() {
  const { estConnecte, utilisateur } = useAuthStore();
  const [tournois, setTournois]      = useState(TOURNOIS_DEMO);
  const [chargement, setChargement]  = useState(true);

  useEffect(() => {
    api.get('/tournois')
      .then(({ data }) => { if (Array.isArray(data) && data.length) setTournois(data); })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const actifs  = tournois.filter(t => ['EN_COURS', 'INSCRIPTION'].includes(t.statut));
  const termines = tournois.filter(t => t.statut === 'TERMINE');

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 60%, #5C0000 100%)`, padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,48px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=50)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', background: `${OR}20`, border: `1px solid ${OR}50`, borderRadius: 100, padding: '5px 14px', marginBottom: 18 }}>
            <span style={{ fontSize: 14 }}>⚖️</span>
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: OR, fontWeight: 700 }}>Moot Courts & Plaidoiries</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,4vw,52px)', color: 'white', margin: '0 0 14px', fontWeight: 'normal' }}>
            Compétitions de plaidoirie
          </h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(14px,1.6vw,17px)', color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 0 32px', lineHeight: 1.7 }}>
            Simulez des audiences réelles, confrontez-vous à d'autres juristes et développez vos compétences de plaidoirie devant un jury de professionnels.
          </p>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[{ v: tournois.length, l: 'Tournois organisés' }, { v: actifs.length, l: 'En cours / inscriptions' }, { v: '48+', l: 'Équipes participantes' }].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: OR, fontWeight: 700 }}>{s.v}</div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(20px,5vw,48px)' }}>

        {/* Tournois actifs */}
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: '#1A1A1A', margin: '0 0 24px', fontWeight: 'normal' }}>
          Tournois en cours & inscriptions ouvertes
        </h2>

        {chargement ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Chargement…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 48 }}>
            {actifs.map(t => {
              const cfg = STATUT_CONFIG[t.statut] ?? STATUT_CONFIG['TERMINE'];
              const plein = (t._count?.equipes ?? 0) >= t.maxEquipes;
              const pct = ((t._count?.equipes ?? 0) / t.maxEquipes) * 100;

              return (
                <div key={t.id} style={{ background: 'white', border: `1px solid ${BORDEAUX}20`, borderRadius: 12, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr auto', gap: 0 }}>
                  <div style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: cfg.couleur, background: cfg.bg, padding: '4px 12px', borderRadius: 100 }}>
                        {cfg.label}
                      </span>
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>
                        Du {new Date(t.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au {t.dateFin ? new Date(t.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#1A1A1A', margin: '0 0 10px', fontWeight: 'normal' }}>{t.nom}</h3>
                    <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: '0 0 16px' }}>{t.description}</p>

                    {/* Barre de remplissage */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                        <span>👥 {t._count?.equipes ?? 0}/{t.maxEquipes} équipes inscrites</span>
                        {plein && <span style={{ color: '#DC2626', fontWeight: 700 }}>Complet</span>}
                      </div>
                      <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: plein ? '#DC2626' : `linear-gradient(90deg, ${BORDEAUX}, ${OR})`, width: `${pct}%`, borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ borderLeft: `1px solid ${BORDEAUX}15`, padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, minWidth: 160 }}>
                    <Link href={`/tournois/${t.id}`}
                      style={{ display: 'block', padding: '11px 20px', background: BORDEAUX, color: 'white', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
                      Voir →
                    </Link>
                    {t.statut === 'INSCRIPTION' && !plein && estConnecte && (
                      <Link href={`/tournois/${t.id}#inscrire`}
                        style={{ display: 'block', padding: '11px 20px', background: OR, color: '#1A0000', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
                        S'inscrire
                      </Link>
                    )}
                    {!estConnecte && t.statut === 'INSCRIPTION' && (
                      <Link href="/auth/inscription"
                        style={{ display: 'block', padding: '11px 20px', border: `2px solid ${BORDEAUX}`, color: BORDEAUX, borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, textAlign: 'center', background: 'white' }}>
                        Se connecter
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tournois terminés */}
        {termines.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#64748B', margin: '0 0 20px', fontWeight: 'normal' }}>
              Historique des tournois
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {termines.map(t => (
                <Link key={t.id} href={`/tournois/${t.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: '18px 20px', opacity: 0.75, cursor: 'pointer', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Terminé</div>
                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: '#374151', margin: '0 0 10px', fontWeight: 'normal' }}>{t.nom}</h3>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>
                      {t._count?.equipes ?? 0} équipes · {t._count?.matchs ?? 0} matchs
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Encart — Organiser un tournoi */}
        <div style={{ marginTop: 48, background: '#1A0000', borderRadius: 12, padding: '32px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: OR, margin: '0 0 8px' }}>Organiser un tournoi avec LexHaiti</h3>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
              Vous représentez une faculté de droit, un barreau ou une organisation juridique ? Contactez-nous pour organiser un tournoi officiel.
            </p>
          </div>
          <Link href="/contact" style={{ padding: '13px 28px', background: OR, color: '#1A0000', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            Nous contacter →
          </Link>
        </div>
      </div>
    </div>
  );
}
