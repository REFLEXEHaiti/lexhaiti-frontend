// app/profil/[id]/page.tsx — LexHaiti
// Profil public — accessible sans connexion
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const BORDEAUX = '#8B0000';
const OR = '#D4AF37';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrateur', FORMATEUR: 'Formateur', APPRENANT: 'Juriste', SPECTATEUR: 'Observateur',
};

export default function PageProfil() {
  const { id } = useParams() as { id: string };
  const { utilisateur: moi } = useAuthStore();
  const [profil, setProfil] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/profils/${id}`)
      .then(({ data }) => setProfil(data))
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: `3px solid #F5F0E8`, borderTopColor: BORDEAUX, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (erreur || !profil) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 48 }}>👤</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 'normal', color: '#1A1A1A', textAlign: 'center' }}>Profil introuvable</h2>
      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', textAlign: 'center' }}>Ce profil n'existe pas ou n'est plus disponible.</p>
      <Link href="/classement" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: BORDEAUX, fontSize: 14, fontWeight: 700 }}>← Retour au classement</Link>
    </div>
  );

  const initiales = (profil.prenom?.[0] ?? '') + (profil.nom?.[0] ?? '');
  const estMoi    = moi?.id === id;

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Hero bordeaux */}
      <div style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${OR}25`, border: `3px solid ${OR}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 28, color: OR, flexShrink: 0 }}>
            {initiales.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 'normal', color: 'white', margin: '0 0 8px' }}>
              {profil.prenom} {profil.nom}
            </h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ background: `${OR}25`, color: OR, fontSize: 12, padding: '3px 12px', borderRadius: 4, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>
                {ROLE_LABEL[profil.role] ?? profil.role}
              </span>
              {profil.ville && (
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', fontSize: 12, padding: '3px 12px', borderRadius: 4, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                  📍 {profil.ville}
                </span>
              )}
            </div>
            {profil.bio && (
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.6 }}>{profil.bio}</p>
            )}
          </div>
          {estMoi && (
            <Link href="/profil/modifier" style={{ padding: '10px 20px', background: `${OR}20`, color: OR, border: `1px solid ${OR}40`, borderRadius: 4, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              Modifier le profil
            </Link>
          )}
        </div>
      </div>

      {/* Corps */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(24px,4vw,40px) clamp(20px,5vw,48px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 16px' }}>Activité</h3>
          {[
            { label: 'Formations inscrites', value: profil._count?.inscriptions ?? 0 },
            { label: 'Messages postés',      value: profil._count?.messages ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F0E8' }}>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B' }}>{label}</span>
              <span style={{ fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 700, color: BORDEAUX }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 16px' }}>Points & Badges</h3>
          {profil.points && (
            <div style={{ background: `${OR}10`, borderRadius: 8, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 700, color: OR }}>{profil.points.points}</div>
              <div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#7C5200' }}>points</div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8' }}>Niveau {profil.points.niveau}</div>
              </div>
            </div>
          )}
          {profil.badges?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profil.badges.map((b: any) => (
                <span key={b.id} title={b.description} style={{ background: `${BORDEAUX}10`, color: BORDEAUX, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                  🏅 {b.titre}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#94A3B8' }}>Aucun badge encore.</p>
          )}
        </div>
      </div>
      <style>{`@media(max-width:640px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
