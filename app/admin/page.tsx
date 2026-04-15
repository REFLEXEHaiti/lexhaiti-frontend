// app/admin/page.tsx — LexHaiti
'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const BORDEAUX = '#8B0000';
const OR = '#D4AF37';

function ValiderPaiement({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ userId: '', plan: 'AVOCAT', reference: '', methode: 'MonCash' });
  const [envoi, setEnvoi] = useState(false);
  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId.trim() || !form.reference.trim()) { toast.error('ID et référence requis'); return; }
    setEnvoi(true);
    try {
      await api.post('/paiements/admin/valider', form);
      toast.success('✅ Paiement validé !');
      setForm({ userId: '', plan: 'AVOCAT', reference: '', methode: 'MonCash' });
      onSuccess();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Erreur'); }
    setEnvoi(false);
  };
  const inp: React.CSSProperties = { width: '100%', padding: '10px 13px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#1A1A1A', background: 'white', boxSizing: 'border-box' };
  return (
    <form onSubmit={valider} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {[{ k: 'userId', l: 'ID utilisateur *', ph: 'UUID' }, { k: 'reference', l: 'Référence *', ph: 'N° transaction' }].map(f => (
        <div key={f.k}>
          <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{f.l}</label>
          <input value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={inp} />
        </div>
      ))}
      <div>
        <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Plan</label>
        <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
          {['AVOCAT', 'INSTITUTION', 'ETUDIANT'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Méthode</label>
        <select value={form.methode} onChange={e => setForm(p => ({ ...p, methode: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
          {['MonCash', 'PayPal', 'Zelle', 'Visa', 'Autre'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit" disabled={envoi} style={{ width: '100%', padding: '11px', background: BORDEAUX, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {envoi ? 'Validation…' : '✅ Valider le paiement'}
        </button>
      </div>
    </form>
  );
}

export default function PageAdmin() {
  return <ProtectedRoute rolesAutorises={['ADMIN']}><Contenu /></ProtectedRoute>;
}

function Contenu() {
  const [onglet, setOnglet] = useState<'stats' | 'utilisateurs' | 'formations' | 'paiements'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [abonnements, setAbonnements] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analytics/admin').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (onglet === 'utilisateurs') api.get('/utilisateurs?limite=50').then(({ data }) => setUtilisateurs(Array.isArray(data) ? data : data.utilisateurs ?? [])).catch(() => {});
    if (onglet === 'formations')   api.get('/cours?limite=50').then(({ data }) => setFormations(Array.isArray(data) ? data : [])).catch(() => {});
    if (onglet === 'paiements')    api.get('/paiements/admin/abonnements').then(({ data }) => setAbonnements(Array.isArray(data) ? data : [])).catch(() => {});
  }, [onglet]);

  const changerRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/utilisateurs/${userId}/role`, { role });
      setUtilisateurs(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast.success('Rôle mis à jour');
    } catch { toast.error('Erreur'); }
  };

  const toggleFormation = async (id: string, publie: boolean) => {
    try {
      await api.patch(`/cours/${id}`, { publie: !publie });
      setFormations(prev => prev.map(f => f.id === id ? { ...f, publie: !publie } : f));
    } catch { toast.error('Erreur'); }
  };

  const ONGLETS = [
    { id: 'stats',        label: '📊 Tableau de bord' },
    { id: 'utilisateurs', label: '👥 Membres' },
    { id: 'formations',   label: '📚 Formations' },
    { id: 'paiements',    label: '💳 Abonnements' },
  ];

  const inp: React.CSSProperties = { width: '100%', padding: '10px 13px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#1A1A1A', background: 'white', boxSizing: 'border-box' };

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #1A0000 0%, ${BORDEAUX} 100%)`, padding: 'clamp(24px,4vw,40px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 'normal', color: 'white', margin: '0 0 6px' }}>Administration LexHaiti</h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: OR, margin: 0 }}>Gestion des membres, formations et abonnements</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(20px,5vw,48px)' }}>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, flexWrap: 'wrap', background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: 4 }}>
          {ONGLETS.map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id as any)}
              style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: onglet === o.id ? BORDEAUX : 'transparent', color: onglet === o.id ? 'white' : '#64748B', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: onglet === o.id ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {onglet === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Membres inscrits', val: stats?.totalUtilisateurs ?? '—', couleur: BORDEAUX },
              { label: 'Formations',       val: stats?.totalCours ?? '—',        couleur: '#1B3A6B' },
              { label: 'Abonnés',          val: stats?.totalAbonnes ?? '—',      couleur: '#065F46' },
              { label: 'Revenus HTG',      val: stats?.revenusHTG ?? '—',        couleur: '#7C2D12' },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 32, fontWeight: 700, color: s.couleur }}>{s.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Utilisateurs */}
        {onglet === 'utilisateurs' && (
          <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E8E4DC' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 'normal', color: '#1A1A1A', margin: 0 }}>Membres ({utilisateurs.length})</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8F7F4' }}>
                    {['Nom', 'Email', 'Rôle', 'Abonnement', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {utilisateurs.map(u => (
                    <tr key={u.id} style={{ borderTop: '1px solid #F5F0E8' }}>
                      <td style={{ padding: '12px 16px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{u.prenom} {u.nom}</td>
                      <td style={{ padding: '12px 16px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <select value={u.role} onChange={e => changerRole(u.id, e.target.value)}
                          style={{ padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#374151', outline: 'none', background: 'white' }}>
                          {['APPRENANT', 'FORMATEUR', 'ADMIN', 'SPECTATEUR'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: u.abonnement?.statut === 'ACTIF' ? `${OR}20` : '#F1F5F9', color: u.abonnement?.statut === 'ACTIF' ? '#7C5200' : '#94A3B8', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                          {u.abonnement?.statut === 'ACTIF' ? `✅ ${u.abonnement.plan}` : 'Gratuit'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <a href={`/profil/${u.id}`} style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: BORDEAUX, textDecoration: 'none', fontWeight: 700 }}>Voir →</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Formations */}
        {onglet === 'formations' && (
          <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E8E4DC' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 'normal', color: '#1A1A1A', margin: 0 }}>Formations ({formations.length})</h2>
            </div>
            {formations.map((f, i) => (
              <div key={f.id} style={{ padding: '14px 20px', borderTop: i > 0 ? '1px solid #F5F0E8' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 3 }}>{f.titre}</div>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>{f.categorie} · {f._count?.lecons ?? 0} leçons · {f._count?.inscriptions ?? 0} inscrits</div>
                </div>
                <button onClick={() => toggleFormation(f.id, f.publie)}
                  style={{ padding: '6px 14px', background: f.publie ? `${OR}15` : '#F1F5F9', color: f.publie ? '#7C5200' : '#64748B', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {f.publie ? '✅ Publié' : '⬜ Brouillon'}
                </button>
                <a href={`/formations/${f.id}`} target="_blank" rel="noreferrer" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: BORDEAUX, textDecoration: 'none', fontWeight: 700 }}>Voir →</a>
              </div>
            ))}
          </div>
        )}

        {/* Paiements */}
        {onglet === 'paiements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[
                { label: 'Actifs',  val: abonnements.filter((a: any) => a.statut === 'ACTIF').length,   couleur: OR },
                { label: 'Expirés', val: abonnements.filter((a: any) => a.statut === 'EXPIRE').length,  couleur: '#D97706' },
                { label: 'Annulés', val: abonnements.filter((a: any) => a.statut === 'ANNULE').length,  couleur: '#DC2626' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 700, color: s.couleur }}>{s.val}</div>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', border: `1px solid ${BORDEAUX}30`, borderRadius: 12, padding: '20px 24px' }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 'normal', color: BORDEAUX, margin: '0 0 16px' }}>Valider un paiement manuel</h3>
              <ValiderPaiement onSuccess={() => api.get('/paiements/admin/abonnements').then(r => setAbonnements(Array.isArray(r.data) ? r.data : []))} />
            </div>
            <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #E8E4DC' }}>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 'normal', color: '#1A1A1A', margin: 0 }}>Tous les abonnements ({abonnements.length})</h3>
              </div>
              {abonnements.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>Aucun abonnement</div>
              ) : abonnements.map((ab: any) => (
                <div key={ab.id} style={{ padding: '14px 20px', borderTop: '1px solid #F5F0E8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{ab.user?.prenom} {ab.user?.nom}</div>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>{ab.user?.email}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: ab.statut === 'ACTIF' ? `${OR}15` : '#FEF2F2', color: ab.statut === 'ACTIF' ? '#7C5200' : '#DC2626', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                    {ab.statut === 'ACTIF' ? '✅ Actif' : ab.statut === 'EXPIRE' ? '⏰ Expiré' : '❌ Annulé'} · {ab.plan}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
