'use client';

import {useEffect,useRef,useState,type FormEvent,type ReactNode} from 'react';
import PilotRegisters,{type RegisterResources} from './pilot-registers';
import {DeliveryTimeline,PlanningCalendar} from './delivery-planning';
import type {DecisionRecord,Evidence,Model,RequestItem,Statements,WorkItem} from '@/lib/workspace';
import type {Period} from '@/lib/workbench';

const api='/api/pilot';
const roles={preparer:'Бэлтгэгч',reviewer:'Ахлах хянагч',partner:'Партнер'};
const names:Record<string,string>={nomin:roles.preparer,temuulen:roles.reviewer,bat:roles.partner};
const status:Record<WorkItem['status'],string>={not_started:'Эхлээгүй',in_progress:'Бэлтгэж буй',waiting:'Хүлээгдэж буй',submitted:'Хяналтад ирсэн',returned:'Засварт буцаасан',reviewed:'Хянагдсан',changed:'Дахин хянуулах'};
const partStatus={missing:'Ирээгүй',received:'Үнэлэх',accepted:'Зөвшөөрсөн',rejected:'Буцаасан'};
type Paper=WorkItem&{editable:boolean;reviewable:boolean};
type View=RegisterResources&{
 role:keyof typeof roles;revision:number;
 engagement:null|{client:string;period:Period;active:boolean;reportDate:string;statements?:Statements;decisions:DecisionRecord[];acceptanceGaps:string[];firm:{id:string;kind:string;version:number;values:Record<string,string>}[]};
 papers?:Paper[];requests?:RequestItem[];evidence?:(Evidence&{sha256:string})[];gaps?:string[];
 fieldwork?:string[];statementLines?:Record<string,number>;impacts?:Model['impacts'];
 delivery?:Pick<Model,'person'|'tasks'|'events'>&{id:string};
 activity?:Model['activity'];authorized?:{current:boolean;at:string;report:number;fs:number;count:number;artifactSha256?:string};
};
type Action=(action:string,fields?:Record<string,string>)=>Promise<boolean>;
type Result=View|{setup:boolean};
type PilotFile=Evidence&{sha256:string;uploadedBy?:View['role']};

async function request(path='',body?:unknown):Promise<Result>{
 const response=await fetch(api+path,body===undefined?{cache:'no-store'}:{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
 });
 if(response.status===404&&!path)throw Error('Туршилтын сервер ажиллахгүй байна. npm run pilot командаар эхлүүлнэ үү.');
 const result=await response.json();
 if(!response.ok)throw Error(result.error||'Хүсэлтийг гүйцэтгэж чадсангүй.');
 return result;
}

function fields(form:HTMLFormElement){return Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,String(v)]));}

function readEvidence(file:FormDataEntryValue|null){
 return new Promise<{name:string;base64:string}>((resolve,reject)=>{
  if(!(file instanceof File)||file.size<1||file.size>5_000_000){reject(Error('5 MB хүртэл хэмжээтэй файл сонгоно уу.'));return;}
  const reader=new FileReader();
  reader.onerror=()=>reject(Error('Файлыг уншиж чадсангүй.'));
  reader.onload=()=>resolve({name:file.name,base64:String(reader.result).split(',')[1]});
  reader.readAsDataURL(file);
 });
}

function ActionForm({run,action,extra,button,children}:{
 run:Action;action:string;extra?:Record<string,string>;button:string;children:ReactNode;
}){
 return <form className="feature-form" onSubmit={e=>{e.preventDefault();void run(action,{...fields(e.currentTarget),...extra});}}>
  {children}<button className="btn primary">{button}</button>
 </form>;
}

