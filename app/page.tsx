// app/page.tsx — LexHaiti
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';

const BORDEAUX = '#8B0000';
const OR = '#D4AF37';

const DEBATS_DEMO = [
  { id: '1', titre: 'La réforme constitutionnelle haïtienne est-elle nécessaire ?', statut: 'OUVERT', categorie: 'Droit constitutionnel', vues: 312, _count: { messages: 58 }, votes: { pourcentagePour: 63, pourcentageContre: 37 } },
  { id: '2', titre: 'Le système judiciaire haïtien garantit-il un procès équitable ?', statut: 'OUVERT', categorie: 'Procédure pénale', vues: 189, _count: { messages: 34 }, votes: { pourcentagePour: 44, pourcentageContre: 56 } },
  { id: '3', titre: "L'accès à la justice est-il réel pour les citoyens haïtiens ?", statut: 'OUVERT', categorie: 'Droits civiques', vues: 241, _count: { messages: 47 }, votes: { pourcentagePour: 71, pourcentageContre: 29 } },
];

const STATS = [
  { valeur: '1 200+', label: 'Juristes inscrits' },
  { valeur: '48',     label: 'Cours de droit' },
  { valeur: '12',     label: 'Tournois organisés' },
  { valeur: '320+',   label: 'Débats juridiques' },
];

