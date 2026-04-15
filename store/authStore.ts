import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sauvegarderSession, supprimerSession } from '@/lib/auth';

export interface Utilisateur {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: 'ADMIN' | 'FORMATEUR' | 'APPRENANT' | 'SPECTATEUR';
  tenantId: string;
  tenant: string;
}

interface AuthStore {
  utilisateur: Utilisateur | null;
  token: string | null;
  estConnecte: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  connecter: (token: string, utilisateur: Utilisateur) => void;
  deconnecter: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      utilisateur: null,
      token: null,
      estConnecte: false,
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      connecter: (token, utilisateur) => {
        sauvegarderSession(token, utilisateur);
        set({ token, utilisateur, estConnecte: true });
      },

      deconnecter: () => {
        supprimerSession();
        set({ token: null, utilisateur: null, estConnecte: false });
      },
    }),
    {
      name: 'idea-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        utilisateur: state.utilisateur,
        token: state.token,
        estConnecte: state.estConnecte,
      }),
      onRehydrateStorage: () => (state) => {
        // Appelé quand la réhydratation est terminée
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);