function Access({setup,send}:{setup:boolean;send:(path:string,data:unknown)=>Promise<boolean>}){
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const form=e.currentTarget;
  void send(setup?'/setup':'/login',fields(form)).then(ok=>{if(ok)form.reset();});
 }
 return <section className="card pad bench-card">
  <h2>{setup?'Анхны тохиргоо':'Туршилтын эрхээр нэвтрэх'}</h2>
  {setup&&<p className="muted">Серверийн терминалд гарсан нэг удаагийн кодыг ашиглана. Дүр бүр тусдаа нууц үгтэй.</p>}
  <form className="feature-form" onSubmit={submit}>
   {setup?<><label>Эхлүүлэх код<input name="code" type="password" required/></label>
    <div className="field-grid">{Object.entries(roles).map(([id,label])=><label key={id}>{label}ийн нууц үг<input name={id} type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label>)}</div>
   </>:<><label>Дүр<select name="role">{Object.entries(roles).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
    <label>Нууц үг<input name="password" type="password" autoComplete="current-password" required/></label></>}
   <button className="btn primary">{setup?'Нэвтрэх эрх үүсгэх':'Нэвтрэх'}</button>
  </form>
 </section>;
}

function SetupEngagement({run}:{run:Action}){
 return <section className="card pad bench-card">
  <h2>Шинэ гэрээт ажил</h2>
  <ActionForm run={run} action="create" button="Гэрээт ажил бүртгэх"><div className="field-grid">
   <label>Байгууллагын нэр<input name="client" required/></label>
   <label>Хуулийн хэлбэр<input name="legalForm" required/></label>
   <label>Бүртгэлийн дугаар<input name="registration" required/></label>
   <label>Тайлагналын стандарт<input name="framework" required/></label>
   <label>Холбоо барих хүн<input name="contact" required/></label>
   <label>Холбоо барих имэйл<input name="email" type="email" required/></label>
   <label>Тайлант үе эхлэх<input name="start" type="date" required/></label>
   <label>Тайлант үе дуусах<input name="end" type="date" required/></label>
   <label>Зорилтот тайлангийн өдөр<input name="reportDate" type="date" required/></label>
  </div>
   <label className="checkbox-line"><input type="checkbox" name="extended" value="yes" defaultChecked/>Нэгдсэн бүртгэл, үнэлгээ, батлах шаардлагыг идэвхжүүлэх</label>
   <label className="checkbox-line"><input type="checkbox" name="synthetic" value="yes"/>Зохиомол өгөгдөлтэй архивын туршилт</label>
  </ActionForm>
 </section>;
}

function Requests({view,run,onError}:{view:View;run:Action;onError:(error:string)=>void}){
 function upload(e:FormEvent<HTMLFormElement>,id:string){
  e.preventDefault();
  const form=e.currentTarget,data=new FormData(form),file=data.get('file');
  void readEvidence(file).then(fileData=>run('upload',{request:id,source:String(data.get('source')),...fileData})).then(ok=>{if(ok)form.reset();}).catch(e=>onError(e.message));
 }
 return <section className="card pad bench-card feature-desk">
  <h2>Хөтөлбөрийн баримтын хүсэлт</h2>
  <p className="muted">Хүсэлтийг бүртгэж, авсан эх файлыг хавсаргана. Холбоо барих сувгаар хүргэх ажиллагааг баг хариуцна.</p>
  {!!view.fieldwork?.length&&<ActionForm run={run} action="request" button="Хүсэлт бүртгэх"><div className="field-grid">
   <label>Хэрэгжүүлсэн хөтөлбөр<select name="form">{view.fieldwork.map(f=><option key={f} value={f}>{f} · {view.forms.find(p=>p.id===f)?.title}</option>)}</select></label>
   <label>Шаардлагатай баримт<input name="title" required/></label><label>Хугацаа<input name="due" type="date" required/></label>
  </div></ActionForm>}
  {view.requests?.map(r=>{
   const part=r.parts?.[0];
   if(!part)return null;
   return <details key={r.id} open className="feature-detail">
    <summary>{r.title} <span className="pill">{partStatus[part.state]}</span></summary>
    <p>{r.form} · {r.contact} · {r.due} · {r.id}</p>
    {part.reason&&<p>{part.reason}</p>}
    {view.evidence?.filter(e=>e.request===r.id).map(file=><div className="bench-item" key={file.id}>
     <a className="btn secondary" href={api+'/evidence/'+file.id}>{file.name} · v{file.version} татах</a>
     <p className="micro">{file.source} · {file.assessment??partStatus[file.status]}</p>
     <small style={{overflowWrap:'anywhere'}}>SHA-256 {file.sha256}</small>
    </div>)}
    {view.role==='preparer'&&['missing','rejected'].includes(part.state)&&<form className="feature-form" onSubmit={e=>upload(e,r.id)}>
     <label>Эх файл<input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv" required/></label>
     <label>Файл нийлүүлсэн эх сурвалж<input name="source" required/></label><button className="btn primary">Эх файл бүртгэх</button>
    </form>}
    {view.role==='preparer'&&part.state==='received'&&<>
     <button type="button" className="btn secondary space-top" onClick={()=>void run('accept',{request:r.id})}>Баримт зөвшөөрөх</button>
     <ActionForm run={run} action="reject" extra={{request:r.id}} button="Баримт буцаах"><label>Буцаах шалтгаан<input name="reason" required/></label></ActionForm>
    </>}
   </details>;
  })}
 </section>;
}

