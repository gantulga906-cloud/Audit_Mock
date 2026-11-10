'use client';

import {useState,type ReactNode} from 'react';
import {currentClientContact,type ClientContact,type Enquiry,type IntakeClient,type IntakeContext,type IntakeTerms,type Relationship} from '@/lib/pilot-intake';
import {pilotScope,type PilotRole} from '@/lib/pilot-registers';
import type {Evidence} from '@/lib/workspace';
import type {PilotAction} from './pilot-registers';

const status={draft:'Ноорог',forwarded:'Хүлээн авахаар шилжүүлсэн',returned:'Засварт буцаасан',declined:'Татгалзсан',converted:'Хүлээн авах ажил үүсгэсэн'};
const relationship:Record<Relationship,string>={prospect:'Боломжит',pending:'Хүлээн авах шатанд',active:'Идэвхтэй',suspended:'Түдгэлзүүлсэн',former:'Хуучин',rejected:'Татгалзсан'};
const roles={preparer:'Бэлтгэгч',reviewer:'Ахлах хянагч',partner:'Партнер'};
type Intake={clients:IntakeClient[];enquiries:Enquiry[]};

function Command({run,action,label,extra,children,done}:{
 run:PilotAction;action:string;label:string;extra?:Record<string,string>;children:ReactNode;done?:()=>void;
}){
 return <form className="feature-form" onSubmit={e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const data=Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,String(v)]));
  void run(action,{...data,...extra}).then(ok=>{if(ok){form.reset();done?.();}});
 }}>
  {children}<button className="btn secondary">{label}</button>
 </form>;
}

function ClientEditor({client,run,done}:{client?:IntakeClient;run:PilotAction;done:()=>void}){
 const profile=client?.profile;
 return <Command run={run} action="client-save" label="Үйлчлүүлэгчийн мэдээлэл хадгалах" extra={{id:client?.id??''}} done={done}>
  <div className="field-grid">
   <label>Байгууллагын нэр<input name="name" defaultValue={profile?.name} required/></label>
   <label>Хуулийн хэлбэр<input name="legalForm" defaultValue={profile?.legalForm} required/></label>
   <label>Бүртгэлийн дугаар<input name="registration" defaultValue={profile?.registration} required/></label>
   <label>Тайлагналын хүрээ<input name="framework" defaultValue={profile?.framework}/></label>
   <label>Салбар<input name="industry" defaultValue={profile?.industry}/></label>
  </div>
  <label>Засаглалын байгууллага · мөр тус бүрд нэг нэр<textarea name="bodies" defaultValue={profile?.bodies.join('\n')}/></label>
  <label>Эх сурвалж буюу өөрчлөлтийн үндэслэл<input name="note" required/></label>
 </Command>;
}

function ContactEditor({client,contact,run,done}:{client:IntakeClient;contact?:ClientContact;run:PilotAction;done:()=>void}){
 return <Command run={run} action="client-contact" label="Холбоо барих хүн хадгалах" extra={{id:client.id,contactId:contact?.id??''}} done={done}>
  <div className="field-grid">
   <label>Нэр<input name="name" defaultValue={contact?.name} required/></label>
   <label>Үүрэг, албан тушаал<input name="capacity" defaultValue={contact?.role} required/></label>
   <label>Имэйл<input type="email" name="email" defaultValue={contact?.email}/></label>
   <label>Харьяалах байгууллага<select name="body" defaultValue={contact?.body??''}><option value="">Сонгоогүй</option>
    {client.profile.bodies.map(b=><option key={b} value={b}>{b}</option>)}</select></label>
   <label>Эх сурвалж<input name="source" defaultValue={contact?.source} required/></label>
   <label>Хүчинтэй эхлэх огноо<input type="date" name="effective" defaultValue={contact?.effective} required/></label>
  </div>
  <label className="checkbox-line"><input type="checkbox" name="signer" value="yes" defaultChecked={contact?.signer}/>Гарын үсэг зурах эрхтэй</label>
  <label>Бүртгэлийн тайлбар<input name="note" required/></label>
 </Command>;
}

