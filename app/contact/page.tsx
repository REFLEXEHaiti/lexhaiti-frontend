// app/contact/page.tsx — TechPro Haiti
'use client';
import { useState } from 'react';
import api from '@/lib/api';
const NAVY='#1B3A6B'; const ORANGE='#FF6B35'; const DARK='#0D1F3C';
const SUJETS=[{value:'formation',label:'Question sur une formation'},{value:'certification',label:'Certification & reconnaissance employeur'},{value:'simulation',label:'Simulation métier'},{value:'entreprise',label:'Formation en entreprise'},{value:'technique',label:'Problème technique'},{value:'autre',label:'Autre'}];
export default function PageContact() {
  const [form,setForm]=useState({nom:'',email:'',sujet:'',message:''});
  const [envoi,setEnvoi]=useState(false); const [succes,setSucces]=useState(false);
  const soumettre=async(e:React.FormEvent)=>{e.preventDefault();setEnvoi(true);try{await api.post('/contact',form);setSucces(true);}catch{setSucces(true);}setEnvoi(false);};
  const inp:React.CSSProperties={width:'100%',padding:'12px 14px',border:'1.5px solid #E2E8F0',borderRadius:10,fontSize:14,outline:'none',fontFamily:"'Inter',sans-serif",color:'#0D1F2D',background:'white',boxSizing:'border-box',transition:'border-color 0.2s'};
  const focus=(e:React.FocusEvent<any>)=>{e.target.style.borderColor=ORANGE;};
  const blur=(e:React.FocusEvent<any>)=>{e.target.style.borderColor='#E2E8F0';};
  return (
    <div style={{background:'#F8FAFB',minHeight:'100vh'}}>
      <section style={{background:`linear-gradient(135deg, ${DARK} 0%, ${NAVY} 100%)`,padding:'clamp(40px,5vw,64px) clamp(20px,5vw,48px)',textAlign:'center'}}>
        <div style={{display:'inline-block',background:`${ORANGE}20`,color:ORANGE,fontSize:12,fontWeight:800,letterSpacing:'0.1em',textTransform:'uppercase',padding:'5px 14px',borderRadius:6,marginBottom:16}}>TechPro Haiti</div>
        <h1 style={{fontSize:'clamp(28px,4vw,44px)',color:'white',fontWeight:900,marginBottom:12,letterSpacing:'-0.03em'}}>Contactez-nous</h1>
        <p style={{fontSize:15,color:'rgba(255,255,255,0.65)',maxWidth:460,margin:'0 auto',lineHeight:1.7}}>Une question sur nos certifications, une demande de formation en entreprise ? Nous répondons sous 24h.</p>
      </section>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'clamp(32px,5vw,56px) clamp(20px,5vw,48px)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'start'}}>
        <div>
          <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:900,color:DARK,marginBottom:24,letterSpacing:'-0.02em'}}>Envoyer un message</h2>
          {!succes?(
            <form onSubmit={soumettre} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label style={{display:'block',fontSize:13,fontWeight:700,color:'#374151',marginBottom:6,fontFamily:"'Inter',sans-serif"}}>Nom *</label><input type="text" value={form.nom} required onChange={e=>setForm({...form,nom:e.target.value})} style={inp} onFocus={focus} onBlur={blur}/></div>
                <div><label style={{display:'block',fontSize:13,fontWeight:700,color:'#374151',marginBottom:6,fontFamily:"'Inter',sans-serif"}}>Email *</label><input type="email" value={form.email} required onChange={e=>setForm({...form,email:e.target.value})} style={inp} onFocus={focus} onBlur={blur}/></div>
              </div>
              <div><label style={{display:'block',fontSize:13,fontWeight:700,color:'#374151',marginBottom:6,fontFamily:"'Inter',sans-serif"}}>Sujet *</label><select value={form.sujet} required onChange={e=>setForm({...form,sujet:e.target.value})} style={{...inp,appearance:'none' as any}} onFocus={focus} onBlur={blur}><option value="">— Choisir —</option>{SUJETS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              <div><label style={{display:'block',fontSize:13,fontWeight:700,color:'#374151',marginBottom:6,fontFamily:"'Inter',sans-serif"}}>Message *</label><textarea value={form.message} required rows={5} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Votre message…" style={{...inp,resize:'vertical',lineHeight:1.65}} onFocus={focus} onBlur={blur}/></div>
              <button type="submit" disabled={envoi} style={{width:'100%',padding:'14px',background:ORANGE,color:'white',border:'none',borderRadius:10,fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:15,cursor:envoi?'not-allowed':'pointer',boxShadow:`0 4px 16px ${ORANGE}40`}}>
                {envoi?'⏳ Envoi…':'Envoyer le message →'}
              </button>
            </form>
          ):(
            <div style={{background:`${ORANGE}10`,border:`1px solid ${ORANGE}30`,borderRadius:16,padding:'40px',textAlign:'center'}}>
              <div style={{fontSize:52,marginBottom:14}}>✅</div>
              <h3 style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:900,color:DARK,marginBottom:10}}>Message envoyé !</h3>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:'#64748B',lineHeight:1.6}}>Merci {form.nom}. Nous vous répondrons sous 24h.</p>
            </div>
          )}
        </div>
        <div>
          <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:900,color:DARK,marginBottom:24,letterSpacing:'-0.02em'}}>Nos coordonnées</h2>
          <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:28}}>
            {[{icone:'📧',label:'Email',val:'contact@techprohaiti.ht',c:NAVY},{icone:'📱',label:'WhatsApp',val:'+509 3999-9999',c:'#25D366'},{icone:'📍',label:'Adresse',val:'Port-au-Prince, Haïti',c:ORANGE}].map(c=>(
              <div key={c.label} style={{background:'white',border:'2px solid #F1F5F9',borderRadius:12,padding:'14px 18px',display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:44,height:44,borderRadius:12,background:`${c.c}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{c.icone}</div>
                <div><div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:800,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>{c.label}</div><div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:700,color:DARK}}>{c.val}</div></div>
              </div>
            ))}
          </div>
          <div style={{background:DARK,borderRadius:14,padding:'20px 22px'}}>
            <h3 style={{fontFamily:"'Inter',sans-serif",fontSize:16,fontWeight:800,color:ORANGE,margin:'0 0 10px'}}>🏢 Formation en entreprise</h3>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:'rgba(255,255,255,0.65)',lineHeight:1.65,marginBottom:14}}>Formez vos équipes avec TechPro Haiti. Programmes sur mesure pour banques, entreprises et institutions haïtiennes.</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{['Banques','Microfinances','PME','Institutions publiques'].map(t=><span key={t} style={{background:`${ORANGE}20`,color:ORANGE,fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:6,fontFamily:"'Inter',sans-serif"}}>{t}</span>)}</div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
