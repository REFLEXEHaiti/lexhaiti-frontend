// components/layout/ProtectedRoute.tsx
// ✅ COMMUN AUX 3 PLATEFORMES
// Wrapper pour protéger les composants côté client
// Le middleware Next.js protège côté serveur (middleware.ts)

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface Props {
  children: React.ReactNode;
  rolesAutorises?: string[];
}

export default function ProtectedRoute({ children, rolesAutorises }: Props) {
  const { estConnecte, utilisateur, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!estConnecte) {
      router.push('/auth/connexion');
      return;
    }
    if (rolesAutorises && utilisateur && !rolesAutorises.includes(utilisateur.role)) {
      router.push('/dashboard');
    }
  }, [_hasHydrated, estConnecte, utilisateur, rolesAutorises, router]);

  if (!_hasHydrated || !estConnecte) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#64748B', fontSize: 14 }}>
          Chargement…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