function ClientCard({client,role,run,open}:{client:IntakeClient;role:PilotRole;run:PilotAction;open:(id:string)=>void}){
 const [edit,setEdit]=useState(false),[editingContact,setContact]=useState<string|null>(null);
 const profile=client.profile,canEdit=role!=='preparer';
 return <details className="feature-detail">
  <summary>{profile.name} · {profile.registration} · {relationship[client.status]}</summary>
  <p>{profile.legalForm} · {profile.framework||'Тайлагналын хүрээ тодорхойгүй'} · {profile.industry||'Салбар тодорхойгүй'} · v{client.version}</p>
  {profile.bodies.length>0&&<p>Засаглал · {profile.bodies.join(' · ')}</p>}
  {canEdit&&<button type="button" className="quiet" onClick={()=>setEdit(!edit)}>Үндсэн бүртгэл засах</button>}
  {edit&&<ClientEditor key={client.version} client={client} run={run} done={()=>setEdit(false)}/>}
  {role==='partner'&&<details><summary>Харилцааны төлөв шинэчлэх</summary>
   <Command run={run} action="client-status" label="Төлөв хадгалах" extra={{id:client.id}}>
    <label>Төлөв<select name="status" defaultValue={client.status}>{Object.entries(relationship).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
    <label>Үндэслэл<input name="note" required/></label>
   </Command>
  </details>}
  <h3>Холбоо барих хүмүүс</h3>
  {profile.contacts.map(c=><div className="bench-item" key={c.id}>
   <b>{c.name}</b><p>{c.role} · {c.email||'Имэйлгүй'}{c.signer?' · Гарын үсэг зурах эрхтэй':''}</p>
   <p className="micro">{c.body} · {c.source} · {c.effective||'Огноо бүртгэгдээгүй'}{c.ended?' — '+c.ended:''}</p>
   {canEdit&&!c.ended&&<details><summary>Холбоо шинэчлэх</summary>
    <button type="button" className="quiet" onClick={()=>setContact(editingContact===c.id?null:c.id)}>Мэдээлэл засах</button>
    {editingContact===c.id&&<ContactEditor key={client.version} client={client} contact={c} run={run} done={()=>setContact(null)}/>}
    <Command run={run} action="client-contact" label="Холбоог хаах" extra={{id:client.id,contactId:c.id,mode:'retire'}}>
     <label>Дуусах огноо<input name="effective" type="date" required/></label><label>Шалтгаан<input name="note" required/></label>
    </Command>
   </details>}
  </div>)}
  {canEdit&&<details><summary>Холбоо барих хүн нэмэх</summary><ContactEditor client={client} run={run} done={()=>setContact(null)}/></details>}
  <h3>Тайлант үеийн түүх</h3>
  {client.periods.map(p=><button key={p.id} type="button" className="quiet" onClick={()=>open(p.id)}>
   {p.start} — {p.end} · {p.active?'Идэвхтэй':'Хүлээн авах шатанд'} · {roles[p.partner]}
  </button>)}
  <details><summary>Бүртгэлийн өөрчлөлтийн түүх</summary>{client.history.map((h,i)=><div className="bench-item" key={i}>
   <p className="micro">v{h.version} · {roles[h.by]} · {h.at.slice(0,10)} · {h.note}</p>
   {h.previousStatus&&<p>Өмнөх төлөв · {relationship[h.previousStatus]}</p>}
   {h.before&&<details><summary>Өмнөх нэр ба холбоо</summary><p>{h.before.name} · {h.before.framework}</p>
    {h.before.contacts.map(c=><p key={c.id}>{c.name} · {c.email} · {c.role} · {c.source} · {c.effective}</p>)}
   </details>}
  </div>)}</details>
 </details>;
}

function EnquiryEditor({row,clients,run,done}:{row?:Enquiry;clients:IntakeClient[];run:PilotAction;done:()=>void}){
 const [client,setClient]=useState(row?.clientId??''),[company,setCompany]=useState(row?.company??'');
 return <Command run={run} action="intake-save" label="Хүсэлтийг нооргоор хадгалах" extra={{id:row?.id??''}} done={done}>
  <div className="field-grid">
   <label>Эх үүсвэр<select name="origin" defaultValue={row?.origin??'client'}><option value="client">Үйлчлүүлэгч хандсан</option><option value="firm">Фирм санаачилсан</option></select></label>
   <label>Бүртгэлтэй үйлчлүүлэгч<select name="clientId" value={client} onChange={e=>{
    setClient(e.target.value);const name=clients.find(c=>c.id===e.target.value)?.profile.name;if(name)setCompany(name);
   }}><option value="">Тодорхойгүй эсвэл шинэ</option>{clients.map(c=><option key={c.id} value={c.id}>{c.profile.name}</option>)}</select></label>
   <label>Байгууллага<input name="company" value={company} onChange={e=>setCompany(e.target.value)} required/></label>
   <label>Хүссэн үйлчилгээ<input name="service" defaultValue={row?.service??'Санхүүгийн тайлангийн аудит'} required/></label>
   <label>Холбоо барих хүн<input name="contact" defaultValue={row?.contact}/></label>
   <label>Имэйл<input name="email" type="email" defaultValue={row?.email}/></label>
   <label>Тайлант үе эхлэх<input name="start" type="date" defaultValue={row?.start}/></label>
   <label>Тайлант үе дуусах<input name="end" type="date" defaultValue={row?.end}/></label>
   <label>Тайлагналын хүрээ<input name="framework" defaultValue={row?.framework}/></label>
  </div>
  <label>Одоогоор мэдэгдэж буй мэдээлэл, дараагийн ажил<textarea name="facts" defaultValue={row?.facts}/></label>
 </Command>;
}

function Convert({row,clients,run}:{row:Enquiry;clients:IntakeClient[];run:PilotAction}){
 const [id,setId]=useState(row.clientId??'');
 const client=clients.find(c=>c.id===id);
 const today=new Date().toISOString().slice(0,10);
 return <Command run={run} action="intake-convert" label="Хүлээн авах шатны ажил үүсгэх" extra={{id:row.id}}>
  <label>Одоогийн үйлчлүүлэгчийн бүртгэл<select name="clientId" required value={id} onChange={e=>setId(e.target.value)}>
   <option value="">Сонгох</option>{clients.map(c=><option key={c.id} value={c.id}>{c.profile.name} · {c.profile.registration}</option>)}
  </select></label>
  {client&&<p>Баталгаажуулах мэдээлэл · v{client.version} · {client.profile.legalForm} · {client.profile.framework||'Тайлагналын хүрээ дутуу'}</p>}
  <label>Одоогийн холбоо барих хүн<select key={id} name="contactId" required><option value="">Сонгох</option>
   {client?.profile.contacts.filter(c=>c.email&&currentClientContact(c,today)).map(c=><option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}
  </select></label>
  <label>Эх мэдээлэл авсан өмнөх үе<select name="prior" key={id}><option value="">Өмнөх үе холбохгүй</option>
   {client?.periods.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.start} — {p.end}</option>)}
  </select></label>
  <div className="field-grid">
   <label>Тайлант үе эхлэх<input name="start" type="date" defaultValue={row.start} required/></label>
   <label>Тайлант үе дуусах<input name="end" type="date" defaultValue={row.end} required/></label>
   <label>Зорилтот тайлангийн өдөр<input name="reportDate" type="date" required/></label>
  </div>
  <label>Одоогийн үед баталгаажуулсан мэдээллийн үндэслэл<textarea name="note" required/></label>
  <label className="checkbox-line"><input type="checkbox" name="synthetic" value="yes"/>Зохиомол өгөгдөлтэй туршилт</label>
 </Command>;
}

