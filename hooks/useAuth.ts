// hooks/useAuth.ts
// ═══════════════════════════════════════════════════════════════
// IDEA Haiti — Hook authentification
// Commun aux 3 plateformes
// Le slug tenant est automatiquement envoyé via le header X-Tenant-ID
// configuré dans lib/api.ts
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export function useAuth() {
  const [chargement, setChargement] = useState(false);
  const { connecter, deconnecter } = useAuthStore();
  const router = useRouter();

  // ── Inscription ─────────────────────────────────────────────
  const inscrire = async (donnees: {
    email: string;
    motDePasse: string;
    prenom: string;
    nom: string;
    role?: string;
    ville?: string;
    whatsapp?: string;
    langue?: string;
  }) => {
    setChargement(true);
    try {
      // Le header X-Tenant-ID est ajouté automatiquement par l'intercepteur api.ts
      const { data } = await api.post('/auth/inscription', donnees);
      connecter(data.access_token, data.utilisateur);
      toast.success(`Bienvenue sur ${data.utilisateur?.tenant ?? 'la plateforme'} ! 🎉`);
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message ?? "Erreur lors de l'inscription";
      const msg = Array.isArray(message) ? message[0] : message;
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setChargement(false);
    }
  };

  // ── Connexion ────────────────────────────────────────────────
  const seConnecter = async (email: string, motDePasse: string) => {
    setChargement(true);
    try {
      const { data } = await api.post('/auth/connexion', { email, motDePasse });
      connecter(data.access_token, data.utilisateur);
      toast.success(`Bienvenue ${data.utilisateur.prenom} !`);
      router.push('/dashboard');
    } catch (error) {
      // Re-throw — la page affiche son propre message inline
      throw error;
    } finally {
      setChargement(false);
    }
  };

  // ── Déconnexion ──────────────────────────────────────────────
  const seDeconnecter = () => {
    deconnecter();
    toast.success('Déconnecté avec succès');
    router.push('/auth/connexion');
  };

  // ── Mot de passe oublié ──────────────────────────────────────
  const motDePasseOublie = async (email: string) => {
    setChargement(true);
    try {
      await api.post('/auth/mot-de-passe-oublie', { email });
      toast.success('Email de réinitialisation envoyé si ce compte existe.');
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setChargement(false);
    }
  };

  // ── Réinitialiser mot de passe ───────────────────────────────
  const reinitialiserMotDePasse = async (token: string, motDePasse: string) => {
    setChargement(true);
    try {
      await api.post('/auth/reinitialiser-mot-de-passe', { token, motDePasse });
      toast.success('Mot de passe réinitialisé ! Connectez-vous.');
      router.push('/auth/connexion');
    } catch {
      toast.error('Token invalide ou expiré.');
    } finally {
      setChargement(false);
    }
  };

  return { inscrire, seConnecter, seDeconnecter, motDePasseOublie, reinitialiserMotDePasse, chargement };
}