function SupportingEvidence({view,run,onError}:{view:View;run:Action;onError:(message:string)=>void}){
 const evidence=(view.evidence??[]) as PilotFile[];
 function upload(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const form=e.currentTarget,data=new FormData(form);
  void readEvidence(data.get('file')).then(file=>run('support-upload',{source:String(data.get('source')),...file})).then(ok=>{if(ok)form.reset();}).catch(e=>onError(e.message));
 }
 return <details className="card pad bench-card">
  <summary>Үнэлгээний эх баримт · хүсэлтээс тусдаа</summary>
  <form className="feature-form" onSubmit={upload}>
   <label>Үнэлгээний файл<input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv" required/></label>
   <label>Файлын эх сурвалж<input name="source" required/></label><button className="btn secondary">Үнэлгээний эх файл нэмэх</button>
  </form>
  {evidence.filter(e=>!e.request).map(e=><div className="bench-item" key={e.id}>
   <a href={api+'/evidence/'+e.id}>{e.name} · v{e.version}</a>
   <p>{e.source} · {partStatus[e.status]} · {e.assessment}</p>
   {view.role!=='preparer'&&e.uploadedBy!==view.role&&e.status==='received'&&<ActionForm action="support-assess" extra={{id:e.id}} run={run} button="Эх файлыг үнэлэх">
    <label>Үнэлгээ<select name="result"><option value="accepted">Зөвшөөрөх</option><option value="rejected">Буцаах</option></select></label>
    <label>Үнэлгээний үндэслэл<input name="reason" required/></label>
   </ActionForm>}
  </div>)}
 </details>;
}