function EnquiryCard({row,role,clients,run,open}:{row:Enquiry;role:PilotRole;clients:IntakeClient[];run:PilotAction;open:(id:string)=>void}){
 const [edit,setEdit]=useState(false);
 const canEdit=row.owner===role&&['draft','returned'].includes(row.status);
 return <details className="feature-detail">
  <summary>{row.company} · {status[row.status]} · {row.id.slice(0,8)}</summary>
  <p>{row.origin==='client'?'Үйлчлүүлэгч хандсан':'Фирм санаачилсан'} · {row.service} · {row.contact||'Холбоо тодорхойгүй'} {row.email}</p>
  <p>{row.start||'Эхлэх өдөр тодорхойгүй'} — {row.end||'Дуусах өдөр тодорхойгүй'} · {row.framework||'Тайлагналын хүрээ тодорхойгүй'}</p>
  <p className="micro">Эзэмшигч · {roles[row.owner]} · Дараагийн хариуцагч · {row.status==='forwarded'?roles.reviewer:roles[row.owner]}</p>
  {row.facts&&<p>{row.facts}</p>}
  {canEdit&&<>
   <button type="button" className="quiet" onClick={()=>setEdit(!edit)}>Ноорог засах</button>
   {edit&&<EnquiryEditor row={row} clients={clients} run={run} done={()=>setEdit(false)}/>}
   <Command run={run} action="intake-forward" label="Хүлээн авахаар шилжүүлэх" extra={{id:row.id}}>
    <label>Дараагийн ажлын тайлбар<input name="note" required/></label>
   </Command>
  </>}
  {role!=='preparer'&&row.status==='forwarded'&&<>
   <details><summary>Гэрээт ажил үүсгэх</summary><Convert row={row} clients={clients} run={run}/></details>
   <details><summary>Засварт буцаах эсвэл татгалзах</summary>
    <Command run={run} action="intake-return" label="Засварт буцаах" extra={{id:row.id}}>
     <label>Тодруулах зүйл<input name="item" required/></label><label>Шалтгаан<input name="note" required/></label>
    </Command>
    <Command run={run} action="intake-decline" label="Хүсэлтээс татгалзах" extra={{id:row.id}}>
     <label>Татгалзах үндэслэл<input name="note" required/></label>
    </Command>
   </details>
  </>}
  {row.engagement&&<button type="button" className="quiet" onClick={()=>open(row.engagement!)}>Хүлээн авах ажил нээх</button>}
  <details><summary>Хүсэлтийн түүх</summary>{row.history.map((h,i)=><p className="micro" key={i}>
   {roles[h.by]} · {h.at.slice(0,10)} · {status[h.status]} · {h.item&&h.item+' · '}{h.note}
  </p>)}</details>
 </details>;
}

