// hooks/useSocket.ts
// ═══════════════════════════════════════════════════════════════
// IDEA Haiti — Hook WebSocket multi-tenant
// Le tenant slug est inclus dans les rooms pour isolation complète
// Commun aux 3 plateformes
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { TENANT_SLUG } from '@/lib/api';

export function useSocket(debatId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    const wsUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').replace('/api', '').replace(/\/$/, '');

    socketRef.current = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      path: '/socket.io',
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      // Rejoindre la room avec le tenant slug pour isolation
      if (debatId) {
        socket.emit('rejoindre-debat', { debatId, tenantSlug: TENANT_SLUG });
      }
    });

    return () => {
      if (debatId) {
        socket.emit('quitter-debat', { debatId, tenantSlug: TENANT_SLUG });
      }
      socket.disconnect();
    };
  }, [token, debatId]);

  return socketRef.current;
}

export function useLiveSocket(liveId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token || !liveId) return;

    const wsUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').replace('/api', '').replace(/\/$/, '');

    socketRef.current = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      path: '/socket.io',
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('rejoindre-live', { liveId, tenantSlug: TENANT_SLUG });
    });

    return () => { socket.disconnect(); };
  }, [token, liveId]);

  return socketRef.current;
}
