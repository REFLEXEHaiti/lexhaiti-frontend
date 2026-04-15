'use client';
// components/layout/InitAuth.tsx
// Force _hasHydrated = true après le premier rendu côté client
// Garantit que ProtectedRoute ne redirige jamais à tort

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function InitAuth() {
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);

  useEffect(() => {
    // Zustand persist hydrate de façon synchrone au premier accès
    // On force _hasHydrated = true après le montage côté client
    setHasHydrated(true);
  }, []);

  return null;
}
