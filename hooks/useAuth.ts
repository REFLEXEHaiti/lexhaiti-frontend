import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export function useAuth() {
  const [chargement, setChargement] = useState(false);
  const { connecter, deconnecter } = useAuthStore();

  const inscrire = async (donnees: {
    email: string; motDePasse: string; prenom: string; nom: string;
    role?: string; ville?: string; whatsapp?: string; langue?: string;
  }) => {
    setChargement(true);
    try {
      const { data } = await api.post('/auth/inscription', donnees);
      // Écrire manuellement dans localStorage AVANT de naviguer
      localStorage.setItem('idea-auth-storage', JSON.stringify({
        state: { utilisateur: data.utilisateur, token: data.access_token, estConnecte: true },
        version: 0
      }));
      connecter(data.access_token, data.utilisateur);
      toast.success('Bienvenue ! 🎉');
      window.location.href = '/dashboard';
    } catch (error: any) {
      const message = error.response?.data?.message ?? "Erreur lors de l'inscription";
      const msg = Array.isArray(message) ? message[0] : message;
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setChargement(false);
    }
  };

  const seConnecter = async (email: string, motDePasse: string) => {
    setChargement(true);
    try {
      const { data } = await api.post('/auth/connexion', { email, motDePasse });
      // Écrire manuellement dans localStorage AVANT de naviguer
      localStorage.setItem('idea-auth-storage', JSON.stringify({
        state: { utilisateur: data.utilisateur, token: data.access_token, estConnecte: true },
        version: 0
      }));
      connecter(data.access_token, data.utilisateur);
      toast.success(`Bienvenue ${data.utilisateur.prenom} !`);
      window.location.href = '/dashboard';
    } catch (error) {
      throw error;
    } finally {
      setChargement(false);
    }
  };

  const seDeconnecter = () => {
    localStorage.removeItem('idea-auth-storage');
    deconnecter();
    document.cookie = 'access_token=; path=/; max-age=0';
    toast.success('Déconnecté');
    window.location.href = '/auth/connexion';
  };

  const motDePasseOublie = async (email: string) => {
    setChargement(true);
    try {
      await api.post('/auth/mot-de-passe-oublie', { email });
      toast.success('Email de réinitialisation envoyé si ce compte existe.');
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setChargement(false);
    }
  };

  const reinitialiserMotDePasse = async (token: string, motDePasse: string) => {
    setChargement(true);
    try {
      await api.post('/auth/reinitialiser-mot-de-passe', { token, motDePasse });
      toast.success('Mot de passe réinitialisé !');
      window.location.href = '/auth/connexion';
    } catch {
      toast.error('Token invalide ou expiré.');
    } finally {
      setChargement(false);
    }
  };

  return { inscrire, seConnecter, seDeconnecter, motDePasseOublie, reinitialiserMotDePasse, chargement };
}