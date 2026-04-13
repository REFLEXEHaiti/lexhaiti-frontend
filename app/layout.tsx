// app/layout.tsx — LexHaiti
// ⚠️ SPÉCIFIQUE À LEXHAITI
// Surcharge les métadonnées du layout commun avec l'identité LexHaiti

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { TenantProvider } from '@/lib/tenantContext';
import Navbar from '@/components/layout/Navbar';
import InitAuth from '@/components/layout/InitAuth';
import Chatbot from '@/components/chatbot/Chatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LexHaiti — Droit, Avocature & Débat Juridique',
  description: 'La plateforme de formation juridique haïtienne. Accédez aux cours de droit, jurisprudences, moot courts et tournois de plaidoirie.',
  manifest: '/manifest.json',
  keywords: 'droit haïtien, avocature, formation juridique, moot court, plaidoirie, barreau Haiti',
  openGraph: {
    title: 'LexHaiti — Droit & Avocature',
    description: 'Formation juridique professionnelle en Haïti',
    siteName: 'LexHaiti',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* Couleur de thème bordeaux LexHaiti pour la barre mobile */}
        <meta name="theme-color" content="#8B0000" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <TenantProvider>
          <InitAuth />
          <Navbar />
          <main style={{ minHeight: '100vh', background: 'var(--page)', overflowX: 'hidden' }}>
            {children}
          </main>
          <Chatbot />
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#8B0000', color: 'white', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '13px', borderRadius: '8px' } }} />
        </TenantProvider>
      </body>
    </html>
  );
}