function Delivery({view,run}:{view:View;run:Action}){
 if(!view.delivery||!view.engagement)return null;
 const delivery=view.delivery,papers=view.papers??[],reportDate=view.engagement.reportDate;
 const canSchedule=view.role!=='preparer',today=new Date().toISOString().slice(0,10);
 const open=(id:string)=>{
  const target=document.getElementById(id);
  target?.focus({preventScroll:true});
  target?.scrollIntoView({block:'start'});
 };
 const openPaper=(id:string)=>open('pilot-paper-'+id);
 const firstScheduled=papers.flatMap(p=>p.start?[p.start]:[]).sort()[0];
 const calendarDay=firstScheduled??today;
 const tasks=[...delivery.tasks].sort((a,b)=>Number(a.done)-Number(b.done)||a.due.localeCompare(b.due));
 return <section className="card pad bench-card">
  <h2>Хамтарсан төлөвлөгөө</h2>
  <div id="pilot-tasks" tabIndex={-1} className="space-top">
   <h3>{canSchedule?'Багийн даалгавар':'Миний даалгавар'}</h3>
   {tasks.length===0&&<p className="muted">Даалгавар бүртгэгдээгүй.</p>}
   {tasks.map(t=><div className="bench-item" key={t.id}>
    <label><input type="checkbox" checked={t.done} disabled={t.owner!==delivery.person} onChange={e=>void run('task-status',{id:t.id,done:e.target.checked?'yes':'no'})}/> {t.title}</label>
    <p className="micro">{names[t.owner]} · {t.due}{t.done?' · Дууссан':''}</p>
    {t.form&&papers.some(p=>p.form===t.form)&&<button type="button" className="quiet" onClick={()=>openPaper(papers.find(p=>p.form===t.form)!.id)}>{t.form} · Ажлын баримт</button>}
   </div>)}
   <details className="feature-detail"><summary>Даалгавар нэмэх</summary>
    <ActionForm action="task-add" run={run} button="Даалгавар хадгалах">
     <label>Гарчиг<input name="title" maxLength={200} required/></label>
     <label>Дуусах өдөр<input name="due" type="date" required/></label>
     {canSchedule&&<label>Хариуцагч<select name="owner" defaultValue={view.role}>{Object.entries(roles).map(([key,name])=><option value={key} key={key}>{name}</option>)}</select></label>}
     <label>Ажлын баримт<select name="form"><option value="">Сонголтоор</option>{papers.map(p=><option value={p.form} key={p.id}>{p.form} · {p.title}</option>)}</select></label>
    </ActionForm>
   </details>
  </div>
  <details className="feature-detail"><summary>Ажлын хуанли</summary>
   <PlanningCalendar model={delivery} eng={{id:delivery.id,reportDate}} items={papers} select={openPaper}
    tasksView={()=>open('pilot-tasks')} initialDay={calendarDay} today={today} teamCalendar={canSchedule}/>
  </details>
  {canSchedule&&<details className="feature-detail"><summary>Ажлын явц · Гантт</summary>
   <DeliveryTimeline items={papers} select={openPaper} baseline milestone={reportDate} initialStart={calendarDay.slice(0,7)+'-01'} today={today}/>
  </details>}
 </section>;
}

