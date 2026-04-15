// hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const { estConnecte, token, _hasHydrated } = useAuthStore();

  const chargerNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {}
  };

  const chargerNonLues = async () => {
    try {
      const { data } = await api.get('/notifications/non-lues');
      setNonLues(data.nonLues);
    } catch {}
  };

  const marquerToutesLues = async () => {
    try {
      await api.post('/notifications/tout-lire');
      setNonLues(0);
      chargerNotifications();
    } catch {}
  };

  useEffect(() => {
    if (!_hasHydrated || !estConnecte || !token) return;
    chargerNotifications();
    chargerNonLues();
    const interval = setInterval(chargerNonLues, 30000);
    return () => clearInterval(interval);
  }, [_hasHydrated, estConnecte, token]);

  return { notifications, nonLues, marquerToutesLues, chargerNotifications };
}