// app/sponsors/page.tsx — TechPro Haiti
'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const NAVY='#1B3A6B'; const ORANGE='#FF6B35'; const DARK='#0D1F3C';
const MOCK=[
  {id:'S1',nom:'BRH — Banque de la République d\'Haïti',typeContrat:'PLATINE',couleur:NAVY,siteWeb:'https://brh.ht',actif:true,logoUrl:''},
  {id:'S2',nom:'Digicel Haiti',typeContrat:'PLATINE',couleur:ORANGE,siteWeb:'https://digicelhaiti.com',actif:true,logoUrl:''},
  {id:'S3',nom:'BNC Haïti',typeContrat:'OR',couleur:'#c00000',siteWeb:'https://bnc.ht',actif:true,logoUrl:''},
  {id:'S4',nom:'ADIH',typeContrat:'ARGENT',couleur:'#10B981',siteWeb:'',actif:true,logoUrl:''},
];
const BADGE:Record<string,{bg:string;text:string;emoji:string}>={PLATINE:{bg:'#F1F5F9',text:'#475569',emoji:'💎'},OR:{bg:'#FFFBEB',text:'#92400E',emoji:'🥇'},ARGENT:{bg:'#F8FAFC',text:'#475569',emoji:'🥈'},BRONZE:{bg:'#FFF7ED',text:'#9A3412',emoji:'🥉'}};

