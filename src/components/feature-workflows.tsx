'use client';

import {useState,type FormEvent} from 'react';
import {
 canSeeCompany,canTailor,createCompany,createEngagement,createRequest,issuedRequest,
 registerRisk,setCompanyStatus,tailorProgram,updateRequest,type Company,type EngagementTeam,
} from '@/lib/feature-workflows';
import {inScope,personById,PERSONS,recordRequestPart,type Engagement,type Model,type ViewId,type WorkItem} from '@/lib/workspace';
import {today,type Template} from '@/lib/workbench';

type Props={model:Model;change:(fn:(m:Model)=>void)=>void};
const text=(d:FormData,key:string)=>String(d.get(key)??'').trim();
function onSubmit(fn:(d:FormData)=>void){
 return (e:FormEvent<HTMLFormElement>)=>{e.preventDefault();fn(new FormData(e.currentTarget));};
}
const companyStatus:Record<Company['status'],string>={prospect:'Шинэ',active:'Идэвхтэй',suspended:'Түр зогсоосон',former:'Хуучин'};
const roles={preparer:'Бэлтгэгч',reviewer:'Ахлах хянагч',partner:'Партнер',quality:'Чанарын хянагч'};
const btn='btn secondary';

export function CompanyDesk({model,change,forms,go}:Props&{forms:{id:string;title:string;stage:number}[];go:(v:ViewId)=>void}){
 const companies=Object.values(model.companies??{}).filter(c=>canSeeCompany(model,c));
 const [companyId,setCompany]=useState(''),[query,setQuery]=useState('');
 const company=companies.find(c=>c.id===companyId)||companies.find(c=>c.id===model.engagements.find(e=>e.id===model.engagement)?.companyId)||companies[0];
 const role=personById(model.person).role,manage=['reviewer','partner'].includes(role);
 const past=model.engagements.filter(e=>e.companyId===company?.id&&inScope(model,model.person,e.id));
 return <section className="card pad bench-card feature-desk">
  <div className="section-heading"><h2>Үйлчлүүлэгчийн сан</h2><span className="pill">{companies.length} компани</span></div>
  {manage&&<details className="feature-detail"><summary>Шинэ компани бүртгэх</summary>
   <form className="feature-form" onSubmit={onSubmit(d=>change(m=>createCompany(m,{
    name:text(d,'name'),legalForm:text(d,'legalForm'),registration:text(d,'registration'),framework:text(d,'framework'),
    bodies:text(d,'body')?[text(d,'body')]:[],contacts:[{
     id:crypto.randomUUID(),name:text(d,'contact'),role:text(d,'position'),email:text(d,'email'),body:text(d,'body'),signer:d.has('signer'),
    }],
   },text(d,'industry'))))}>
    <div className="field-grid">
     <label>Байгууллагын нэр<input name="name" required/></label>
     <label>Хуулийн хэлбэр<select name="legalForm" required><option value="">Сонгоно уу</option>{['ХХК','ХК','ТӨХК','ТББ','Бусад'].map(x=><option key={x}>{x}</option>)}</select></label>
     <label>Бүртгэлийн дугаар<input name="registration" required/></label>
     <label>Салбар<input name="industry"/></label>
     <label>Тайлагналын стандарт<input name="framework"/></label>
     <label>Засаглах байгууллага<input name="body" placeholder="ТУЗ, Аудитын хороо…"/></label>
     <label>Холбоо барих хүний нэр<input name="contact" required/></label>
     <label>Албан тушаал<input name="position"/></label>
     <label>Имэйл<input name="email" type="email" required/></label>
     <label className="checkbox-line"><input name="signer" type="checkbox"/>Гарын үсэг зурах эрхтэй</label>
    </div><button className="btn primary">Компани хадгалах</button>
   </form>
  </details>}
  <div className="field-grid space-top">
   <label>Компани хайх<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Нэр эсвэл бүртгэлийн дугаар"/></label>
   <label>Компани сонгох<select value={company?.id??''} onChange={e=>setCompany(e.target.value)}>{companies.filter(c=>c.id===company?.id||`${c.profile.name} ${c.profile.registration}`.toLowerCase().includes(query.toLowerCase())).map(c=><option key={c.id} value={c.id}>{c.profile.name} · {companyStatus[c.status]}</option>)}</select></label>
  </div>
  {company&&<div className="feature-summary">
   <div><strong>{company.profile.name}</strong><p className="muted">{[company.profile.legalForm,company.profile.registration,company.industry].filter(Boolean).join(' · ')}</p></div>
   <div>{company.profile.contacts.map(c=><p key={c.id}>{[c.name,c.role,c.email].filter(Boolean).join(' · ')}</p>)}</div>
   {manage&&<label>Компанийн төлөв<select value={company.status} onChange={e=>{const status=e.target.value as Company['status'];change(m=>setCompanyStatus(m,company.id,status));}}>{Object.entries(companyStatus).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>}
  </div>}
  {company&&manage&&['prospect','active'].includes(company.status)&&<details className="feature-detail" key={company.id}><summary>Шинэ гэрээт ажил үүсгэх</summary>
   <form className="feature-form" onSubmit={onSubmit(d=>change(m=>createEngagement(m,company.id,{start:text(d,'start'),end:text(d,'end')},text(d,'report'),{
    preparer:text(d,'preparer'),reviewer:text(d,'reviewer'),partner:text(d,'partner'),quality:text(d,'quality')||undefined,
   },forms,text(d,'previous')||undefined)))}>
    <div className="field-grid">
     <label>Тайлант үе эхлэх<input name="start" type="date" required/></label>
     <label>Тайлант үе дуусах<input name="end" type="date" required/></label>
     <label>Тайлан гаргах зорилтот өдөр<input name="report" type="date" required/></label>
     <label>Өмнөх ажилтай холбох<select name="previous"><option value="">Холбохгүй</option>{past.map(e=><option key={e.id} value={e.id}>{model.bench?.periods[e.id]?.end??e.period} · {e.phase}</option>)}</select></label>
     {(Object.entries(roles) as [keyof EngagementTeam,string][]).map(([key,label])=><label key={key}>{label}<select name={key}>{key==='quality'&&<option value="">Шаардлагагүй</option>}{PERSONS.filter(p=>p.role===key).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>)}
    </div>
    <p className="muted">Компанийн мэдээлэл шинэ ажилд хуулбарлагдана. Өмнөх ажлын хариулт, шийдвэр, нотлох баримт шинэ үе рүү шилжихгүй.</p>
    <button className="btn primary">Гэрээт ажил үүсгэх</button>
   </form>
  </details>}
  {past.length>0&&<div className="row-actions space-top">{past.map(e=><button className={btn} key={e.id} onClick={()=>{change(m=>{m.engagement=e.id;});go('engagements');}}>{model.bench?.periods[e.id]?.end??e.period} · {e.phase}</button>)}</div>}
 </section>;
}

const requestStatus={open:'Хүлээгдэж буй',partial:'Хэсэгчлэн ирсэн',ready:'Үнэлгээ хүлээж буй',changes_requested:'Дахин баримт авах',complete:'Дууссан'};
const partStatus={missing:'Ирээгүй',received:'Үнэлэх',accepted:'Зөвшөөрсөн',rejected:'Буцаасан'};
function saveRequestMessage(name:string,message:string){
 const url=URL.createObjectURL(new Blob([message],{type:'text/plain;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=name+'.txt';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function RequestDesk({model,eng,items,change,open,show,go}:Props&{eng:Engagement;items:WorkItem[];open:(f:string)=>void;show:(e:string)=>void;go:(v:ViewId)=>void}){
 const [form,setForm]=useState(''),[filter,setFilter]=useState('all');
 const contacts=model.bench?.clients[eng.id]?.contacts.filter(c=>c.name&&c.email)??[];
 const manage=['reviewer','partner'].includes(personById(model.person).role);
 const available=items.filter(w=>manage||w.owner===model.person),paper=available.find(w=>w.form===form)??available[0];
 const active=!eng.locked&&(!eng.intake||eng.intake.active);
 const rows=model.requests.filter(r=>r.engagement===eng.id&&r.dispatch&&items.some(w=>w.form===r.form));
 const visible=rows.filter(r=>filter==='all'||filter==='draft'&&r.dispatch==='draft'||issuedRequest(r)&&r.status!=='complete'&&(filter==='open'||filter==='overdue'&&r.due<today()));
 return <section className="card pad bench-card feature-desk">
  <div className="section-heading"><div><h2>Баримтын хүсэлт</h2><p>Ноорог → гаргах → хүлээн авах → үнэлэх</p></div><span className="pill">{rows.length} хүсэлт</span></div>
  {!active&&<p className="muted">{eng.locked?'Файл түгжээтэй.':'Гэрээт ажлыг идэвхжүүлсний дараа хүсэлт үүсгэнэ.'}</p>}
  {active&&!contacts.length&&<div className="row-actions"><p>Эхлээд компанийн бүртгэлд имэйлтэй холбоо барих хүн нэмнэ үү.</p><button className={btn} onClick={()=>go('profile')}>Компанийн бүртгэл</button></div>}
  {active&&contacts.length>0&&paper&&<details className="feature-detail"><summary>Шинэ хүсэлт үүсгэх</summary>
   <form className="feature-form" onSubmit={onSubmit(d=>change(m=>createRequest(m,{
    title:text(d,'title'),form:text(d,'form'),contactId:text(d,'contact'),owner:text(d,'owner'),due:text(d,'due'),message:text(d,'message'),parts:text(d,'parts').split('\n'),
   })))}>
    <div className="field-grid">
     <label>Хүсэлтийн нэр<input name="title" required/></label>
     <label>Холбогдох ажлын баримт<select name="form" value={paper.form} onChange={e=>setForm(e.target.value)}>{available.map(w=><option key={w.id} value={w.form}>{w.form} · {w.title}</option>)}</select></label>
     <label>Хүлээн авагч<select name="contact">{contacts.map(c=><option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}</select></label>
     <label>Хариуцагч<select key={paper.id} name="owner" defaultValue={manage?paper.owner:model.person}>{PERSONS.filter(p=>p.role!=='quality'&&inScope(model,p.id,eng.id)&&(manage||p.id===model.person)).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
     <label>Хугацаа<input name="due" type="date" required/></label>
    </div>
    <label>Шаардлагатай баримт · нэг мөрөнд нэг баримт<textarea name="parts" rows={3} required/></label>
    <label>Хүлээн авагчид өгөх тайлбар<textarea name="message" rows={2}/></label>
    <button className="btn primary">Ноорог хадгалах</button>
   </form>
  </details>}
  <label className="space-top">Хүсэлтийн төлөвөөр шүүх<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Бүгд</option><option value="draft">Ноорог</option><option value="open">Нээлттэй</option><option value="overdue">Хугацаа хэтэрсэн</option></select></label>
  {!visible.length&&<p className="muted">Энэ шүүлтэд тохирох хүсэлт алга.</p>}
  {visible.map(r=>{
   const issued=issuedRequest(r),owner=active&&r.owner===model.person,canManage=active&&(owner||manage);
   const message=[r.title,`Хүлээн авагч: ${r.contact}${r.contactEmail?' <'+r.contactEmail+'>':''}`,`Хугацаа: ${r.due}`,r.message,...(r.parts??[]).map(p=>'- '+p.title)].filter(Boolean).join('\n');
   return <details className="feature-detail" key={r.id} open={rows.length===1?true:undefined}><summary>{r.title} <span className="pill">{r.dispatch==='draft'?'Ноорог':r.dispatch==='cancelled'?'Хаасан':requestStatus[r.status]}</span></summary>
    <div className="feature-form"><p>{r.id} · {r.contact} · {personById(r.owner).name} · {r.due} · {r.parts?.filter(p=>p.state==='accepted').length??0}/{r.expected} үнэлсэн</p>
     {r.issuedAt&&<p className="micro">Демо бүртгэлд гаргасан · {new Date(r.issuedAt).toLocaleString()}</p>}
     <div className="row-actions">
      <button className={btn} onClick={()=>open(r.form)}>{r.form} · Ажлын баримт</button>
      <button className={btn} onClick={()=>saveRequestMessage(r.id,message)}>Хүсэлтийн текст татах</button>
      {canManage&&r.dispatch==='draft'&&<button className="btn primary" onClick={()=>change(m=>updateRequest(m,r.id,'issue'))}>Гаргасан гэж тэмдэглэх</button>}
      {owner&&issued&&r.status!=='complete'&&<button className={btn} onClick={()=>go('evidence')}>Нотлох баримт нэмэх</button>}
     </div>
     <p className="micro">Гаргалтыг энд бүртгэнэ. Имэйл илгээх үйлдэл хийгдэхгүй.</p>
     {issued&&r.parts?.map(p=>{
      const evidence=model.evidence.filter(e=>e.engagement===eng.id&&e.status==='received'&&(!e.request||e.request===r.id)&&!r.parts?.some(part=>part.evidence===e.id));
      return <div key={p.id} className="feature-part"><b>{p.title}</b><span className="pill">{partStatus[p.state]}</span>
       {p.evidence&&<button className="quiet" onClick={()=>show(p.evidence!)}>{model.evidence.find(e=>e.id===p.evidence)?.name??p.evidence} · Эх баримт</button>}
       {p.reason&&<p>{p.reason}</p>}
       {owner&&['missing','rejected'].includes(p.state)&&evidence.length>0&&<form onSubmit={onSubmit(d=>change(m=>recordRequestPart(m,r.id,p.id,'receive',text(d,'evidence'))))}>
        <label>Хүлээн авсан баримт<select name="evidence">{evidence.map(e=><option key={e.id} value={e.id}>{e.name} · v{e.version}</option>)}</select></label><button className={btn}>Хүлээн авсан гэж бүртгэх</button>
       </form>}
       {owner&&p.state==='received'&&<><button className={btn} onClick={()=>change(m=>recordRequestPart(m,r.id,p.id,'accept'))}>Баримт зөвшөөрөх</button>
        <form onSubmit={onSubmit(d=>change(m=>recordRequestPart(m,r.id,p.id,'reject',text(d,'reason'))))}><label>Буцаах шалтгаан<input name="reason" required/></label><button className={btn}>Баримт буцаах</button></form></>}
      </div>;
     })}
     {canManage&&r.dispatch!=='cancelled'&&r.status!=='complete'&&<div className="field-grid">
      {issued&&<form onSubmit={onSubmit(d=>change(m=>updateRequest(m,r.id,'followup',text(d,'note'))))}><label>Дагаж тодруулсан тэмдэглэл<input name="note" required/></label><button className={btn}>Тэмдэглэл хадгалах</button></form>}
      <form onSubmit={onSubmit(d=>change(m=>updateRequest(m,r.id,'cancel',text(d,'reason'))))}><label>Хаах шалтгаан<input name="reason" required/></label><button className={btn}>Хүсэлтийг хаах</button></form>
     </div>}
     {r.history.length>0&&<details><summary>Хүсэлтийн түүх</summary><ul>{r.history.map((line,i)=><li key={i}>{line}</li>)}</ul></details>}
    </div>
   </details>;
  })}
 </section>;
}

export function ProgramTailor({model,w,template,change,dirty}:Props&{w:WorkItem;template:Template;dirty:boolean}){
 const [mode,setMode]=useState<'add'|'adapt'|'na'>('add'),[step,setStep]=useState('');
 if(!canTailor(model,w)||template.family!=='programme')return null;
 const procedures=template.fields.filter(f=>f.type==='procedure'),selected=procedures.find(f=>f.key===step)??procedures[0];
 const risks=model.risks.filter(r=>r.engagement===w.engagement);
 return <details className="editor-section feature-detail">
  <summary>Аудитын хөтөлбөр тохируулах</summary>
  <p className="muted">Энэ гэрээт ажлын горим, батламж, эрсдэл ба өөрчлөлтийн үндэслэлийг бүртгэнэ.</p>
  {dirty&&<p className="muted">Эхлээд ажлын нооргоо хадгална уу.</p>}
  <form className="feature-form" onSubmit={onSubmit(d=>change(m=>tailorProgram(m,w.id,template,{mode,key:selected?.key,label:text(d,'label'),reason:text(d,'reason'),risk:text(d,'risk'),assertion:text(d,'assertion')})))}>
   <fieldset disabled={dirty} className="feature-fields">
    <label>Өөрчлөлт<select value={mode} onChange={e=>setMode(e.target.value as typeof mode)}><option value="add">Горим нэмэх</option><option value="adapt">Горим өөрчлөх / сэргээх</option>{personById(model.person).role!=='preparer'&&<option value="na">Хамаарахгүй гэж тэмдэглэх</option>}</select></label>
    {mode!=='add'&&<label>Одоогийн горим<select value={selected?.key??''} onChange={e=>setStep(e.target.value)}>{procedures.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select></label>}
    {mode!=='na'&&<label>Горимын тайлбар<textarea key={mode==='add'?'new':selected?.key} name="label" defaultValue={mode==='adapt'?selected?.label:''} required/></label>}
    <div className="field-grid"><label>Эрсдэлийн холбоос<select name="risk"><option value="">Сонгоогүй</option>{risks.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></label>
    <label>Батламж<input name="assertion" placeholder="Жишээ: Бүрэн байдал"/></label></div>
    <label>Өөрчлөлтийн үндэслэл<textarea name="reason" required/></label>
    <button className="btn primary">Горимын өөрчлөлтийг хадгалах</button>
   </fieldset>
  </form>
  <details><summary>Холбох эрсдэл бүртгэх</summary>
   <form className="feature-form" onSubmit={onSubmit(d=>change(m=>registerRisk(m,w,text(d,'title'),text(d,'assertion'),text(d,'response'),text(d,'significance'))))}>
    <div className="field-grid"><label>Эрсдэлийн нэр<input name="title" required/></label><label>Батламж<input name="assertion" required/></label>
    <label>Ач холбогдол<select name="significance"><option>Ердийн</option><option>Өндөр</option><option>Чухал</option></select></label><label>Хариу арга хэмжээ<input name="response" required/></label></div>
    <button className={btn}>Эрсдэл хадгалах</button>
   </form>
  </details>
 </details>;
}
