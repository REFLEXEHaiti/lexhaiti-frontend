// app/paiement/annule/page.tsx
// ✅ COMMUN AUX 3 PLATEFORMES

'use client';

import Link from 'next/link';
import { useTenant } from '@/lib/tenantContext';

export default function PagePaiementAnnule() {
  const { config } = useTenant();
  const primaire = config?.couleursTheme.primaire ?? '#1B3A6B';

  return (
    <div style={{ minHeight: '100vh', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 'clamp(32px,5vw,56px)', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.08)', border: '1px solid #FECACA' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>😕</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: '#7F1D1D', margin: '0 0 12px' }}>
          Paiement annulé
        </h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: '#991B1B', lineHeight: 1.7, margin: '0 0 32px' }}>
          Votre paiement a été annulé. Aucun montant n'a été débité. Vous pouvez réessayer quand vous voulez.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/premium"
            style={{ display: 'inline-block', padding: '14px 32px', background: primaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15 }}>
            Réessayer →
          </Link>
          <Link href="/dashboard"
            style={{ display: 'inline-block', padding: '14px 32px', background: 'white', color: primaire, border: `2px solid ${primaire}`, borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15 }}>
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