function Workpaper({paper,run,role,evidence,sealed}:{paper:Paper;run:Action;role:View['role'];evidence:View['evidence'];sealed:boolean}){
 const form=paper.form,reference={form};
 return <section id={'pilot-paper-'+paper.id} tabIndex={-1} className="card pad bench-card feature-desk">
  <div className="section-heading"><h2>{form} · {paper.title}</h2><span className="pill">v{paper.version} · {status[paper.status]}</span></div>
  <p className="micro">{names[paper.owner]} → {names[paper.reviewer]} · {paper.evidence.length} холбоотой баримт</p>
  {paper.due&&<p className="micro">Төлөвлөсөн хугацаа {paper.start} — {paper.due} · Суурь {paper.baselineDue}</p>}
  {!sealed&&role!=='preparer'&&<details className="feature-detail"><summary>Ажлын хугацаа тохируулах</summary>
   <ActionForm key={paper.start+'/'+paper.due} action="schedule" extra={reference} run={run} button="Хугацаа хадгалах">
    <label>Эхлэх өдөр<input name="start" type="date" defaultValue={paper.start} required/></label>
    <label>Дуусах өдөр<input name="due" type="date" defaultValue={paper.due} required/></label>
   </ActionForm>
  </details>}
  {evidence?.filter(file=>paper.evidence.includes(file.id)).map(file=><a className="btn secondary space-top" href={api+'/evidence/'+file.id} key={file.id}>{file.name} · v{file.version}</a>)}
  {paper.editable?<ActionForm key={paper.version} run={run} action="save" extra={reference} button="Ажлыг хадгалах">
   {form==='1.3'&&<div className="field-grid">{[['benchmark','Суурь дүн'],['percentage','Материаллаг байдлын хувь'],['performance','Гүйцэтгэлийн хувь'],['trivial','Илт бага зөрүүний хувь']].map(([key,label])=><label key={key}>{label}<input type="number" step="any" name={key} defaultValue={paper.values[key]} required/></label>)}</div>}
   {form==='2.6'&&<label>Хяналтад найдах түвшин<select name="reliance" defaultValue={paper.values.controlsReliance??'none'}><option value="none">Найдахгүй</option><option value="partial">Хэсэгчлэн</option><option value="full">Бүрэн</option><option value="na">Хамаарахгүй</option></select></label>}
   <label>Хийсэн ажил<textarea name="execution" defaultValue={paper.values.execution} required/></label>
   <label>Дүгнэлт<textarea name="conclusion" defaultValue={paper.values.conclusion} required/></label>
  </ActionForm>:<><p>{paper.values.execution}</p><p>{paper.values.conclusion}</p></>}
  {paper.editable&&!['submitted','reviewed'].includes(paper.status)&&<button type="button" className="btn secondary space-top"
   disabled={!paper.values.execution||!paper.values.conclusion} onClick={()=>void run('submit',reference)}>Хадгалсан v{paper.version} хувилбарыг хяналтад илгээх</button>}
  {paper.reviewable&&<div className="space-top">
   <button type="button" className="btn primary" disabled={paper.notes.some(n=>!n.cleared)} onClick={()=>void run('review',reference)}>v{paper.version} хувилбарыг хянаж батлах</button>
   <ActionForm run={run} action="return" extra={reference} button="Засварт буцаах"><label>Хяналтын тэмдэглэл<input name="reason" required/></label></ActionForm>
  </div>}
  {paper.notes.map(n=><div className="bench-item" key={n.id}>
   <b>v{n.version} · {names[n.author]} · {n.cleared?'Шийдвэрлэсэн':'Нээлттэй'}</b>
   <p>{n.text}</p>{n.response&&<p>{n.response}</p>}
   {paper.editable&&!n.cleared&&['returned','changed','in_progress'].includes(paper.status)&&<ActionForm run={run} action="respond" extra={{form,note:n.id}} button="Хариу хадгалах"><label>Хариу<input name="response" defaultValue={n.response} required/></label></ActionForm>}
   {paper.status==='submitted'&&!n.cleared&&n.author===({preparer:'nomin',reviewer:'temuulen',partner:'bat'}[role])&&n.response&&
    <button type="button" className="btn secondary" onClick={()=>void run('clear',{form,note:n.id})}>Тэмдэглэл шийдвэрлэх</button>}
  </div>)}
  {paper.history.length>0&&<details className="feature-detail"><summary>Хувилбарын түүх</summary>{paper.history.map((h,i)=><div className="bench-item" key={i}>
   <b>v{h.version} · {names[h.by]} · {h.action}</b><p>{h.values.execution}</p><p>{h.values.conclusion}</p>
   <small>{h.evidence.length} холбоостой баримт · {new Date(h.at).toLocaleString()}</small>
  </div>)}</details>}
 </section>;
}