export function PilotIntake({data,role,run,open}:{data:Intake;role:PilotRole;run:PilotAction;open:(id:string)=>void}){
 const [query,setQuery]=useState(''),[tab,setTab]=useState<'enquiries'|'clients'>('enquiries'),[add,setAdd]=useState(false);
 const matches=(...values:string[])=>values.join(' ').toLowerCase().includes(query.trim().toLowerCase());
 return <section className="card pad bench-card">
  <h2>Үйлчлүүлэгч ба аудитын хүсэлт</h2>
  <p>Хүсэлтийн ноорог фирмийн бүртгэлд хадгалагдана. Хүлээн авах шийдвэр гэрээт ажлын хэсэгт бүртгэгдэнэ.</p>
  <nav className="tabs" aria-label="Хүлээн авах хэсэг">
   <button type="button" className={tab==='enquiries'?'active':''} onClick={()=>{setTab('enquiries');setAdd(false);}}>Хүсэлт</button>
   <button type="button" className={tab==='clients'?'active':''} onClick={()=>{setTab('clients');setAdd(false);}}>Үйлчлүүлэгч</button>
  </nav>
  <label>Хайх<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Нэр, дугаар, холбоо барих хүн"/></label>
  {tab==='enquiries'?<>
   <button type="button" className="btn secondary" onClick={()=>setAdd(!add)}>Шинэ хүсэлт</button>
   {add&&<EnquiryEditor clients={data.clients} run={run} done={()=>setAdd(false)}/>}
   {data.enquiries.filter(e=>matches(e.company,e.id,e.contact)).map(e=><EnquiryCard key={e.id} row={e} role={role} clients={data.clients} run={run} open={open}/>)}
  </>:<>
   {role!=='preparer'&&<button type="button" className="btn secondary" onClick={()=>setAdd(!add)}>Үйлчлүүлэгч нэмэх</button>}
   {add&&role!=='preparer'&&<ClientEditor run={run} done={()=>setAdd(false)}/>}
   {data.clients.filter(c=>matches(c.profile.name,c.profile.registration,...c.profile.contacts.map(contact=>contact.name)))
    .map(c=><ClientCard key={c.id} client={c} role={role} run={run} open={open}/>)}
  </>}
 </section>;
}

