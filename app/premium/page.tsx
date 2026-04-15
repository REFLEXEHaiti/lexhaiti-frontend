// app/premium/page.tsx — LexHaiti
// Accessible à tous les utilisateurs connectés SAUF admin (qui n'en a pas besoin)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/tenantContext';
import { useAuthStore } from '@/store/authStore';
import ModalPaiement from '@/components/paiement/ModalPaiement';

const TARIFS_LEX = [
  { id: 'GRATUIT',     label: 'Gratuit',    montantHTG: 0,    recommande: false, avantages: ['3 formations gratuites', 'Accès aux débats publics', 'Chatbot IA de base', '3 messages / débat'] },
  { id: 'PREMIUM',     label: 'Étudiant',   montantHTG: 600,  recommande: true,  avantages: ['Toutes les formations', 'Accès à la bibliothèque légale', 'Chatbot IA juridique illimité', 'Moot courts & simulations', 'Certificat numérique'] },
  { id: 'AVANCE',      label: 'Avocat',     montantHTG: 1000, recommande: false, avantages: ['Tout du plan Étudiant', 'Accès aux jurisprudences', 'Formation continue barreau', 'Support prioritaire', 'Accès API jurisprudence'] },
  { id: 'INSTITUTION', label: 'Institution',montantHTG: 1800, recommande: false, avantages: ['Tout du plan Avocat', 'Jusqu\'à 50 utilisateurs', 'Tableau de bord institution', 'Certification officielle', 'Accès API complet'] },
];

const BORDEAUX = '#8B0000';
const OR = '#D4AF37';

export default function PagePremium() {
  const { config } = useTenant();
  const { utilisateur, estConnecte } = useAuthStore();
  const [modal, setModal] = useState<{ montantHTG: number; description: string; plan: string } | null>(null);

  const primaire   = config?.couleursTheme.primaire   ?? BORDEAUX;
  const secondaire = config?.couleursTheme.secondaire ?? OR;
  const slug       = config?.slug ?? 'lex';

  // L'admin n'a pas besoin de payer — rediriger vers admin
  const estAdmin = utilisateur?.role === 'ADMIN';

  if (estAdmin) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 48 }}>⚙️</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#1A1A1A', textAlign: 'center', fontWeight: 'normal' }}>
        Vous avez accès à tout
      </h2>
      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', textAlign: 'center', maxWidth: 400 }}>
        En tant qu'administrateur, vous avez un accès complet à toutes les fonctionnalités de LexHaiti.
      </p>
      <Link href="/dashboard" style={{ padding: '12px 24px', background: primaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14 }}>
        Aller au tableau de bord →
      </Link>
    </div>
  );

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      {modal && (
        <ModalPaiement
          montantHTG={modal.montantHTG}
          description={modal.description}
          plan={modal.plan}
          onFermer={() => setModal(null)}
          onSucces={() => setModal(null)}
        />
      )}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #1A0000 0%, ${primaire} 100%)`, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: secondaire, fontWeight: 700, marginBottom: 16 }}>
          Abonnements LexHaiti
        </div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,4vw,48px)', color: 'white', margin: '0 0 14px', fontWeight: 'normal' }}>
          Choisissez votre plan
        </h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
          Accédez à toute la bibliothèque légale haïtienne, aux formations et aux outils juridiques professionnels.
        </p>
      </section>

      {/* Plans */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
          {TARIFS_LEX.map(t => (
            <div key={t.id} style={{
              background: t.recommande ? primaire : 'white',
              border: t.recommande ? 'none' : '1px solid #E8E4DC',
              borderRadius: 14,
              padding: '28px 24px',
              position: 'relative',
              boxShadow: t.recommande ? `0 12px 40px ${primaire}40` : 'none',
            }}>
              {t.recommande && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: secondaire, color: '#1A0000', padding: '4px 16px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                  ⭐ RECOMMANDÉ
                </div>
              )}

              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: t.recommande ? 'white' : '#1A1A1A', margin: '0 0 8px', fontWeight: 'normal' }}>
                {t.label}
              </h3>
              <div style={{ marginBottom: 24 }}>
                {t.montantHTG === 0 ? (
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: 32, fontWeight: 700, color: t.recommande ? 'white' : '#1A1A1A' }}>Gratuit</span>
                ) : (
                  <div>
                    <span style={{ fontFamily: 'Georgia,serif', fontSize: 32, fontWeight: 700, color: t.recommande ? secondaire : primaire }}>{t.montantHTG.toLocaleString()}</span>
                    <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: t.recommande ? 'rgba(255,255,255,0.7)' : '#64748B' }}> HTG/mois</span>
                  </div>
                )}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {t.avantages.map((a, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: t.recommande ? secondaire : primaire, fontWeight: 700, flexShrink: 0, fontSize: 14 }}>✓</span>
                    <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: t.recommande ? 'rgba(255,255,255,0.85)' : '#374151', lineHeight: 1.5 }}>{a}</span>
                  </li>
                ))}
              </ul>

              {t.montantHTG === 0 ? (
                estConnecte ? (
                  <Link href="/formations" style={{ display: 'block', padding: '13px', background: t.recommande ? 'rgba(255,255,255,0.15)' : `${primaire}10`, color: t.recommande ? 'white' : primaire, borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
                    Accéder aux formations →
                  </Link>
                ) : (
                  <Link href="/auth/inscription" style={{ display: 'block', padding: '13px', background: t.recommande ? 'rgba(255,255,255,0.15)' : `${primaire}10`, color: t.recommande ? 'white' : primaire, borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
                    S'inscrire gratuitement →
                  </Link>
                )
              ) : (
                <button
                  onClick={() => {
                    if (!estConnecte) { window.location.href = '/auth/inscription'; return; }
                    setModal({ montantHTG: t.montantHTG, description: `Abonnement LexHaiti — Plan ${t.label}`, plan: t.id });
                  }}
                  style={{ width: '100%', padding: '13px', background: t.recommande ? secondaire : primaire, color: t.recommande ? '#1A0000' : 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {!estConnecte ? 'Se connecter →' : `S'abonner — ${t.montantHTG.toLocaleString()} HTG →`}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 56, background: 'white', border: '1px solid #E8E4DC', borderRadius: 14, padding: 'clamp(24px,4vw,40px)' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#1A1A1A', margin: '0 0 24px', fontWeight: 'normal' }}>Questions fréquentes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { q: 'Comment payer ?', r: 'Via MonCash, PayPal, Zelle ou carte Visa. Le paiement est sécurisé.' },
              { q: 'Puis-je annuler ?', r: 'Oui, vous pouvez annuler à tout moment depuis votre tableau de bord.' },
              { q: 'Les certifications sont-elles reconnues ?', r: 'Oui, par les barreaux haïtiens partenaires et les employeurs.' },
              { q: 'Y a-t-il un essai gratuit ?', r: 'Oui, le plan Gratuit vous donne accès à 3 formations sans carte.' },
            ].map(({ q, r }, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: '#1A1A1A', marginBottom: 6 }}>{q}</div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