export default function PageAccueilLexHaiti() {
  const { estConnecte } = useAuthStore();
  const { config } = useTenant();
  const [debats, setDebats]     = useState(DEBATS_DEMO);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const defilRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(0);

  const bordeaux = config?.couleursTheme.primaire ?? BORDEAUX;
  const or       = config?.couleursTheme.secondaire ?? OR;

  useEffect(() => {
    api.get('/debats?limite=3').then(({ data }) => { if (data?.debats?.length) setDebats(data.debats.slice(0, 3)); }).catch(() => {});
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

  return (
    <div style={{ background: '#FAFAF8', fontFamily: 'Georgia,serif', overflowX: 'hidden' }}>

      {/* Bannière sponsors */}
      {sponsors.length > 0 && (
        <div style={{ background: 'white', borderBottom: '1px solid #E8E4DC', padding: '10px 0' }}>
          <p style={{ textAlign: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px', fontWeight: 700 }}>Partenaires</p>
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

      {/* ── HERO — layout grille, photo à droite SANS carte par-dessus ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 64px)', maxHeight: 720 }}>

        {/* Gauche — contenu */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(32px,5vw,80px)', background: '#FAFAF8' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, background: `${bordeaux}10`, border: `1px solid ${bordeaux}25`, borderRadius: 100, padding: '6px 14px', width: 'fit-content' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: bordeaux }} />
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: bordeaux, fontWeight: 700 }}>Plateforme juridique haïtienne</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px,4.5vw,60px)', fontWeight: 'normal', lineHeight: 1.06, letterSpacing: '-0.025em', color: '#1A1A1A', marginBottom: 20 }}>
            Maîtrisez l'art<br /><strong style={{ fontWeight: 800, color: bordeaux }}>du droit</strong> et<br />de la plaidoirie
          </h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(14px,1.6vw,18px)', color: '#4A4A4A', lineHeight: 1.65, marginBottom: 36, maxWidth: 440 }}>
            La plateforme des étudiants en droit, avocats stagiaires et juristes haïtiens.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            <Link href="/formations" style={{ display: 'inline-block', padding: '14px 28px', background: bordeaux, color: 'white', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 4 }}>
              Commencer →
            </Link>
            <Link href="/debats" style={{ display: 'inline-block', padding: '14px 28px', background: 'transparent', color: bordeaux, border: `2px solid ${bordeaux}`, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 4 }}>
              Voir les débats
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, paddingTop: 28, borderTop: `1px solid ${bordeaux}20` }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(18px,2vw,26px)', fontWeight: 700, color: bordeaux }}>{s.valeur}</div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#666', marginTop: 2, letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Droite — photo SEULE, sans carte flottante */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=85"
            alt="Palais de Justice haïtien"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(139,0,0,0.1) 0%, rgba(0,0,0,0.35) 100%)` }} />
        </div>
      </section>

      {/* ── Débats ouverts — section SOUS le héro ── */}
      <div style={{ background: `${bordeaux}06`, borderTop: `3px solid ${bordeaux}`, padding: 'clamp(20px,3vw,32px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: bordeaux, fontWeight: 700 }}>Débats ouverts</span>
          </div>
          <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
            {debats.slice(0, 2).map(d => (
              <Link key={d.id} href={`/debats/${d.id}`} style={{ textDecoration: 'none', flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Georgia,serif', fontSize: 13, color: '#1A1A1A', lineHeight: 1.4 }}>{d.titre}</div>
                    <div style={{ height: 3, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                      <div style={{ height: '100%', background: bordeaux, width: `${d.votes?.pourcentagePour ?? 50}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/debats" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: bordeaux, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
            Tous les débats →
          </Link>
        </div>
      </div>

      {/* ── Débats en cours ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,48px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 6px' }}>Débats juridiques en cours</h2>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', margin: 0 }}>Participez et défendez votre position</p>
          </div>
          <Link href="/debats" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: bordeaux, textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>Voir tous →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {debats.map(d => (
            <Link key={d.id} href={`/debats/${d.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 8, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${bordeaux}18`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                <div style={{ height: 4, background: `linear-gradient(90deg, ${bordeaux}, ${or})` }} />
                <div style={{ padding: '18px 20px' }}>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: bordeaux, fontWeight: 700, background: `${bordeaux}10`, padding: '3px 10px', borderRadius: 100 }}>{d.categorie ?? 'Droit'}</span>
                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#1A1A1A', lineHeight: 1.45, margin: '10px 0 14px', fontWeight: 'normal' }}>{d.titre}</h3>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: '#22C55E', fontWeight: 700 }}>Pour {d.votes?.pourcentagePour ?? 50}%</span>
                      <span style={{ color: '#EF4444', fontWeight: 700 }}>Contre {d.votes?.pourcentageContre ?? 50}%</span>
                    </div>
                    <div style={{ height: 4, background: '#EF4444', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#22C55E', width: `${d.votes?.pourcentagePour ?? 50}%` }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 10 }}>
                    <span>💬 {d._count?.messages ?? 0}</span>
                    <span>👁 {d.vues ?? 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Bibliothèque ── */}
      <section style={{ background: '#1A1A1A', padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ width: 48, height: 2, background: or, margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: 'clamp(24px,3vw,40px)', fontWeight: 'normal', color: 'white', margin: '0 0 16px' }}>Bibliothèque Légale Haïtienne</h2>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Codes haïtiens annotés, jurisprudences, doctrine, audio et vidéos juridiques.
          </p>
          <Link href="/bibliotheque" style={{ display: 'inline-block', padding: '15px 36px', background: or, color: '#1A1A1A', borderRadius: 4, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Accéder à la bibliothèque →
          </Link>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ background: 'white', padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,3vw,40px)', fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 16px' }}>Prêt à plaider votre cause ?</h2>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: '#64748B', lineHeight: 1.7, margin: '0 0 32px' }}>Rejoignez la communauté LexHaiti. Gratuit pour commencer.</p>
          {estConnecte ? (
            <Link href="/dashboard" style={{ display: 'inline-block', padding: '16px 40px', background: bordeaux, color: 'white', borderRadius: 4, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15 }}>Mon espace →</Link>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/inscription" style={{ display: 'inline-block', padding: '16px 36px', background: bordeaux, color: 'white', borderRadius: 4, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14 }}>S'inscrire gratuitement →</Link>
              <Link href="/formations" style={{ display: 'inline-block', padding: '16px 36px', background: 'white', color: bordeaux, border: `2px solid ${bordeaux}`, borderRadius: 4, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14 }}>Voir les formations</Link>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @media(max-width:768px){
          section:first-of-type{grid-template-columns:1fr!important;}
          section:first-of-type > div:last-child{display:none!important;}
        }
      `}</style>
    </div>
  );
}
