// app/classement/page.tsx — LexHaiti
// Redirige vers la page tournois qui contient le classement des matchs
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PageClassement() {
  const router = useRouter();
  useEffect(() => { router.replace('/tournois'); }, []);
  return null;
}