export default function PageSponsors() {
  const {utilisateur}=useAuthStore();
  const [sponsors,setSponsors]=useState(MOCK);
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({nom:'',siteWeb:'',typeContrat:'OR',couleur:NAVY,logoUrl:''});
  const [envoi,setEnvoi]=useState(false);
  const logoRef=useRef<HTMLInputElement>(null);
  const [preview,setPreview]=useState('');
  const estAdmin=utilisateur?.role==='ADMIN';

  useEffect(()=>{api.get('/sponsoring/sponsors').then(({data})=>{if(Array.isArray(data)&&data.length)setSponsors(data);}).catch(()=>{});}, []);

  const handleLogo=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;setPreview(URL.createObjectURL(f));};
  const supprimer=async(id:string)=>{if(!confirm('Supprimer ?'))return;try{await api.delete(`/sponsoring/sponsors/${id}`);setSponsors(p=>p.filter(s=>s.id!==id));toast.success('Supprimé');}catch{toast.error('Erreur');}};
  const soumettre=async(e:React.FormEvent)=>{e.preventDefault();setEnvoi(true);try{const {data}=await api.post('/sponsoring/sponsors',{...form,logoUrl:preview||form.logoUrl});setSponsors(p=>[data,...p]);toast.success('Partenaire ajouté !');setModal(false);setForm({nom:'',siteWeb:'',typeContrat:'OR',couleur:NAVY,logoUrl:''});setPreview('');}catch{toast.error('Erreur');}setEnvoi(false);};

  const platine=sponsors.filter(s=>s.typeContrat==='PLATINE');
  const or=sponsors.filter(s=>s.typeContrat==='OR');
  const autres=sponsors.filter(s=>!['PLATINE','OR'].includes(s.typeContrat));

  const Card=({s}:{s:any})=>{const b=BADGE[s.typeContrat]??BADGE['BRONZE'];return(
    <div style={{background:'white',border:'2px solid #F1F5F9',borderRadius:14,padding:'18px 20px',display:'flex',alignItems:'center',gap:14,transition:'all 0.2s'}} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow=`0 6px 24px ${NAVY}15`;(e.currentTarget as HTMLElement).style.borderColor=`${ORANGE}25`;}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow='none';(e.currentTarget as HTMLElement).style.borderColor='#F1F5F9';}}>
      <div style={{width:52,height:52,borderRadius:12,background:`${s.couleur??NAVY}12`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>{s.logoUrl&&!s.logoUrl.startsWith('#')?<img src={s.logoUrl} alt={s.nom} style={{maxWidth:48,maxHeight:48,objectFit:'contain'}}/>:<span style={{fontSize:20,fontWeight:900,color:s.couleur??NAVY}}>{s.nom?.[0]}</span>}</div>
      <div style={{flex:1}}><div style={{fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:14,color:DARK,marginBottom:4}}>{s.nom}</div><span style={{background:b.bg,color:b.text,fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:6,fontFamily:"'Inter',sans-serif"}}>{b.emoji} {s.typeContrat}</span></div>
      <div style={{display:'flex',gap:8,flexShrink:0}}>
        {s.siteWeb&&<a href={s.siteWeb} target="_blank" rel="noreferrer" style={{padding:'7px 12px',background:`${ORANGE}10`,color:ORANGE,borderRadius:8,textDecoration:'none',fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:800}}>Site →</a>}
        {estAdmin&&<button onClick={()=>supprimer(s.id)} style={{padding:'7px 12px',background:'#FEF2F2',color:'#DC2626',border:'none',borderRadius:8,fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:800,cursor:'pointer'}}>🗑</button>}
      </div>
    </div>
  );};

  const inp:React.CSSProperties={width:'100%',padding:'10px 13px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:13,outline:'none',fontFamily:"'Inter',sans-serif",color:'#0D1F2D',background:'white',boxSizing:'border-box'};

  return (
    <div style={{background:'#F8FAFB',minHeight:'100vh'}}>
      <section style={{background:`linear-gradient(135deg, ${DARK} 0%, ${NAVY} 100%)`,padding:'clamp(40px,5vw,64px) clamp(20px,5vw,48px)',textAlign:'center'}}>
        <h1 style={{fontSize:'clamp(28px,4vw,44px)',color:'white',fontWeight:900,marginBottom:12,letterSpacing:'-0.03em'}}>Nos partenaires</h1>
        <p style={{fontSize:15,color:'rgba(255,255,255,0.65)',maxWidth:480,margin:'0 auto 24px',lineHeight:1.7}}>Institutions et entreprises qui soutiennent la formation professionnelle haïtienne.</p>
        {estAdmin&&<button onClick={()=>setModal(true)} style={{padding:'12px 24px',background:ORANGE,color:'white',border:'none',borderRadius:8,fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:14,cursor:'pointer',boxShadow:`0 4px 16px ${ORANGE}40`}}>+ Ajouter un partenaire</button>}
      </section>
      <div style={{maxWidth:900,margin:'0 auto',padding:'clamp(32px,5vw,56px) clamp(20px,5vw,48px)'}}>
        {[{items:platine,label:'Partenaires Platine 💎'},{items:or,label:'Partenaires Or 🥇'},{items:autres,label:'Autres partenaires'}].map(({items,label})=>items.length>0&&(
          <div key={label} style={{marginBottom:40}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
              <div style={{height:2,flex:1,background:'#F1F5F9'}}/>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:800,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.1em'}}>{label}</span>
              <div style={{height:2,flex:1,background:'#F1F5F9'}}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>{items.map((s:any)=><Card key={s.id} s={s}/>)}</div>
          </div>
        ))}
        <div style={{background:DARK,borderRadius:16,padding:'28px 32px',textAlign:'center'}}>
          <h3 style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:900,color:'white',marginBottom:12,letterSpacing:'-0.02em'}}>Devenir partenaire TechPro</h3>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:'rgba(255,255,255,0.6)',lineHeight:1.7,maxWidth:500,margin:'0 auto 20px'}}>Rejoignez les institutions qui investissent dans le capital humain haïtien.</p>
          <Link href="/contact?sujet=entreprise" style={{display:'inline-block',padding:'12px 28px',background:ORANGE,color:'white',borderRadius:8,textDecoration:'none',fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:14,boxShadow:`0 4px 16px ${ORANGE}40`}}>Nous contacter →</Link>
        </div>
      </div>
      {modal&&estAdmin&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'white',borderRadius:16,padding:'28px 32px',width:'100%',maxWidth:460,boxShadow:'0 24px 64px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20,paddingBottom:14,borderBottom:`3px solid ${ORANGE}`}}>
              <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:17,fontWeight:900,color:NAVY,margin:0}}>Nouveau partenaire</h2>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#64748B'}}>✕</button>
            </div>
            <form onSubmit={soumettre} style={{display:'flex',flexDirection:'column',gap:14}}>
              <div><label style={{display:'block',fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,color:'#374151',marginBottom:5}}>Nom *</label><input required value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} placeholder="Ex : BRH Haïti" style={inp}/></div>
              <div><label style={{display:'block',fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,color:'#374151',marginBottom:5}}>Site web</label><input type="url" value={form.siteWeb} onChange={e=>setForm(p=>({...p,siteWeb:e.target.value}))} placeholder="https://..." style={inp}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{display:'block',fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,color:'#374151',marginBottom:5}}>Niveau</label><select value={form.typeContrat} onChange={e=>setForm(p=>({...p,typeContrat:e.target.value}))} style={{...inp,appearance:'none' as any}}>{['PLATINE','OR','ARGENT','BRONZE'].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
                <div><label style={{display:'block',fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,color:'#374151',marginBottom:5}}>Couleur</label><input type="color" value={form.couleur} onChange={e=>setForm(p=>({...p,couleur:e.target.value}))} style={{...inp,height:42,padding:4,cursor:'pointer'}}/></div>
              </div>
              <button type="submit" disabled={!form.nom.trim()} style={{width:'100%',padding:'12px',background:ORANGE,color:'white',border:'none',borderRadius:8,fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:14,cursor:'pointer',boxShadow:`0 4px 16px ${ORANGE}40`}}>
                {envoi?'Ajout…':'✅ Ajouter →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
