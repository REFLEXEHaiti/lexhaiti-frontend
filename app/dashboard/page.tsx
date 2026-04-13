// app/dashboard/page.tsx
// ✅ COMMUN AUX 3 PLATEFORMES
// Le dashboard apprenant affiche : cours en cours, progression,
// résultats quiz, points, badges, notifications non lues

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import api from '@/lib/api';

interface DashboardData {
  inscriptions: any[];
  resultatsRecents: any[];
  points: { points: number; niveau: number } | null;
  badges: any[];
  notificationsNonLues: number;
}

const NIVEAU_LABELS = ['', 'Débutant', 'Initié', 'Confirmé', 'Expert', 'Maître'];

export default function PageDashboard() {
  return (
    <ProtectedRoute>
      <ContenuDashboard />
    </ProtectedRoute>
  );
}

function ContenuDashboard() {
  const { utilisateur } = useAuthStore();
  const { config } = useTenant();
  const [data, setData] = useState<DashboardData | null>(null);
  const [chargement, setChargement] = useState(true);

  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  if (chargement) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#64748B', fontSize: 14 }}>Chargement du tableau de bord…</div>
      </div>
    );
  }

  const points = data?.points?.points ?? 0;
  const niveau = data?.points?.niveau ?? 1;
  const niveauLabel = NIVEAU_LABELS[Math.min(niveau, 5)] ?? `Niveau ${niveau}`;
  const prochainNiveau = niveau * 100;
  const progressNiveau = Math.min((points % 100) / 100, 1);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>

      {/* Entête */}
      <div style={{ background: `linear-gradient(135deg, ${primaire}, ${primaire}cc)`, padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: secondaire, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 900, fontSize: 20, color: 'white', flexShrink: 0 }}>
              {(utilisateur?.prenom?.[0] ?? '') + (utilisateur?.nom?.[0] ?? '')}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(20px,3vw,28px)', color: 'white', margin: '0 0 4px', fontWeight: 'normal' }}>
                Bonjour, {utilisateur?.prenom} !
              </h1>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {niveauLabel}
                </span>
                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>·</span>
                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                  {points} points
                </span>
                {(data?.notificationsNonLues ?? 0) > 0 && (
                  <span style={{ background: secondaire, color: 'white', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>
                    {data?.notificationsNonLues} nouvelle{(data?.notificationsNonLues ?? 0) > 1 ? 's' : ''} notif
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Barre de progression vers prochain niveau */}
          <div style={{ marginTop: 20, maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>Niveau {niveau}</span>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{points % 100}/100 pts → Niveau {niveau + 1}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: secondaire, borderRadius: 3, width: `${progressNiveau * 100}%`, transition: 'width 0.8s ease' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(24px,4vw,40px) clamp(16px,4vw,40px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>

          {/* ── Mes formations en cours ── */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#0D1B2A', margin: 0 }}>Mes formations en cours</h2>
              <Link href="/formations" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: primaire, textDecoration: 'none', fontWeight: 600 }}>Voir tout →</Link>
            </div>
            {(!data?.inscriptions || data.inscriptions.length === 0) ? (
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', margin: '0 0 16px' }}>
                  Vous n'êtes inscrit à aucune formation pour l'instant.
                </p>
                <Link href="/formations" style={{ display: 'inline-block', padding: '10px 24px', background: primaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13 }}>
                  Découvrir les formations →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {data.inscriptions.slice(0, 6).map((insc: any) => {
                  const pct = insc.progression?.pourcentage ?? 0;
                  return (
                    <Link key={insc.id} href={`/formations/${insc.coursId}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${primaire}15`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                        {insc.cours.imageUrl && (
                          <div style={{ height: 100, background: `url(${insc.cours.imageUrl}) center/cover`, backgroundColor: `${primaire}20` }} />
                        )}
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, color: '#0D1B2A', marginBottom: 6, lineHeight: 1.4 }}>
                            {insc.cours.titre}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>
                              {insc.progression?.terminees ?? 0}/{insc.cours._count?.lecons ?? 0} leçons
                            </span>
                            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: pct === 100 ? '#059669' : primaire }}>
                              {pct}%
                            </span>
                          </div>
                          <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: pct === 100 ? '#059669' : primaire, width: `${pct}%`, borderRadius: 2, transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Mes badges ── */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: '20px 24px' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#0D1B2A', margin: '0 0 16px' }}>Mes badges</h2>
            {(!data?.badges || data.badges.length === 0) ? (
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>
                Complétez des formations pour obtenir vos premiers badges.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.badges.map((b: any) => (
                  <div key={b.id} title={b.description} style={{ background: `${primaire}12`, border: `1px solid ${primaire}30`, borderRadius: 8, padding: '6px 12px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: primaire }}>
                    🏅 {b.titre}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Résultats quiz récents ── */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: '20px 24px' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#0D1B2A', margin: '0 0 16px' }}>Quiz récents</h2>
            {(!data?.resultatsRecents || data.resultatsRecents.length === 0) ? (
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>
                Aucun quiz complété pour l'instant.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.resultatsRecents.slice(0, 5).map((r: any) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F8FAFC', borderRadius: 10 }}>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', flex: 1, marginRight: 12 }}>
                      {r.quiz?.lecon?.titre ?? 'Quiz'}
                    </div>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 700, color: r.score >= 70 ? '#059669' : '#EF4444', flexShrink: 0 }}>
                      {r.score}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions rapides ── */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: '20px 24px' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#0D1B2A', margin: '0 0 16px' }}>Actions rapides</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/formations', label: '📚 Parcourir les formations', bg: `${primaire}08`, color: primaire },
                { href: '/lives', label: '🎥 Voir les lives', bg: '#FFF7ED', color: '#EA580C' },
                { href: '/premium', label: '⭐ Mon abonnement', bg: '#F0FDF4', color: '#059669' },
                { href: '/classement', label: '🏆 Classement', bg: '#F5F3FF', color: '#7C3AED' },
              ].map(({ href, label, bg, color }) => (
                <Link key={href} href={href}
                  style={{ display: 'block', padding: '12px 16px', background: bg, borderRadius: 10, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