export function IntakeProvenance({context,active,role,priorVisible,run,open}:{
 context:IntakeContext;active:boolean;role:PilotRole;priorVisible:boolean;run:PilotAction;open:(id:string)=>void;
}){
 return <details className="feature-detail">
  <summary>Баталгаажуулсан үйлчлүүлэгчийн мэдээлэл · v{context.version}</summary>
  <p>{context.note} · {roles[context.by]} · {context.at.slice(0,10)} · Хүсэлт {context.enquiry.slice(0,8)}</p>
  {context.prior&&priorVisible&&<button type="button" className="quiet" onClick={()=>open(context.prior!)}>Өмнөх тайлант үеийг нээх</button>}
  {context.history.length>0&&<details><summary>Өмнөх баталгаажуулалт</summary>{context.history.map(h=><p className="micro" key={h.confirmation}>
   v{h.version} · {roles[h.by]} · {h.at.slice(0,10)} · {h.note}
  </p>)}</details>}
  {!active&&context.currentVersion!==context.version&&<p className="text-amber">Одоогийн бүртгэл v{context.currentVersion} · дахин нягтална уу.</p>}
  {!active&&role!=='preparer'&&<Command run={run} action="intake-refresh" label="Одоогийн мэдээллийг баталгаажуулах">
   <label>Хүчинтэй холбоо барих хүн<select name="contactId" defaultValue={context.contact} required>
    <option value="">Сонгох</option>{context.contacts.map(c=><option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}</select></label>
   <label>Баталгаажуулсан үндэслэл<input name="note" required/></label>
  </Command>}
 </details>;
}

export function TermsEditor({id,terms,history,role,evidence,active,amendable,canDraft,run}:{
 id:string;terms?:IntakeTerms;history:IntakeTerms[];role:PilotRole;evidence:(Evidence&{current?:boolean})[];
 active:boolean;amendable?:boolean;canDraft?:boolean;run:PilotAction;
}){
 const prior=terms?.status==='approved'?terms:history.find(row=>row.status==='approved');
 const amendment=terms?.amendment;
 const awaitingAmendment=!!amendment&&terms?.status==='draft';
 const accepted=evidence.filter(e=>e.status==='accepted'&&e.current!==false&&(!active||e.id!==prior?.evidence));
 return <details className="feature-detail" open={awaitingAmendment||undefined}>
  <summary>1.4.3 · Гарын үсэгтэй захидал {terms&&' · v'+terms.version}</summary>
  <p className="muted">Үнэлгээний эх баримт хэсэгт захидлыг хавсаргаж, тусдаа хянагчаар зөвшөөрүүлнэ.</p>
  {awaitingAmendment&&<p className="callout amber">Шинэ хамрах хүрээг партнер дахин батлах хүртэл ажлын гүйцэтгэл түр зогсоно.</p>}
  {terms&&<>
   <p>{terms.reference} · {terms.signatory} · {terms.signedOn} · {terms.status==='approved'?'Партнер баталсан':'Ноорог'}</p>
   <p>{terms.start} — {terms.end} · {terms.scope}</p>
   {amendment&&<p>Өмнөх баталсан v{amendment.priorVersion} · {amendment.reason}{amendment.scopeAssessment&&' · '+amendment.scopeAssessment}</p>}
   {terms.approvedBy&&<p className="micro">{roles[terms.approvedBy]} · {terms.approvedAt?.slice(0,10)} · {terms.approvalBasis}</p>}
   <p className="micro">Үйлчлүүлэгчийн мэдээлэл v{terms.clientVersion} · SHA-256 {terms.sha256}</p>
   <a className="quiet" href={'/api/pilot/evidence/'+terms.evidence+pilotScope(id)}>Баталгаажуулсан эх файл татах</a>
  </>}
  {(!active?role==='reviewer':amendable&&prior&&canDraft)&&<Command key={terms?.version} run={run} action="intake-terms-save"
   label={active?'Өөрчилсөн захидлыг дахин батлуулахаар хадгалах':'Захидлын хувилбар хадгалах'}>
   <div className="field-grid">
    <label>{active?'Шинэ гарын үсэгтэй, үнэлсэн эх файл':'Үнэлсэн эх файл'}<select name="evidence"
     defaultValue={active&&!awaitingAmendment?'':terms?.evidence??''} required><option value="">Сонгох</option>
     {accepted.map(e=><option key={e.id} value={e.id}>{e.name} · v{e.version}</option>)}</select></label>
    <label>Захидлын ишлэл<input name="reference" defaultValue={terms?.reference} required/></label>
    <label>Үйлчлүүлэгчийн гарын үсэг зурсан хүн<input name="signatory" defaultValue={terms?.signatory} required/></label>
    <label>Гарын үсгийн огноо<input name="signedOn" type="date" defaultValue={terms?.signedOn} required/></label>
   </div>
   <label>Тохиролцсон хамрах хүрээ<textarea name="scope" defaultValue={terms?.scope} required/></label>
   {active&&<label>Нөхцөл өөрчилсөн шалтгаан<textarea name="amendmentReason" defaultValue={awaitingAmendment?amendment?.reason:''} required/></label>}
  </Command>}
  {(!active||amendable&&awaitingAmendment)&&role==='partner'&&terms?.status==='draft'&&<Command run={run} action="intake-terms-approve"
   label={active?'Яг энэ хувилбар, шинэ хамрах хүрээг дахин батлах':'Яг энэ захидлыг батлах'} extra={{version:String(terms.version)}}>
   {active&&<label>Өөрчлөгдсөн хамрах хүрээ, хүлээн авах нөхцөлийн дахин үнэлгээ<textarea name="scopeAssessment" required/></label>}
   <label>Баталсан үндэслэл<input name="reason" required/></label>
  </Command>}
  {history.length>0&&<details><summary>Өмнөх хувилбарууд</summary>{history.map(h=><p className="micro" key={h.version}>
   v{h.version} · {h.reference} · {h.status} · {h.sha256}{' · '}
   <a className="quiet" href={'/api/pilot/evidence/'+h.evidence+pilotScope(id)}>Өмнөх эх файл</a>
  </p>)}</details>}
 </details>;
}
