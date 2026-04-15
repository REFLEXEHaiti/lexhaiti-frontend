'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface Props {
  children: React.ReactNode;
  rolesAutorises?: string[];
}

export default function ProtectedRoute({ children, rolesAutorises }: Props) {
  const { estConnecte, utilisateur } = useAuthStore();
  const router = useRouter();
  const [pret, setPret] = useState(false);

  useEffect(() => {
    // Attendre 150ms — laisse Zustand persist terminer la réhydratation depuis localStorage
    const t = setTimeout(() => setPret(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!pret) return;
    if (!estConnecte) {
      router.replace('/auth/connexion');
      return;
    }
    if (rolesAutorises && utilisateur && !rolesAutorises.includes(utilisateur.role)) {
      router.replace('/dashboard');
    }
  }, [pret, estConnecte, utilisateur]);

  if (!pret) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#64748B', fontSize: 14 }}>
          Chargement…
        </div>
      </div>
    );
  }

  if (!estConnecte) return null;
  if (rolesAutorises && utilisateur && !rolesAutorises.includes(utilisateur.role)) return null;

  return <>{children}</>;
}
