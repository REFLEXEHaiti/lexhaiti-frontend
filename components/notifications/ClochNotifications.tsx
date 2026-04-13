// components/notifications/ClochNotifications.tsx
// ✅ COMMUN AUX 3 PLATEFORMES

'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useTenant } from '@/lib/tenantContext';

export default function ClochNotifications() {
  const { notifications, nonLues, marquerToutesLues } = useNotifications();
  const { config } = useTenant();
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const primaire = config?.couleursTheme.primaire ?? '#1B3A6B';

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const ouvrir = () => {
    setOuvert(o => !o);
    if (!ouvert && nonLues > 0) marquerToutesLues();
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button onClick={ouvrir}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, color: '#64748B', fontSize: 20, display: 'flex', alignItems: 'center' }}
        title="Notifications"
      >
        🔔
        {nonLues > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, background: primaire, color: 'white', borderRadius: '50%', fontSize: 9, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div style={{ position: 'absolute', top: 44, right: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: 320, maxHeight: 400, overflowY: 'auto', zIndex: 300 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, color: '#0D1B2A' }}>Notifications</span>
            {nonLues > 0 && (
              <button onClick={marquerToutesLues} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: primaire, fontWeight: 600 }}>
                Tout lire
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13 }}>
              Aucune notification
            </div>
          ) : (
            notifications.slice(0, 10).map((n: any) => (
              <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #F8FAFC', background: n.lue ? 'white' : `${primaire}06` }}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#0D1B2A', marginBottom: 2 }}>
                  {n.titre}
                </div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                  {n.contenu}
                </div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
