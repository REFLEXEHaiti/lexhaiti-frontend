// app/debats/[id]/page.tsx — LexHaiti
// ⚠️ SPÉCIFIQUE À LEXHAITI
// Détail d'un débat juridique avec :
//   - Arguments Pour/Contre en temps réel
//   - Analyse IA de l'argument (score logique, sources, persuasion)
//   - Vote Pour/Contre sur le débat global

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const BORDEAUX = '#8B0000';
const OR       = '#D4AF37';

export default function PageDebatDetail() {
  const { id }           = useParams() as { id: string };
  const { estConnecte, utilisateur } = useAuthStore();
  const router           = useRouter();

  const [debat, setDebat]         = useState<any>(null);
  const [messages, setMessages]   = useState<any[]>([]);
  const [nouveau, setNouveau]     = useState('');
  const [stance, setStance]       = useState<'POUR' | 'CONTRE' | 'NEUTRE'>('NEUTRE');
  const [envoi, setEnvoi]         = useState(false);
  const [chargement, setChargement] = useState(true);
  const [analyseIA, setAnalyseIA] = useState<any>(null);
  const [analyseEnCours, setAnalyseEnCours] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get(`/debats/${id}`)
      .then(({ data }) => {
        setDebat(data);
        setMessages(data.messages ?? []);
      })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [id]);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const envoyerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveau.trim() || !estConnecte) return;
    setEnvoi(true);

    // Ajout optimiste
    const optimiste = {
      id: Date.now().toString(),
      contenu: nouveau, stance,
      auteur: { prenom: utilisateur?.prenom, nom: utilisateur?.nom },
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimiste]);
    const texte = nouveau;
    setNouveau('');

    try {
      await api.post('/messages', { debatId: id, contenu: texte, stance });
    } catch {}
    setEnvoi(false);
  };

  // Analyse IA de l'argument saisi (LexHaiti uniquement)
  const analyserArgument = async () => {
    if (!nouveau.trim()) return;
    setAnalyseEnCours(true);
    try {
      const { data } = await api.post('/ia/analyser-argument', {
        argument: nouveau,
        contexte: { titreDebat: debat?.titre, categorie: debat?.categorie },
      });
      setAnalyseIA(data);
    } catch {
      setAnalyseIA({ erreur: "Analyse indisponible pour l'instant." });
    }
    setAnalyseEnCours(false);
  };

  const initiales = (p: string, n: string) => ((p?.[0] ?? '') + (n?.[0] ?? '')).toUpperCase();

  if (chargement) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: `3px solid #F1F5F9`, borderTopColor: BORDEAUX, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!debat) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>⚖️</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal' }}>Débat introuvable</h2>
      <Link href="/debats" style={{ color: BORDEAUX, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>← Retour aux débats</Link>
    </div>
  );

  const pour   = messages.filter(m => m.stance === 'POUR').length;
  const contre = messages.filter(m => m.stance === 'CONTRE').length;
  const total  = pour + contre || 1;
  const pctPour = Math.round((pour / total) * 100);
  const pctContre = 100 - pctPour;

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,56px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 80% 50%, ${OR}15 0%, transparent 50%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            <Link href="/debats" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Débats</Link>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>{debat.categorie}</span>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ background: debat.statut === 'OUVERT' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', color: debat.statut === 'OUVERT' ? '#4ADE80' : 'rgba(255,255,255,0.5)', fontSize: 11, padding: '3px 12px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>
              {debat.statut === 'OUVERT' ? '● EN COURS' : '■ TERMINÉ'}
            </span>
            <span style={{ background: `${OR}25`, color: OR, fontSize: 11, padding: '3px 12px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600 }}>
              ⚖️ {debat.categorie}
            </span>
          </div>

          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(20px,3.5vw,36px)', fontWeight: 'normal', color: 'white', lineHeight: 1.25, marginBottom: 14, maxWidth: 760 }}>
            {debat.titre}
          </h1>
          {debat.description && (
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 600, marginBottom: 24 }}>
              {debat.description}
            </p>
          )}

          {/* Barre Pour/Contre */}
          <div style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#4ADE80', fontWeight: 700 }}>POUR — {pctPour}%</span>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#F87171', fontWeight: 700 }}>CONTRE — {pctContre}%</span>
            </div>
            <div style={{ height: 6, background: '#F87171', borderRadius: 100, overflow: 'hidden', display: 'flex' }}>
              <div style={{ height: '100%', width: `${pctPour}%`, background: '#4ADE80', transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
              {messages.length} argument{messages.length > 1 ? 's' : ''} · {debat.vues ?? 0} vues
            </div>
          </div>
        </div>
      </div>

      {/* Corps — grille 2 colonnes */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,4vw,40px) clamp(20px,5vw,56px)', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28 }}>

        {/* Colonne gauche — arguments */}
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 'normal', color: '#1A1A1A', marginBottom: 20 }}>
            Arguments ({messages.length})
          </h2>

          <div ref={messagesRef} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 480, overflowY: 'auto', paddingRight: 4, marginBottom: 24 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>⚖️</div>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>Soyez le premier à argumenter</p>
              </div>
            ) : messages.map(msg => {
              const couleurStance = msg.stance === 'POUR' ? '#16A34A' : msg.stance === 'CONTRE' ? '#DC2626' : '#64748B';
              return (
                <div key={msg.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${couleurStance}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: couleurStance, fontFamily: 'Georgia,serif', flexShrink: 0 }}>
                    {initiales(msg.auteur?.prenom, msg.auteur?.nom) || '?'}
                  </div>
                  <div style={{ flex: 1, background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
                        {msg.auteur?.prenom} {msg.auteur?.nom}
                      </span>
                      {msg.stance && msg.stance !== 'NEUTRE' && (
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${couleurStance}12`, color: couleurStance, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>
                          {msg.stance}
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#374151', lineHeight: 1.65 }}>{msg.contenu}</p>
                    <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formulaire d'argument */}
          {estConnecte && debat.statut === 'OUVERT' ? (
            <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 14, padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#1A1A1A', margin: '0 0 14px', fontWeight: 'normal' }}>
                Votre argument
              </h3>

              {/* Sélecteur de position */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {(['POUR', 'NEUTRE', 'CONTRE'] as const).map(s => {
                  const col = s === 'POUR' ? '#16A34A' : s === 'CONTRE' ? '#DC2626' : '#64748B';
                  return (
                    <button key={s} type="button" onClick={() => setStance(s)}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${stance === s ? col : '#E2E8F0'}`, background: stance === s ? `${col}10` : 'white', color: stance === s ? col : '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                      {s === 'POUR' ? '👍 Pour' : s === 'CONTRE' ? '👎 Contre' : '— Neutre'}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={envoyerMessage} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <textarea
                  value={nouveau} onChange={e => setNouveau(e.target.value)}
                  placeholder="Rédigez votre argument avec rigueur juridique…"
                  rows={4}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#374151', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = BORDEAUX; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  {/* Bouton analyse IA — spécifique LexHaiti */}
                  <button type="button" onClick={analyserArgument} disabled={analyseEnCours || !nouveau.trim()}
                    style={{ flex: 1, padding: '11px', background: `${OR}20`, color: '#7C5200', border: `1px solid ${OR}50`, borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: !nouveau.trim() ? 0.5 : 1 }}>
                    {analyseEnCours ? '⏳ Analyse…' : '🤖 Analyser avec l\'IA'}
                  </button>
                  <button type="submit" disabled={envoi || !nouveau.trim()}
                    style={{ flex: 2, padding: '11px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: !nouveau.trim() ? 'not-allowed' : 'pointer', opacity: !nouveau.trim() ? 0.5 : 1 }}>
                    Publier l'argument →
                  </button>
                </div>
              </form>

              {/* Résultat analyse IA */}
              {analyseIA && !analyseIA.erreur && (
                <div style={{ marginTop: 16, background: `${OR}08`, border: `1px solid ${OR}30`, borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: '#7C5200', marginBottom: 12 }}>
                    🤖 Analyse IA de votre argument
                  </div>
                  {/* Scores */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'Logique',    score: analyseIA.scores?.logique ?? 0 },
                      { label: 'Sources',    score: analyseIA.scores?.sources ?? 0 },
                      { label: 'Persuasion', score: analyseIA.scores?.persuasion ?? 0 },
                    ].map(({ label, score }) => (
                      <div key={label} style={{ textAlign: 'center', background: 'white', borderRadius: 8, padding: '10px 6px' }}>
                        <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: score >= 7 ? '#16A34A' : score >= 5 ? OR : '#DC2626' }}>
                          {score}/10
                        </div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#64748B', marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {analyseIA.suggestion && (
                    <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>
                      💡 {analyseIA.suggestion}
                    </p>
                  )}
                </div>
              )}
              {analyseIA?.erreur && (
                <div style={{ marginTop: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#94A3B8' }}>{analyseIA.erreur}</div>
              )}
            </div>
          ) : !estConnecte ? (
            <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', marginBottom: 16 }}>
                Connectez-vous pour participer à ce débat juridique
              </p>
              <Link href="/auth/connexion" style={{ display: 'inline-block', padding: '11px 28px', background: BORDEAUX, color: 'white', textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, borderRadius: 8 }}>
                Se connecter
              </Link>
            </div>
          ) : null}
        </div>

        {/* Colonne droite — informations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats du débat */}
          <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 14, padding: '20px' }}>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 'normal', color: '#1A1A1A', marginBottom: 16 }}>
              Informations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Statut',     value: debat.statut === 'OUVERT' ? '🟢 Ouvert' : '⚫ Fermé' },
                { label: 'Catégorie', value: debat.categorie },
                { label: 'Arguments', value: `${messages.length}` },
                { label: 'Pour',      value: `${pour} (${pctPour}%)` },
                { label: 'Contre',    value: `${contre} (${pctContre}%)` },
                { label: 'Vues',      value: `${debat.vues ?? 0}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F8F7F4' }}>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#374151' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chatbot IA juridique — bannière */}
          <div style={{ background: `linear-gradient(135deg, #1A0000, ${BORDEAUX})`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚖️</div>
            <p style={{ fontFamily: 'Georgia,serif', fontSize: 14, color: 'white', marginBottom: 12, lineHeight: 1.5 }}>
              Besoin d'aide pour préparer votre plaidoirie ?
            </p>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: `${OR}cc`, marginBottom: 14, lineHeight: 1.5 }}>
              L'assistant IA LexHaiti peut vous aider à structurer vos arguments juridiques.
            </p>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: OR, fontWeight: 700 }}>
              👉 Cliquez sur le bouton 🤖 en bas à droite
            </div>
          </div>

          {/* Lien formations liées */}
          <div style={{ background: 'white', border: `1px solid ${OR}30`, borderRadius: 14, padding: '18px' }}>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 'normal', color: '#1A1A1A', margin: '0 0 10px' }}>
              Formations recommandées
            </h3>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: '0 0 12px' }}>
              Renforcez vos arguments avec nos formations en {debat.categorie ?? 'droit haïtien'}.
            </p>
            <Link href="/formations" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: BORDEAUX, textDecoration: 'none', fontWeight: 700 }}>
              Voir les formations →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 320px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
