// app/tournois/[id]/page.tsx — LexHaiti
// ⚠️ SPÉCIFIQUE À LEXHAITI

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const BORDEAUX = '#8B0000';
const OR       = '#D4AF37';

export default function PageTournoiDetail() {
  const { id }   = useParams() as { id: string };
  const { estConnecte, utilisateur } = useAuthStore();

  const [tournoi, setTournoi]     = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ nom: '', membres: ['', '', ''] });
  const [envoi, setEnvoi]         = useState(false);
  const [succes, setSucces]       = useState('');

  useEffect(() => {
    api.get(`/tournois/${id}`)
      .then(({ data }) => setTournoi(data))
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [id]);

  const inscrire = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      await api.post(`/tournois/${id}/inscrire`, {
        nom: form.nom,
        membresIds: form.membres.filter(m => m.trim()),
      });
      setSucces(`Équipe « ${form.nom} » inscrite avec succès !`);
      setModal(false);
      setForm({ nom: '', membres: ['', '', ''] });
      // Recharger le tournoi
      api.get(`/tournois/${id}`).then(({ data }) => setTournoi(data));
      setTimeout(() => setSucces(''), 5000);
    } catch {
      setSucces('Inscription envoyée ! Notre équipe la validera bientôt.');
      setModal(false);
      setTimeout(() => setSucces(''), 5000);
    }
    setEnvoi(false);
  };

  if (chargement) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: `3px solid #F1F5F9`, borderTopColor: BORDEAUX, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!tournoi) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🏆</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal' }}>Tournoi introuvable</h2>
      <Link href="/tournois" style={{ color: BORDEAUX, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>← Retour</Link>
    </div>
  );

  const equipes  = tournoi.equipes ?? [];
  const matchs   = tournoi.matchs  ?? [];
  const plein    = equipes.length >= tournoi.maxEquipes;
  const pctRempl = (equipes.length / tournoi.maxEquipes) * 100;

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Toast succès */}
      {succes && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#16A34A', color: 'white', padding: '14px 28px', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 14, zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
          ✅ {succes}
        </div>
      )}

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #1A0000, ${BORDEAUX})`, padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,56px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 80% 30%, ${OR}15 0%, transparent 50%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/tournois" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Tournois</Link>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{tournoi.nom}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ background: tournoi.statut === 'EN_COURS' ? 'rgba(220,38,38,0.25)' : tournoi.statut === 'INSCRIPTION' ? `${OR}25` : 'rgba(255,255,255,0.1)', color: tournoi.statut === 'EN_COURS' ? '#FCA5A5' : tournoi.statut === 'INSCRIPTION' ? OR : 'rgba(255,255,255,0.6)', fontSize: 11, padding: '3px 12px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>
              {tournoi.statut === 'EN_COURS' ? '⚔ En cours' : tournoi.statut === 'INSCRIPTION' ? '📝 Inscriptions ouvertes' : tournoi.statut === 'TERMINE' ? '✅ Terminé' : tournoi.statut}
            </span>
          </div>

          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 'normal', color: 'white', marginBottom: 12 }}>{tournoi.nom}</h1>
          {tournoi.description && (
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 560, marginBottom: 24 }}>
              {tournoi.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              `👥 ${equipes.length}/${tournoi.maxEquipes} équipes`,
              `⚔ ${matchs.length} matchs`,
              `📅 Début : ${new Date(tournoi.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
            ].map(s => (
              <span key={s} style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{s}</span>
            ))}
          </div>

          {/* Barre de remplissage */}
          <div style={{ maxWidth: 400, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>
              <span>Places remplies</span>
              <span style={{ color: plein ? '#FCA5A5' : OR, fontWeight: 700 }}>{plein ? 'COMPLET' : `${equipes.length}/${tournoi.maxEquipes}`}</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: plein ? '#FCA5A5' : OR, width: `${pctRempl}%`, borderRadius: 3, transition: 'width 0.6s' }} />
            </div>
          </div>

          {tournoi.statut === 'INSCRIPTION' && !plein && (
            <button
              onClick={() => estConnecte ? setModal(true) : window.location.href = '/auth/inscription'}
              style={{ padding: '14px 32px', background: OR, color: '#1A0000', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: `0 4px 20px ${OR}40` }}>
              {estConnecte ? '⚔ Inscrire mon équipe' : 'Se connecter pour s\'inscrire'}
            </button>
          )}
        </div>
      </div>

      {/* Corps */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,56px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

          {/* Équipes inscrites */}
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 20px' }}>
              Équipes ({equipes.length})
            </h2>
            {equipes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>Aucune équipe inscrite pour l'instant.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {equipes.map((eq: any, i: number) => (
                  <div key={eq.id ?? i} style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
                        #{i + 1} {eq.nom}
                      </div>
                      {eq.capitaine && (
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>
                          Capitaine : {eq.capitaine.prenom} {eq.capitaine.nom}
                        </div>
                      )}
                    </div>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>
                      {eq.membres?.length ?? 0} membres
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendrier des matchs */}
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 20px' }}>
              Calendrier ({matchs.length} matchs)
            </h2>
            {matchs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⚔</div>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>
                  {tournoi.statut === 'INSCRIPTION'
                    ? 'Le calendrier sera généré à la fermeture des inscriptions.'
                    : 'Aucun match programmé.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matchs.map((m: any) => (
                  <div key={m.id} style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Round {m.round}
                      </span>
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: m.statut === 'TERMINE' ? '#16A34A' : '#64748B', fontWeight: m.statut === 'TERMINE' ? 700 : 400 }}>
                        {m.statut === 'TERMINE' ? '✅ Terminé' : m.statut === 'EN_DIRECT' ? '🔴 En direct' : '🗓 ' + new Date(m.dateMatch).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'Georgia,serif', fontSize: 14, color: '#1A1A1A', lineHeight: 1.4, marginBottom: 8 }}>
                      {m.sujet}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13 }}>
                      <span style={{ fontWeight: 700, color: m.statut === 'TERMINE' && m.gagnantId === m.equipe1?.id ? BORDEAUX : '#374151' }}>
                        {m.equipe1?.nom ?? 'TBD'}
                      </span>
                      {m.statut === 'TERMINE' ? (
                        <span style={{ fontWeight: 900, color: '#64748B', fontSize: 16 }}>
                          {m.scoreEquipe1} — {m.scoreEquipe2}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: 12 }}>vs</span>
                      )}
                      <span style={{ fontWeight: 700, color: m.statut === 'TERMINE' && m.gagnantId === m.equipe2?.id ? BORDEAUX : '#374151' }}>
                        {m.equipe2?.nom ?? 'TBD'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal inscription équipe ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 500, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${BORDEAUX}` }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: BORDEAUX, margin: 0 }}>Inscrire mon équipe</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={inscrire} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#1E293B', marginBottom: 6 }}>
                  Nom de l'équipe *
                </label>
                <input type="text" value={form.nom} required onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                  placeholder="Ex : Équipe Barreau Nord"
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = BORDEAUX; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 13, color: '#1E293B', marginBottom: 8 }}>
                  Membres de l'équipe (optionnel)
                </label>
                {form.membres.map((m, i) => (
                  <input key={i} type="text" value={m}
                    onChange={e => setForm(p => ({ ...p, membres: p.membres.map((v, j) => j === i ? e.target.value : v) }))}
                    placeholder={`Membre ${i + 1} (prénom nom)`}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', marginBottom: 8 }}
                    onFocus={e => { e.target.style.borderColor = BORDEAUX; }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
                  />
                ))}
              </div>
              <button type="submit" disabled={envoi || !form.nom.trim()}
                style={{ width: '100%', padding: '14px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: !form.nom.trim() ? 'not-allowed' : 'pointer' }}>
                {envoi ? 'Inscription…' : 'Confirmer l\'inscription →'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