export default function PilotWorkspace(){
 const [data,setData]=useState<Result|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const pending=useRef<{intent:string;key:string}|null>(null);
 const outdated=!!(data&&'role' in data&&!Array.isArray(data.registers));
 const view=data&&'role' in data&&!outdated?data:null,engagement=view?.engagement;
 const sealed=!!view?.archive.packages.length&&!view?.archive.reopened;
 useEffect(()=>{request().then(setData).catch(e=>setError(e.message));},[]);
 async function send(path:string,body?:unknown){
  setBusy(true);setError('');
  try {setData(await request(path,body));if(path==='/logout')pending.current=null;return true;}
  catch(e){setError((e as Error).message);return false;}
  finally{setBusy(false);}
 }
 const run:Action=async(action,values={})=>{
  const intent=JSON.stringify([view?.role,action,Object.entries(values).sort(([a],[b])=>a.localeCompare(b))]);
  const command=pending.current?.intent===intent?pending.current:{intent,key:crypto.randomUUID()};
  pending.current=command;
  const ok=await send('/action',{action,fields:values,revision:view?.revision,idempotencyKey:command.key});
  if(ok&&pending.current===command)pending.current=null;
  return ok;
 };
 return <main className="audit-app">
  <div className="app-content pilot-content">
   <header className="page-heading">
    <div><span className="eyebrow">VERITECH AUDIT · ЛОКАЛ ТУРШИЛТ</span><h1>Хамтарсан гэрээт ажил</h1><p>Үндсэн хөрөнгийн баримтаас партнерын багцын зөвшөөрөл хүртэл.</p></div>
    <a className="btn secondary" href="/">Локал загвар</a>
   </header>
   {view&&<div className="row-actions space-top"><b>{roles[view.role]}</b><button className="btn secondary" disabled={busy} onClick={()=>void send('')}>Бүртгэл шинэчлэх</button><button className="btn secondary" disabled={busy} onClick={()=>void send('/logout',{})}>Гарах</button></div>}
   {error&&<p className="callout amber" role="alert">{error}</p>}
   {outdated&&<p className="callout amber">Шинэчилсэн туршилтын серверийг дахин эхлүүлээд хуудсаа шинэчилнэ үү.</p>}
   <fieldset disabled={busy} className="feature-fields">
    {!data&&!error&&<p>Ачаалж байна…</p>}
    {data&&'setup' in data&&<Access key={String(data.setup)} setup={data.setup} send={send}/>}
    {view&&!engagement&&(view.role==='preparer'?<p>Ахлах эсвэл партнер гэрээт ажил үүсгэнэ.</p>:<SetupEngagement run={run}/>)}
   {view&&<PilotRegisters role={view.role} resources={view} evidence={view.evidence??[]} engagement={!!engagement} active={!!engagement?.active} run={run} onError={setError}/>}
    {view&&engagement&&<>
     <section className="card pad bench-card">
      <div className="section-heading"><h2>{engagement.client}</h2><span className="pill">{engagement.active?'Идэвхтэй':'Идэвхжүүлэхийг хүлээж байна'}</span></div>
      <p>{engagement.period.start} — {engagement.period.end} · Зорилтот тайлан {engagement.reportDate}</p>
      {!!engagement.acceptanceGaps.length&&<ul>{engagement.acceptanceGaps.map(gap=><li key={gap}>{gap}</li>)}</ul>}
      {engagement.firm.find(r=>r.kind==='M01-F01')&&<p className="micro">Хүлээн авахад ашигласан фирмийн бүртгэл · {engagement.firm.find(r=>r.kind==='M01-F01')?.values.reporting}</p>}
      {!engagement.active&&(view.role==='partner'?<ActionForm run={run} action="activate" button="Шийдвэр бүртгэж идэвхжүүлэх">
       <label>Хараат бус байдлын шийдвэрийн ишлэл<input name="independence" required/></label>
       <label>Тохиролцсон захидлын хувилбар<input name="letter" required/></label>
       <label>Хүлээн авах шийдвэрийн үндэслэл<textarea name="assessment" required/></label>
      </ActionForm>:<p className="muted">Партнер шийдвэрээ бүртгэсний дараа баримт болон ажлын хэсэг нээгдэнэ.</p>)}
      {engagement.active&&<details><summary>Хүлээн авах шийдвэрийн түүх</summary>{engagement.decisions.map(d=><p key={d.version}>v{d.version} · {d.assessment||d.letter||d.independence} · {new Date(d.at).toLocaleString()}</p>)}</details>}
     </section>
     {!sealed&&<SupportingEvidence view={view} run={run} onError={setError}/>}
     {engagement.active&&<>
      {!sealed&&<Delivery view={view} run={run}/>}
      {(!view.archive.packages.length||view.archive.reopened)&&<Requests view={view} run={run} onError={setError}/>}
      {view.papers?.map(paper=><Workpaper key={paper.id} paper={paper} run={run} role={view.role} evidence={sealed?[]:view.evidence} sealed={sealed}/>)}
      {view.impacts?.map(impact=><section className="card pad bench-card" key={impact.id}><h2>{impact.source} · Өөрчлөлтийн нөлөө</h2><p>{impact.reason} · {impact.targets.join(', ')}</p>
       {view.role==='reviewer'&&<ActionForm run={run} action="resolve-impact" extra={{id:impact.id}} button="Нөлөөллийн үнэлгээг бүртгэх"><label>Шийдвэрийн үндэслэл<input name="reason" required/></label></ActionForm>}
      </section>)}
      <section className="card pad bench-card">
       <h2>Партнерын багцын зөвшөөрөл</h2>
       {view.extended&&view.role==='partner'&&!sealed&&<ActionForm key={engagement.reportDate} run={run} action="report-date" button="Зорилтот тайлангийн өдрийг шинэчлэх">
        <label>Зорилтот тайлангийн өдөр<input type="date" name="date" min={engagement.period.end} defaultValue={engagement.reportDate} required/></label>
       </ActionForm>}
       {view.role==='partner'&&(!view.archive.packages.length||view.archive.reopened)&&<ActionForm key={engagement.statements?.version} run={run} action="statements" button="СТ ба тодруулгыг тайланд холбох">
        <label>Санхүүгийн тайлангийн агуулга<textarea name="statements" defaultValue={engagement.statements?.statements} required/></label>
        <label>Тодруулгын агуулга<textarea name="disclosures" defaultValue={engagement.statements?.notes} required/></label>
        {view.extended&&<label>СТ мөрүүд · мөр бүрд КОД,ДҮН<textarea name="lines" placeholder="PPE,120" defaultValue={Object.entries(view.statementLines??{}).map(([code,amount])=>code+','+amount).join('\n')} required/></label>}
       </ActionForm>}
       {view.gaps?.length?<ul>{view.gaps.map(gap=><li key={gap}>{gap}</li>)}</ul>:view.gaps&&<p>Одоогийн багц зөвшөөрөхөд бэлэн.</p>}
       {view.authorized&&<p>{view.authorized.current?'Одоогийн багцыг зөвшөөрсөн':'Багц өөрчлөгдсөн · дахин зөвшөөрнө'} · СТ v{view.authorized.fs} · Тайлан v{view.authorized.report} · {new Date(view.authorized.at).toLocaleString()}</p>}
       {view.authorized?.current&&view.authorized.artifactSha256&&<p className="micro break-all">SHA-256 {view.authorized.artifactSha256}</p>}
       {view.role==='partner'&&<div className="row-actions space-top">
        {(!view.archive.packages.length||view.archive.reopened)&&<button type="button" className="btn primary" disabled={!!view.gaps?.length||view.authorized?.current} onClick={()=>void run('authorize')}>Одоогийн багцыг зөвшөөрөх</button>}
        {(!sealed&&!view.gaps?.length||view.authorized?.current&&view.authorized.artifactSha256)&&<a className="btn secondary" href={api+'/report'}>{view.authorized?.current?'Зөвшөөрсөн тайлан татах':'Хянах тайлан татах'}</a>}
        {view.authorized&&<a href={api+'/authorizations'} className="btn secondary">Зөвшөөрлийн түүх татах ({view.authorized.count})</a>}
       </div>}
       {view.role==='partner'&&view.authorized?.current&&(!view.archive.packages.length||view.archive.reopened)&&<>
        <ActionForm run={run} action="issue" button="Гаргалтыг бүртгэх"><label>Бодит гаргалтын бүртгэлийн ишлэл<input name="reference" required/></label></ActionForm>
        {view.archive.issue&&<button type="button" className="btn secondary space-top" onClick={()=>void run('archive-seal')}>Гаргасан багцыг архивт түгжих</button>}
       </>}
      </section>
     </>}
     <details className="card pad bench-card"><summary>Үйлдлийн түүх</summary>{view.activity?.map(a=><p key={a.id}>{names[a.by]} · {a.text} · {new Date(a.at).toLocaleString()}</p>)}</details>
    </>}
   </fieldset>
  </div>
 </main>;
}
