// app/paiement/succes/page.tsx
// ✅ COMMUN AUX 3 PLATEFORMES

'use client';

import Link from 'next/link';
import { useTenant } from '@/lib/tenantContext';

export default function PagePaiementSucces() {
  const { config } = useTenant();
  const primaire = config?.couleursTheme.primaire ?? '#1B3A6B';

  return (
    <div style={{ minHeight: '100vh', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 'clamp(32px,5vw,56px)', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.08)', border: '1px solid #BBF7D0' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: '#14532D', margin: '0 0 12px' }}>
          Paiement réussi !
        </h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: '#166534', lineHeight: 1.7, margin: '0 0 32px' }}>
          Votre abonnement {config?.nom} est maintenant actif. Vous avez accès à toutes les fonctionnalités de votre plan.
        </p>
        <Link href="/dashboard"
          style={{ display: 'inline-block', padding: '16px 40px', background: primaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16 }}>
          Accéder à mon espace →
        </Link>
      </div>
    </div>
  );
}
