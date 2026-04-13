// app/premium/page.tsx
// ✅ COMMUN AUX 3 PLATEFORMES
// Les tarifs et les avantages s'adaptent automatiquement au tenant
// LexHaiti: 600/1000/1800 HTG — TechPro: 700/1200/1800 HTG — MediForm: 600/1000/1500 HTG

'use client';

import { useState } from 'react';
import { useTenant } from '@/lib/tenantContext';
import ModalPaiement from '@/components/paiement/ModalPaiement';

// ── Tarifs par plateforme (en HTG) ───────────────────────────
const TARIFS: Record<string, {
  id: string; label: string; montantHTG: number;
  avantages: string[]; recommande?: boolean;
}[]> = {
  lex: [
    { id: 'GRATUIT',     label: 'Gratuit',          montantHTG: 0,    avantages: ['3 formations gratuites', 'Accès aux débats publics', 'Chatbot IA de base', '3 messages / débat'] },
    { id: 'PREMIUM',     label: 'Étudiant',         montantHTG: 600,  avantages: ['Toutes les formations', 'Accès à la bibliothèque légale', 'Chatbot IA juridique illimité', 'Moot courts & simulations', 'Certificat numérique'], recommande: true },
    { id: 'AVANCE',      label: 'Avocat',           montantHTG: 1000, avantages: ['Tout du plan Étudiant', 'Accès aux jurisprudences', 'Formation continue barreau', 'Support prioritaire', 'Accès API jurisprudence'] },
    { id: 'INSTITUTION', label: 'Institution',      montantHTG: 1800, avantages: ['Tout illimité', 'Jusqu\'à 50 utilisateurs', 'Tableau de bord institution', 'Formation sur site', 'Facturation mensuelle'] },
  ],
  techpro: [
    { id: 'GRATUIT',     label: 'Gratuit',          montantHTG: 0,    avantages: ['3 formations gratuites', 'Quiz IA de base', 'Chatbot professionnel', 'Accès Lives'] },
    { id: 'PREMIUM',     label: 'Professionnel',    montantHTG: 700,  avantages: ['Toutes les formations', 'Certifications reconnues', 'Chatbot IA illimité', 'Simulations métier', 'Badge professionnel'], recommande: true },
    { id: 'AVANCE',      label: 'Senior',           montantHTG: 1200, avantages: ['Tout du plan Pro', 'Accès réglementations BRH', 'Formations avancées MonCash', 'Support carrière', 'Lettre de recommandation'] },
    { id: 'INSTITUTION', label: 'Entreprise',       montantHTG: 1800, avantages: ['Formation équipe complète', 'Tableau de bord RH', 'Suivi progression employés', 'Facturation entreprise', 'Formation sur site'] },
  ],
  mediform: [
    { id: 'GRATUIT',     label: 'Gratuit',          montantHTG: 0,    avantages: ['3 modules gratuits', 'Protocoles de base OMS', 'Chatbot médical de base', 'Quiz infirmier'] },
    { id: 'PREMIUM',     label: 'Infirmier',        montantHTG: 600,  avantages: ['Tous les modules', 'Bibliothèque médicale MSPP', 'Simulations cliniques', 'Chatbot médical illimité', 'Certificat de formation'], recommande: true },
    { id: 'AVANCE',      label: 'Supérieur',        montantHTG: 1000, avantages: ['Tout du plan Infirmier', 'Préparation examen d\'état', 'Cas cliniques avancés', 'Support pédiatrie & maternité', 'Badge accrédité OIIH'] },
    { id: 'INSTITUTION', label: 'Clinique',         montantHTG: 1500, avantages: ['Formation équipe soignante', 'Tableau de bord clinique', 'Protocoles personnalisés', 'Audit qualité des soins', 'Formation sur site'] },
  ],
};

