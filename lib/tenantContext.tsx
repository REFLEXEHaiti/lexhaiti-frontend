// lib/tenantContext.tsx
// ═══════════════════════════════════════════════════════════════
// IDEA Haiti — Contexte Tenant
// Charge la configuration de la plateforme au démarrage :
//   couleurs, logo, nom, modules actifs, partenaires
// Chaque frontend (LexHaiti, TechPro, MediForm) déclare son SLUG
// via la variable d'environnement NEXT_PUBLIC_TENANT_SLUG
// ═══════════════════════════════════════════════════════════════

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// ── Types ────────────────────────────────────────────────────
export interface CouleursTheme {
  primaire: string;     // ex: "#8B0000" pour LexHaiti
  secondaire: string;   // ex: "#D4AF37"
  accent: string;       // fond clair
  texte: string;
}

export interface ModulesActifs {
  debats: boolean;
  tournois: boolean;
  simulations: boolean;
  cours: boolean;
  lives: boolean;
  gamification: boolean;
  paiements: boolean;
  ia: boolean;
  bibliotheque: boolean;
}

export interface TenantConfig {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  domaineWeb: string | null;
  couleursTheme: CouleursTheme;
  modulesActifs: ModulesActifs;
  sloganCourt: string | null;
  partenaires: { nom: string; logoUrl: string | null }[];
  emailContact: string | null;
  langue: string;
  pays: string;
}

// ── Valeurs par défaut (fallback si API indisponible) ────────
const DEFAULTS: Record<string, Partial<TenantConfig>> = {
  lex: {
    nom: 'LexHaiti', slug: 'lex', sloganCourt: 'Droit & Avocature',
    couleursTheme: { primaire: '#8B0000', secondaire: '#D4AF37', accent: '#F5F0E8', texte: '#1A1A1A' },
    modulesActifs: { debats: true, tournois: true, simulations: true, cours: true, lives: true, gamification: true, paiements: true, ia: true, bibliotheque: true },
  },
  techpro: {
    nom: 'TechPro Haiti', slug: 'techpro', sloganCourt: 'Formations Pro',
    couleursTheme: { primaire: '#1B3A6B', secondaire: '#FF6B35', accent: '#EBF3FB', texte: '#0D1B2A' },
    modulesActifs: { debats: false, tournois: false, simulations: true, cours: true, lives: true, gamification: true, paiements: true, ia: true, bibliotheque: true },
  },
  mediform: {
    nom: 'MediForm Haiti', slug: 'mediform', sloganCourt: 'Santé & Paramédicale',
    couleursTheme: { primaire: '#1B6B45', secondaire: '#1E5FA8', accent: '#E8F5ED', texte: '#0D2818' },
    modulesActifs: { debats: false, tournois: false, simulations: true, cours: true, lives: true, gamification: true, paiements: true, ia: true, bibliotheque: true },
  },
};

// ── Contexte ─────────────────────────────────────────────────
interface TenantContextValue {
  config: TenantConfig | null;
  chargement: boolean;
  moduleActif: (module: keyof ModulesActifs) => boolean;
}

const TenantContext = createContext<TenantContextValue>({
  config: null,
  chargement: true,
  moduleActif: () => true,
});

export function useTenant() {
  return useContext(TenantContext);
}

// ── Provider ─────────────────────────────────────────────────
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const slug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'lex';
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

    fetch(`${apiUrl}/api/tenants/${slug}/config`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setConfig({
            ...data,
            couleursTheme: data.couleursTheme ?? DEFAULTS[slug]?.couleursTheme,
            modulesActifs: data.modulesActifs ?? DEFAULTS[slug]?.modulesActifs,
            partenaires: data.partenaires ?? [],
          });
          // Appliquer les variables CSS du thème au document
          appliquerTheme(data.couleursTheme ?? DEFAULTS[slug]?.couleursTheme);
        } else {
          // Fallback config locale
          const def = DEFAULTS[slug] ?? DEFAULTS['lex'];
          setConfig({ id: '', nom: def.nom!, slug, description: null, logoUrl: null, domaineWeb: null, couleursTheme: def.couleursTheme!, modulesActifs: def.modulesActifs!, sloganCourt: def.sloganCourt!, partenaires: [], emailContact: null, langue: 'fr', pays: 'HT' });
          appliquerTheme(def.couleursTheme!);
        }
      })
      .catch(() => {
        const def = DEFAULTS[slug] ?? DEFAULTS['lex'];
        setConfig({ id: '', nom: def.nom!, slug, description: null, logoUrl: null, domaineWeb: null, couleursTheme: def.couleursTheme!, modulesActifs: def.modulesActifs!, sloganCourt: def.sloganCourt!, partenaires: [], emailContact: null, langue: 'fr', pays: 'HT' });
        appliquerTheme(def.couleursTheme!);
      })
      .finally(() => setChargement(false));
  }, []);

  const moduleActif = (module: keyof ModulesActifs) => {
    if (!config) return true;
    return config.modulesActifs[module] === true;
  };

  return (
    <TenantContext.Provider value={{ config, chargement, moduleActif }}>
      {children}
    </TenantContext.Provider>
  );
}

// ── Applique les variables CSS dynamiquement ─────────────────
function appliquerTheme(couleurs: CouleursTheme) {
  if (typeof document === 'undefined' || !couleurs) return;
  const root = document.documentElement;
  root.style.setProperty('--tenant-primaire',   couleurs.primaire);
  root.style.setProperty('--tenant-secondaire', couleurs.secondaire);
  root.style.setProperty('--tenant-accent',     couleurs.accent);
  root.style.setProperty('--tenant-texte',      couleurs.texte);
}