export default function PagePremium() {
  const { config } = useTenant();
  const [modal, setModal] = useState<{ montantHTG: number; description: string; plan: string } | null>(null);

  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';
  const slug       = config?.slug ?? 'lex';
  const plans      = TARIFS[slug] ?? TARIFS['lex'];

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {modal && (
        <ModalPaiement
          montantHTG={modal.montantHTG}
          description={modal.description}
          plan={modal.plan}
          onFermer={() => setModal(null)}
        />
      )}

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${primaire} 0%, ${primaire}dd 100%)`, padding: 'clamp(48px,7vw,96px) 24px clamp(32px,5vw,64px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '6px 16px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Abonnement {config?.nom}
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,5vw,48px)', color: 'white', margin: '0 0 12px', fontWeight: 'normal' }}>
            Choisissez votre plan
          </h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(14px,1.8vw,17px)', color: 'rgba(255,255,255,0.75)', maxWidth: 500, margin: '0 auto' }}>
            Investissez dans votre développement professionnel. Tous les prix sont en Gourdes Haïtiennes.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,40px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24, alignItems: 'start' }}>
          {plans.map(plan => (
            <div key={plan.id}
              style={{ background: plan.recommande ? `${primaire}08` : '#FAFAFA', border: `2px solid ${plan.recommande ? primaire : '#E2E8F0'}`, borderRadius: 20, padding: 28, position: 'relative', transform: plan.recommande ? 'scale(1.03)' : 'none', boxShadow: plan.recommande ? `0 8px 32px ${primaire}20` : '0 2px 8px rgba(0,0,0,0.04)' }}>

              {plan.recommande && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: primaire, color: 'white', fontSize: 11, padding: '4px 16px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, whiteSpace: 'nowrap' }}>
                  ⭐ Recommandé
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: primaire, fontWeight: 700, marginBottom: 4 }}>{plan.label}</div>
                {plan.montantHTG === 0 ? (
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 28, fontWeight: 900, color: '#059669' }}>Gratuit</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 28, fontWeight: 900, color: '#0D1B2A' }}>
                      {plan.montantHTG.toLocaleString()}
                    </span>
                    <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B' }}>HTG / mois</span>
                  </div>
                )}
              </div>

              {/* Avantages */}
              <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.avantages.map((a, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                    <span style={{ color: plan.recommande ? primaire : '#059669', fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {a}
                  </li>
                ))}
              </ul>

              {/* Bouton */}
              {plan.montantHTG === 0 ? (
                <a href="/auth/inscription"
                  style={{ display: 'block', width: '100%', padding: '14px', background: '#F1F5F9', color: '#0D1B2A', border: '1px solid #E2E8F0', borderRadius: 100, textDecoration: 'none', textAlign: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, boxSizing: 'border-box' }}>
                  Commencer gratuitement →
                </a>
              ) : (
                <button
                  onClick={() => setModal({ montantHTG: plan.montantHTG, description: `${config?.nom} — Plan ${plan.label}`, plan: plan.id })}
                  style={{ width: '100%', padding: '14px', background: plan.recommande ? primaire : 'white', color: plan.recommande ? 'white' : primaire, border: `2px solid ${primaire}`, borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!plan.recommande) { (e.currentTarget as HTMLElement).style.background = primaire; (e.currentTarget as HTMLElement).style.color = 'white'; } }}
                  onMouseLeave={e => { if (!plan.recommande) { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = primaire; } }}>
                  S'abonner →
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ rapide */}
        <div style={{ marginTop: 64, padding: '32px', background: '#F8FAFC', borderRadius: 20, border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#0D1B2A', marginBottom: 20 }}>Questions fréquentes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { q: 'Puis-je annuler à tout moment ?', r: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.' },
              { q: 'Comment payer en HTG ?', r: 'Acceptez MonCash, Zelle, PayPal ou carte bancaire via Stripe. Le montant en HTG est indiqué.' },
              { q: 'Y a-t-il un essai gratuit ?', r: 'Le plan Gratuit est permanent et vous donne accès aux ressources de base sans limite de temps.' },
            ].map(({ q, r }, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, color: '#0D1B2A', marginBottom: 6 }}>{q}</div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
