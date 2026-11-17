'use client';

import {useCallback,useEffect,useRef,useState,type FormEvent,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,FileText,PanelRightOpen,X} from 'lucide-react';
import {WorkspaceShell,WorkpaperIndex,WorkOverview,EvidenceLibraryView,EvidencePreview,WorkspaceEmpty,AuthFrame} from './enterprise-workspace';
import {readWorkspaceRoute,workspaceUrl,type WorkspaceRoute,type WorkspacePage,type WorkspaceFilter} from '@/lib/workspace-navigation';
import {PilotRequestError,readPilotResponse} from '@/lib/pilot-client';
import {AssemblyDesk} from './pilot-assembly';
import type {AssemblyView} from '@/lib/pilot-assembly';
import PilotRegisters,{PlanningBasis,type RegisterResources} from './pilot-registers';
import {AdoptPilotForm,NativeFields,PilotFormLibrary} from './pilot-forms';
import {IntakeProvenance,PilotIntake,TermsEditor} from './pilot-intake';
import {AcceptanceDesk} from './pilot-acceptance';
import {PlanningDesk} from './pilot-planning';
import {DataMethodsDesk} from './pilot-data-methods';
import {EvidenceCoverageDesk,EvidencePartActions,ReceiptFields,RequestScopeEditor} from './pilot-evidence';
import type {DataMethodsView,RequestCoverage} from '@/lib/pilot-data-methods';
import type {AcceptanceView} from '@/lib/pilot-acceptance';
import {EngagementStaffing,RosterOverview,WorkAssignmentEditor} from './pilot-staffing';
import {DeliveryTimeline,PlanningCalendar} from './delivery-planning';
import {JournalDesk,PopulationDesk,SampleDesk} from './pilot-population';
import {MaterialityBasisFields,MaterialityBasisSummary,type MaterialityTarget} from './pilot-materiality';
import {AreaDesk} from './pilot-area';
import {CompletionDesk,type CompletionView} from './pilot-completion';
import {LaterFactsDesk,type LaterFact} from './pilot-later-facts';
import {IndependentDesk,OversightDesk,ReportRecipient,type OversightView,type ReleaseView} from './pilot-oversight';
import {pilotScope,type PilotRole,type ProgrammeBasis} from '@/lib/pilot-registers';
import {fieldAnswers,type LibraryView,type PaperForm} from '@/lib/pilot-forms';
import type {Enquiry,IntakeClient,IntakeContext,IntakeTerms} from '@/lib/pilot-intake';
import type {RosterAvailability,StaffingView,StaffSignoff,WorkAssignment} from '@/lib/pilot-staffing';
import type {DecisionRecord,Evidence,Finding,Model,RequestItem,Statements,WorkItem} from '@/lib/workspace';
import type {Period,Template} from '@/lib/workbench';
import type {JournalRun,PopulationView,SampleView} from '@/lib/pilot-population';
import type {AreaRun} from '@/lib/pilot-area';
import type {MaterialityAmounts,MaterialityBasis} from '@/lib/pilot-materiality';

const api='/api/pilot';
const roles={preparer:'Бэлтгэгч',reviewer:'Ахлах хянагч',partner:'Партнер'};
const names:Record<string,string>={nomin:roles.preparer,temuulen:roles.reviewer,bat:roles.partner};
const accountByRole={preparer:'nomin',reviewer:'temuulen',partner:'bat'};
const staffNames=(staffing?:StaffingView)=>Object.fromEntries((staffing?.seats??[]).flatMap(s=>s.current&&s.account?[[accountByRole[s.account],s.name]]:[]));
const status:Record<WorkItem['status'],string>={not_started:'Эхлээгүй',in_progress:'Бэлтгэж буй',waiting:'Хүлээгдэж буй',submitted:'Хяналтад ирсэн',returned:'Засварт буцаасан',reviewed:'Хянагдсан',changed:'Дахин хянуулах'};
const deliveryStates:Record<string,string>={pending:'Хүлээгдэж байна',expired:'Холбоосын хугацаа дууссан',unknown:'Үр дүн тодорхойгүй',failed:'Оролдлого амжилтгүй',withdrawn:'Хүлээн авагчийн хүрээг цуцалсан'};
const partStatus={missing:'Ирээгүй',received:'Үнэлэх',accepted:'Зөвшөөрсөн',rejected:'Буцаасан'};
export type Paper=WorkItem&{editable:boolean;reviewable:boolean;template?:PaperForm;oldTemplates?:Record<string,Template>;nativeGaps?:string[];
 assignmentHistory?:WorkAssignment[];staffingSignoffs?:StaffSignoff[];pendingPlanning?:boolean;fieldGap?:string;requestGap?:string;
 materiality?:MaterialityAmounts|null;materialityBasis?:MaterialityBasis|null;materialityTargets?:MaterialityTarget[];
 planning?:{id:string;version:number;basis?:ProgrammeBasis;template:{form:string;sheet:string;digest:string;number?:number}}};
type PortfolioItem={id:string;client:string;start:string;end:string;reportDate:string;active:boolean;
 progress?:null|{reviewed:number;applicable:number;tasks:number;deadlines:{form:string;title:string;due:string}[]}};
export type View=RegisterResources&{
 role:PilotRole;revision:number;selected:string|null;portfolio:PortfolioItem[];members?:PilotRole[];formLibrary:LibraryView;
 intake?:{clients:IntakeClient[];enquiries:Enquiry[]};intakeContext?:IntakeContext;
 intakeTerms?:IntakeTerms;intakeTermsHistory?:IntakeTerms[];intakeTermsAmendable?:boolean;intakeTermsCanDraft?:boolean;
 acceptance?:AcceptanceView;
 roster?:RosterAvailability[];staffing?:StaffingView;
 engagement:null|{client:string;period:Period;active:boolean;reportDate:string;statements?:Statements;decisions:DecisionRecord[];acceptanceGaps:string[];firm:{id:string;kind:string;version:number;values:Record<string,string>}[]};
 papers?:Paper[];requests?:RequestItem[];evidence?:(Evidence&{sha256:string;current?:boolean})[];gaps?:string[];
 requestContacts?:{id:string;name:string;email:string}[];
 confirmations?:{request:string;part:string;recipient:string;sent:string;state:string;response?:string;received?:string;evidence?:string}[];
 confirmationLink?:{token:string;request:string;part:string};
 population?:PopulationView;
 dataMethods?:DataMethodsView;requestCoverage?:RequestCoverage;
 completion?:CompletionView;
 laterFacts?:LaterFact[];
 oversight?:OversightView;release?:ReleaseView;deliveryLink?:{token:string;id:string;recipient:string};
 samples?:Record<string,SampleView>;journals?:Record<string,JournalRun>;areas?:Record<string,AreaRun>;fieldFindings?:Finding[];
 fieldwork?:string[];statementLines?:Record<string,number>;impacts?:Model['impacts'];
 delivery?:Pick<Model,'person'|'tasks'|'events'>&{id:string};
 activity?:Model['activity'];authorized?:{current:boolean;at:string;report:number;fs:number;count:number;artifactSha256?:string};
 assembly?:AssemblyView;
};
type Action=(action:string,fields?:Record<string,string>)=>Promise<boolean>;
type Result=View|{setup:boolean};
type PilotFile=Evidence&{sha256:string;uploadedBy?:View['role']};

async function request(path='',body?:unknown):Promise<Result>{
 const response=await fetch(api+path,body===undefined?{cache:'no-store'}:{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
 });
 return readPilotResponse<Result>(response);
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
 return <form className="feature-form" data-action={action} onSubmit={e=>{e.preventDefault();void run(action,{...fields(e.currentTarget),...extra});}}>
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
    <div className="field-grid"><label>Хараат бус чанарын нууц үг (сонголтоор)<input name="quality" type="password" autoComplete="new-password" minLength={12} maxLength={128}/></label>
     <label>Хадгалалтын нууц үг (сонголтоор)<input name="custodian" type="password" autoComplete="new-password" minLength={12} maxLength={128}/></label></div>
   </>:<><label>Дүр<select name="role">{Object.entries(roles).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
    <label>Нууц үг<input name="password" type="password" autoComplete="current-password" required/></label></>}
   <button className="btn primary">{setup?'Нэвтрэх эрх үүсгэх':'Нэвтрэх'}</button>
  </form>
  <p><a href="/pilot#oversight=quality">Хараат бус чанарын хяналт</a> · <a href="/pilot#oversight=custodian">Хадгалалтын хүлээн авалт</a></p>
 </section>;
}

function EngagementPicker({view,open}:{view:View;open:(id:string|null,form?:string)=>void}){
 return <section className="card pad bench-card">
  <div className="section-heading"><div><h2>Гэрээт ажлууд</h2><p>Таны хандах эрхтэй ажлууд</p></div>
   {view.selected&&<button type="button" className="btn secondary" onClick={()=>open(null)}>Жагсаалт ба фирмийн бүртгэл</button>}
  </div>
  <div className="row-actions">
   {view.portfolio.map(item=><button type="button" key={item.id} className={item.id===view.selected?'btn primary':'btn secondary'}
    aria-current={item.id===view.selected?'page':undefined} onClick={()=>open(item.id)}>
    {item.client} · {item.end.slice(0,4)}
   </button>)}
  </div>
  {!view.portfolio.length&&<p className="muted">Хандах эрхтэй гэрээт ажил алга.</p>}
  {!view.selected&&view.portfolio.map(item=><div key={item.id} className="bench-item">
   <b>{item.client}</b>
   <p className="micro">{item.start} — {item.end} · {item.active?'Идэвхтэй':'Хүлээн авах'} · Зорилтот тайлан {item.reportDate}</p>
   {item.progress&&<>
    <p>{item.progress.reviewed}/{item.progress.applicable} ажлын баримт хянагдсан · {item.progress.tasks} нээлттэй даалгавар</p>
    {item.progress.deadlines.map(w=><button key={w.form} type="button" className="quiet" onClick={()=>open(item.id,w.form)}>
     {w.due} · {w.form} · {w.title}
    </button>)}
   </>}
  </div>)}
 </section>;
}

function EngagementAccess({members,run}:{members:PilotRole[];run:Action}){
 return <details className="feature-detail">
  <summary>Гэрээт ажилд хандах эрх</summary>
  <p className="muted">Өөрчлөлт зөвхөн энэ гэрээт ажилд үйлчилнэ.</p>
  {(['preparer','reviewer'] as const).map(role=>{
   const granted=members.includes(role);
   return <div className="bench-item" key={role}>
    <p>{roles[role]} · {granted?'Хандах эрхтэй':'Хандах эрхгүй'}</p>
    <ActionForm key={String(granted)} run={run} action="access" extra={{role,access:granted?'revoke':'grant'}} button={granted?'Хандах эрх цуцлах':'Хандах эрх олгох'}>
     <label>Үндэслэл<input name="reason" required/></label>
    </ActionForm>
   </div>;
  })}
 </details>;
}

function Requests({view,run,onError}:{view:View;run:Action;onError:(error:string)=>void}){
 const files=view.evidence??[];
 const active=(view.requests??[]).filter(r=>r.dispatch==='issued');
 const expected=active.reduce((total,r)=>total+(r.parts?.length??0),0);
 const accepted=active.reduce((total,r)=>total+(r.parts?.filter(p=>p.state==='accepted').length??0),0);
 function upload(e:FormEvent<HTMLFormElement>,id:string){
  e.preventDefault();
  const form=e.currentTarget,data=new FormData(form),parts=data.getAll('parts').map(String);
  if(!parts.length){onError('Хүсэлтийн хэсэг сонгоно уу.');return;}
  void readEvidence(data.get('file')).then(file=>run('upload',{...Object.fromEntries([...data].filter(([key])=>key!=='file').map(([key,value])=>[key,String(value)])),request:id,parts:parts.join(','),source:String(data.get('source')),...file}))
   .then(ok=>{if(ok)form.reset();}).catch(e=>onError(e.message));
 }
 return <section className="card pad bench-card feature-desk">
  <h2>Хөтөлбөрийн баримтын хүсэлт</h2>
  <EvidenceCoverageDesk data={view.dataMethods} coverage={view.requestCoverage} role={view.role} forms={view.fieldwork??[]} contacts={view.requestContacts} records={view.registers} run={run}/>
  <p>{accepted}/{expected} гаргасан хүсэлтийн хэсэг хүлээн авсан</p>
  {!view.dataMethods?.managed&&!!view.fieldwork?.length&&<details className="feature-detail"><summary>Шинэ хүсэлт</summary>
   <ActionForm run={run} action="request-draft" button="Хүсэлтийн ноорог хадгалах"><div className="field-grid">
    <label>Хэрэгжүүлсэн хөтөлбөр<select name="form">{view.fieldwork.map(f=><option key={f} value={f}>{f} · {view.forms.find(p=>p.id===f)?.title}</option>)}</select></label>
    <label>Хүсэлтийн нэр<input name="title" required/></label><label>Хугацаа<input name="due" type="date" required/></label>
    <label>Хүлээн авагч<select name="contactId">{view.requestContacts?.map(c=><option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}</select></label>
    <label>Хүсэх баримт · мөр бүрт нэг<textarea name="parts" required/></label>
    <label>Нэмэлт тайлбар<textarea name="message"/></label>
   </div><details className="feature-detail"><summary>Эх олонлогийн CSV хүсэлт · сонголттой</summary>
    <p>Нэг файл хүсэж, гэрээт ажлын тайлант үеийг ашиглана.</p>
    <label>Өгөгдлийн эх систем<input name="extractSystem"/></label>
    <label>Хүсэх баганууд<input name="extractFields" placeholder="id,account,amount,entity,date,currency"/></label>
   </details></ActionForm>
  </details>}
  {view.requests?.map(r=>{
   const owner=r.owner===accountByRole[view.role],manage=owner||view.role!=='preparer';
   const current=r.dispatch==='issued',open=(r.parts??[]).filter(p=>p.state==='missing'||p.state==='rejected');
   const groupFiles=files.filter(e=>e.request===r.id||r.parts?.some(p=>p.evidence===e.id));
   return <details key={r.id} data-request-id={r.id} className="feature-detail" open={current&&r.status!=='complete'}>
    <summary>{r.title} <span className="pill">{r.dispatch==='draft'?'Ноорог':r.dispatch==='cancelled'?'Цуцалсан':(r.parts??[]).filter(p=>p.state==='accepted').length+'/'+r.expected+' зөвшөөрсөн'}</span></summary>
    <p>{r.form} · {r.contact} · {r.due} · {r.id} · {names[r.owner]??r.owner}</p>
    {r.extract&&<p>Эх систем {r.extract.system} · {r.extract.start} — {r.extract.end} · {r.extract.fields.join(', ')}</p>}
    {r.message&&<p>{r.message}</p>}
    {view.dataMethods?.managed&&owner&&current&&<RequestScopeEditor request={r} context={view.dataMethods.context} run={run}/>}
    {manage&&r.dispatch==='draft'&&<button type="button" className="btn secondary" onClick={()=>void run('request-issue',{request:r.id})}>Гаргасан гэж бүртгэх</button>}
    {manage&&r.dispatch!=='cancelled'&&r.status!=='complete'&&<details className="feature-detail"><summary>Дагаж тодруулах эсвэл цуцлах</summary>
     {current&&<ActionForm run={run} action="request-followup" extra={{request:r.id}} button="Дагаж тодруулсан тэмдэглэл хадгалах">
      <label>Дагаж тодруулсан тэмдэглэл<input name="reason" required/></label></ActionForm>}
     <ActionForm run={run} action="request-cancel" extra={{request:r.id}} button="Хүсэлт цуцлах"><label>Цуцлах үндэслэл<input name="reason" required/></label></ActionForm>
    </details>}
    {r.parts?.map(part=>{
     const file=groupFiles.find(e=>e.id===part.evidence),extra={request:r.id,part:part.id};
     return <div className="bench-item" data-request-part={part.id} key={part.id}>
      <p><b>{part.title}</b> · {partStatus[part.state]}{part.reason?' · '+part.reason:''}</p>
      {view.dataMethods?.managed&&<EvidencePartActions request={r} part={part} evidence={files} role={view.role} owner={owner} run={run}/>}
      {file&&<a href={api+'/evidence/'+file.id+pilotScope(view.selected)}>{file.name} · v{file.version}</a>}
      {view.dataMethods?.managed&&file&&manage&&current&&<details className="feature-detail"><summary>Ирсэн эхийн бодит хүрээг тодруулах</summary><ActionForm action="support-scope" extra={{id:file.id}} run={run} button="Эхийн хүрээний шинэ хувилбар хадгалах"><div className="field-grid"><ReceiptFields context={view.dataMethods.context} evidence={file}/><label>Бодит засвар ба нөлөөллийн үндэслэл<textarea name="reason" required/></label></div></ActionForm></details>}
      {r.extract&&file&&current&&part.state==='accepted'&&view.role!=='partner'&&<ActionForm run={run} action="population-import"
       extra={{requestEvidence:file.id,evidenceVersion:String(file.version)}} button="Зөвшөөрсөн CSV-ийг эх олонлогоор бүртгэх">
       <label>Валют<input name="currency" maxLength={3} placeholder="MNT" required/></label>
       <label>Баталсан импортын профайл<select name="profile"><option value="">Стандарт CSV</option>{view.dataMethods?.profiles.filter(p=>p.current.status==='approved').map(p=><option key={p.id} value={p.id}>{p.current.name} · v{p.current.version}</option>)}</select></label>
      </ActionForm>}
      {owner&&current&&part.state==='received'&&<>
       <button type="button" className="btn secondary space-top" onClick={()=>void run('accept',extra)}>Энэ хэсэгт зөвшөөрөх</button>
       <ActionForm run={run} action="reject" extra={extra} button="Энэ хэсгийг буцаах"><label>Буцаах шалтгаан<input name="reason" required/></label></ActionForm>
      </>}
      {!view.dataMethods?.managed&&view.role!=='preparer'&&current&&['missing','rejected'].includes(part.state)&&<button type="button" className="btn secondary"
       onClick={()=>void run('confirmation-start',extra)}>Локал баталгаажуулалтын холбоос үүсгэх</button>}
      {view.dataMethods?.managed&&view.role!=='preparer'&&current&&['missing','rejected'].includes(part.state)&&<ActionForm run={run} action="confirmation-start" extra={extra} button="Баталсан хүрээний локал хариуны холбоос үүсгэх"><label>Яг баталгаажуулалтын бэлтгэл<select name="caseId" required><option value="">Сонгох</option>{view.registers.filter(record=>record.kind==='M07-F08'&&record.status==='approved'&&!record.stale&&record.values.dispatch==='prepared').map(record=><option key={record.id} value={record.id}>{record.values.recipient} · {record.values.address} · v{record.version}</option>)}</select></label></ActionForm>}
      {view.confirmationLink?.request===r.id&&view.confirmationLink?.part===part.id&&
       <p><a href={'/pilot#confirmation='+view.confirmationLink.token} target="_blank" rel="noopener noreferrer">Хүлээн авагчийн нэг удаагийн локал холбоос</a> · 24 цаг хүчинтэй</p>}
      {view.confirmations?.filter(c=>c.request===r.id&&c.part===part.id).map((c,i)=><p className="micro" key={i}>
       {c.recipient} · {c.received?'Хариу ирсэн '+c.received.slice(0,16):({pending:'Хариу хүлээгдэж байна',expired:'Хугацаа дууссан',revoked:'Холбоос хүчингүй'})[c.state as 'pending']??c.state}
       {c.response?' · '+c.response:''}</p>)}
      {manage&&current&&part.state==='accepted'&&<details className="feature-detail"><summary>Солих баримт дахин хүсэх</summary>
       <ActionForm run={run} action="request-reopen" extra={extra} button="Хэсгийг дахин нээх"><label>Үндэслэл<input name="reason" required/></label></ActionForm>
      </details>}
      {!!part.uses?.length&&<details><summary>Хэрэглээний түүх</summary>{part.uses.map((use,index)=>{
       const original=groupFiles.find(f=>f.id===use.evidence);
       return <p key={index}>{use.at.slice(0,16)} · {names[use.by]??use.by} · {use.state==='reopened'?'Дахин нээсэн':partStatus[use.state]} · {use.reason??''}
        {original&&<> · <a href={api+'/evidence/'+original.id+pilotScope(view.selected)}>{original.name} v{original.version}</a></>}</p>;
      })}</details>}
     </div>;
    })}
    {owner&&current&&open.length>0&&<form className="feature-form" data-request-upload={r.id} onSubmit={e=>upload(e,r.id)}>
     <p>Нэг файлыг хамрах хэд хэдэн хэсэгт холбож болно.</p>
     {open.map(p=><label key={p.id}><input name="parts" type="checkbox" value={p.id} defaultChecked={open.length===1}/> {p.title}</label>)}
     <label>Эх файл<input name="file" type="file" accept={r.extract?'.csv':'.pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv'} required/></label>
     {view.dataMethods?.managed&&<div className="field-grid"><ReceiptFields context={view.dataMethods.context}/></div>}
     <label>Файл нийлүүлсэн эх сурвалж<input name="source" required/></label><button className="btn primary">Эх файл бүртгэх</button>
    </form>}
   </details>;
  })}
 </section>;
}

function SupportingEvidence({view,run,onError}:{view:View;run:Action;onError:(message:string)=>void}){
 const evidence=(view.evidence??[]).filter(e=>!e.population) as PilotFile[];
 function upload(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const form=e.currentTarget,data=new FormData(form);
  void readEvidence(data.get('file')).then(file=>run('support-upload',{...Object.fromEntries([...data].filter(([key])=>key!=='file').map(([key,value])=>[key,String(value)])),source:String(data.get('source')),...file})).then(ok=>{if(ok)form.reset();}).catch(e=>onError(e.message));
 }
 return <details className="card pad bench-card">
  <summary>Үнэлгээний эх баримт · хүсэлтээс тусдаа</summary>
  <form className="feature-form" onSubmit={upload}>
   <label>Үнэлгээний файл<input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv" required/></label>
   {view.dataMethods?.managed&&<div className="field-grid"><ReceiptFields context={view.dataMethods.context}/></div>}
   <label>Файлын эх сурвалж<input name="source" required/></label><button className="btn secondary">Үнэлгээний эх файл нэмэх</button>
  </form>
  {evidence.filter(e=>!e.request).map(e=><div className="bench-item" key={e.id}>
   <a href={api+'/evidence/'+e.id+pilotScope(view.selected)}>{e.name} · v{e.version}</a>
   <p>{e.source} · {partStatus[e.status]} · {e.assessment}</p>
   {e.scope&&<p>{e.scope.entity} · {e.scope.start}–{e.scope.end} · {e.scope.evidenceType} · {e.supplier} · {e.receivedOn}</p>}
   {view.dataMethods?.managed&&<details className="feature-detail"><summary>Эхийн хэрэглээний хүрээг шинэ хувилбараар тодруулах</summary><ActionForm run={run} action="support-scope" extra={{id:e.id}} button="Хүрээний шинэ хувилбар хадгалах"><div className="field-grid"><ReceiptFields context={view.dataMethods.context} evidence={e}/><label>Өөрчилсөн үндэслэл<textarea name="reason" required/></label></div></ActionForm></details>}
   {view.role!=='preparer'&&e.uploadedBy!==view.role&&e.status==='received'&&<ActionForm action="support-assess" extra={{id:e.id}} run={run} button="Эх файлыг үнэлэх">
    <label>Үнэлгээ<select name="result"><option value="accepted">Зөвшөөрөх</option><option value="rejected">Буцаах</option></select></label>
    <label>Үнэлгээний үндэслэл<input name="reason" required/></label>
   </ActionForm>}
  </div>)}
 </details>;
}

function Delivery({view,run,openPaper:selectPaper}:{view:View;run:Action;openPaper?:(id:string)=>void}){
 const [planTab,setPlanTab]=useState('tasks');
 if(!view.delivery||!view.engagement)return null;
 const delivery=view.delivery,papers=view.papers??[],reportDate=view.engagement.reportDate;
 const canSchedule=view.role!=='preparer',today=new Date().toISOString().slice(0,10);
 const people=staffNames(view.staffing);
 const assignable=Object.keys(roles).filter(r=>view.staffing?.members.includes(r as PilotRole)&&
  (!view.staffing.managed||view.staffing.seats.some(s=>s.current&&s.capacity===r))) as PilotRole[];
 const open=(id:string)=>{
  const target=document.getElementById(id);
  target?.focus({preventScroll:true});
  target?.scrollIntoView({block:'start'});
 };
 const openPaper=(id:string)=>selectPaper?selectPaper(id):open('pilot-paper-'+id);
 const firstScheduled=papers.flatMap(p=>p.start?[p.start]:[]).sort()[0];
 const calendarDay=firstScheduled??today;
 const tasks=[...delivery.tasks].sort((a,b)=>Number(a.done)-Number(b.done)||a.due.localeCompare(b.due));
 return <section className="card pad bench-card">
  <h2>Хамтарсан төлөвлөгөө</h2>
  <nav className="ew-paper-tabs" aria-label="Төлөвлөгөөний харагдац">{[['tasks','Даалгавар'],['calendar','Хуанли'],...(canSchedule?[['timeline','Гантт ба хугацаа']]:[])].map(([id,label])=><button key={id} type="button" aria-pressed={planTab===id} className={planTab===id?'is-active':''} onClick={()=>setPlanTab(id)}>{label}</button>)}</nav>
  <div id="pilot-tasks" hidden={planTab!=='tasks'} tabIndex={-1} className="space-top">
   <h3>{canSchedule?'Багийн даалгавар':'Миний даалгавар'}</h3>
   {tasks.length===0&&<p className="muted">Даалгавар бүртгэгдээгүй.</p>}
   {tasks.map(t=><div className="bench-item" key={t.id}>
    <label><input type="checkbox" checked={t.done} disabled={t.owner!==delivery.person} onChange={e=>void run('task-status',{id:t.id,done:e.target.checked?'yes':'no'})}/> {t.title}</label>
    <p className="micro">{people[t.owner]??names[t.owner]} · {t.due}{t.done?' · Дууссан':''}</p>
    {t.form&&papers.some(p=>p.form===t.form)&&<button type="button" className="quiet" onClick={()=>openPaper(papers.find(p=>p.form===t.form)!.id)}>{t.form} · Ажлын баримт</button>}
   </div>)}
   <details className="feature-detail"><summary>Даалгавар нэмэх</summary>
    <ActionForm action="task-add" run={run} button="Даалгавар хадгалах">
     <label>Гарчиг<input name="title" maxLength={200} required/></label>
     <label>Дуусах өдөр<input name="due" type="date" required/></label>
     {canSchedule&&<label>Хариуцагч<select name="owner" defaultValue={assignable.includes(view.role)?view.role:''} required><option value="">Сонгох</option>
      {assignable.map(key=><option value={key} key={key}>{people[accountByRole[key]]??roles[key]}</option>)}</select></label>}
     <label>Ажлын баримт<select name="form"><option value="">Сонголтоор</option>{papers.map(p=><option value={p.form} key={p.id}>{p.form} · {p.title}</option>)}</select></label>
    </ActionForm>
   </details>
  </div>
  <div hidden={planTab!=='calendar'} className="space-top">
   <PlanningCalendar model={delivery} eng={{id:delivery.id,reportDate}} items={papers} select={openPaper}
    tasksView={()=>setPlanTab('tasks')} initialDay={calendarDay} today={today} teamCalendar={canSchedule}/>
  </div>
  {canSchedule&&<div hidden={planTab!=='timeline'} className="space-top">
   <DeliveryTimeline items={papers} select={openPaper} baseline milestone={reportDate} initialStart={calendarDay.slice(0,7)+'-01'} today={today} staffNames={people}/>
  </div>}
 </section>;
}

function Workpaper({paper,run,role,evidence,sealed,active,engagementId,staffing,sampling,unsaved=false}:{paper:Paper;run:Action;role:View['role'];evidence:View['evidence'];sealed:boolean;active:boolean;engagementId:string|null;staffing?:StaffingView;sampling?:ReactNode;unsaved?:boolean}){
 const form=paper.form,reference={form};
 const [tab,setTab]=useState('work');
 const [answers,setAnswers]=useState(()=>fieldAnswers(paper.values));
 const native=paper.template;
 const people=staffNames(staffing);
 const summaryNeeded=!form.startsWith('F-');
 const payload=native?{...reference,answers:JSON.stringify(answers),templateDigest:native.digest}:reference;
 return <section id={'pilot-paper-'+paper.id} tabIndex={-1} className="card pad bench-card feature-desk">
  <div className="section-heading"><h2>Ажлын баримт · {form}</h2><span className="pill">v{paper.version} · {status[paper.status]}</span></div>
  <p className="micro">{people[paper.owner]??names[paper.owner]} → {people[paper.reviewer]??names[paper.reviewer]} · {paper.evidence.length} холбоотой баримт · {paper.due||'Хугацаа төлөвлөөгүй'}</p>
  <nav className="ew-paper-tabs" aria-label="Ажлын баримтын хэсгүүд">{[['work','Ажлын агуулга'],['review','Хяналт · '+paper.notes.filter(n=>!n.cleared).length],['analysis','Түүвэр ба шинжилгээ'],['history','Хувилбарын түүх']].map(([id,label])=><button type="button" key={id} aria-pressed={tab===id} className={tab===id?'is-active':''} onClick={()=>setTab(id)}>{label}</button>)}</nav>
  <div hidden={tab!=='work'} className="ew-paper-body">
  {paper.pendingPlanning&&<p className="callout amber">Төлөвлөлтийн шийдвэрийн шинэ хувилбар батлагдсаны дараа хяналтад илгээнэ.</p>}
  {(paper.fieldGap||paper.requestGap)&&<p className="callout amber">{paper.fieldGap||paper.requestGap}</p>}
  {paper.planning?.basis&&<details className="feature-detail" open>
   <summary>Баталсан төлөвлөлтийн суурь · v{paper.planning.version}</summary>
   <PlanningBasis basis={paper.planning.basis}/>
  </details>}
  {paper.materiality&&<p>Хадгалсан тооцоо · Нийт {paper.materiality.overall.toLocaleString()} · Гүйцэтгэл {paper.materiality.performance.toLocaleString()} · Илт бага {paper.materiality.trivial.toLocaleString()}</p>}
  {paper.materialityBasis&&<MaterialityBasisSummary basis={paper.materialityBasis} engagement={engagementId}/>}
  <details className="ew-paper-settings"><summary>Томилгоо ба хугацаа</summary>
  {active&&!sealed&&role!=='preparer'&&form!=='4.4'&&!/^4\.1\.A[1-4]$/.test(form)&&
   <WorkAssignmentEditor paper={paper} history={paper.assignmentHistory??[]} staffing={staffing} run={run}/>}
  {paper.due&&<p className="micro">Төлөвлөсөн хугацаа {paper.start} — {paper.due} · Суурь {paper.baselineDue}</p>}
  {!sealed&&role!=='preparer'&&<details className="feature-detail"><summary>Ажлын хугацаа тохируулах</summary>
   <ActionForm key={paper.start+'/'+paper.due} action="schedule" extra={reference} run={run} button="Хугацаа хадгалах">
    <label>Эхлэх өдөр<input name="start" type="date" defaultValue={paper.start} required/></label>
    <label>Дуусах өдөр<input name="due" type="date" defaultValue={paper.due} required/></label>
   </ActionForm>
  </details>}
  </details>
  {evidence?.filter(file=>paper.evidence.includes(file.id)).map(file=><a className="btn secondary space-top" href={api+'/evidence/'+file.id+pilotScope(engagementId)} key={file.id}>{file.name} · v{file.version}</a>)}
  {native&&<p className="micro">Маягтын хувилбар · {native.number?'Баталсан v'+native.number:'Эх маягт'}</p>}
  {!!paper.nativeGaps?.length&&<p className="micro text-amber">{paper.nativeGaps.join(' · ')}</p>}
  {paper.editable?<ActionForm key={paper.version} run={run} action="save" extra={payload} button="Ажлыг хадгалах">
   {form==='1.3'&&<>
    {!paper.materialityBasis?.selection&&<details className="feature-detail" open={!!paper.values.benchmark}><summary>Өмнөх хувиар тооцох оролт</summary><div className="field-grid">{[['benchmark','Суурь дүн'],['percentage','Материаллаг байдлын хувь'],['performance','Гүйцэтгэлийн хувь'],['trivial','Илт бага зөрүүний хувь']].map(([key,label])=><label key={key}>{label}<input type="number" step="any" name={key} defaultValue={paper.values[key]}/></label>)}</div></details>}
    <label>Суурь дүнгийн эх сурвалж<input name="benchmarkSource" defaultValue={paper.values.benchmarkSource}/></label>
    <MaterialityBasisFields basis={paper.materialityBasis} existing={!!paper.values.benchmark}
      targets={paper.materialityTargets??[]} evidence={evidence??[]} values={paper.values}/>
   </>}
   {form==='2.6'&&<div className="field-grid">
    <label>Хяналтад найдах түвшин<select name="reliance" defaultValue={paper.values.controlsReliance??'none'}><option value="none">Найдахгүй</option><option value="partial">Хэсэгчлэн</option><option value="full">Бүрэн</option><option value="na">Хамаарахгүй</option></select></label>
    <label>Хяналтын үнэлж зөвшөөрсөн баримт<select name="relianceEvidence" defaultValue={paper.values.relianceEvidence??''}>
     <option value="">Сонгох</option>{evidence?.filter(file=>file.status==='accepted').map(file=><option key={file.id} value={file.id}>{file.name} · v{file.version}</option>)}
    </select></label>
   </div>}
   {native&&<NativeFields template={native.body} answers={answers} set={(k,v)=>setAnswers(p=>({...p,[k]:v}))} evidence={evidence} shared={native.shared} linked={native.linked} owned={native.owned}/>}
   {summaryNeeded&&<>
    <label>Хийсэн ажил<textarea name="execution" defaultValue={paper.values.execution} required/></label>
    <label>Дүгнэлт<textarea name="conclusion" defaultValue={paper.values.conclusion} required/></label>
   </>}
  </ActionForm>:<>
   {native&&<NativeFields template={native.body} answers={fieldAnswers(paper.values)} set={()=>{}} disabled evidence={evidence} shared={native.shared} linked={native.linked} owned={native.owned}/>}
   <p>{paper.values.execution}</p><p>{paper.values.conclusion}</p>
  </>}
  {paper.editable&&!['submitted','reviewed'].includes(paper.status)&&<button type="button" className="btn secondary space-top"
   disabled={unsaved||!!paper.requestGap||paper.pendingPlanning||!!paper.fieldGap||!!paper.nativeGaps?.length||summaryNeeded&&(!paper.values.execution||!paper.values.conclusion)} onClick={()=>void run('submit',reference)}>Хадгалсан v{paper.version} хувилбарыг хяналтад илгээх</button>}
  {unsaved&&<p className="ew-draft-notice" role="status">Хадгалаагүй өөрчлөлт байна. Хяналтад илгээхийн өмнө ажлаа хадгална уу.</p>}
  </div><div hidden={tab!=='review'} className="ew-paper-body">
  {paper.reviewable&&<div className="space-top">
   <button type="button" className="btn primary" disabled={paper.notes.some(n=>!n.cleared)} onClick={()=>void run('review',reference)}>v{paper.version} хувилбарыг хянаж батлах</button>
   <ActionForm run={run} action="return" extra={reference} button="Засварт буцаах"><label>Хяналтын тэмдэглэл<input name="reason" required/></label></ActionForm>
  </div>}
  {paper.notes.map(n=><div className="bench-item" key={n.id}>
   <b>v{n.version} · {names[n.author]} · {n.cleared?'Шийдвэрлэсэн':'Нээлттэй'}</b>
   <p>{n.text}</p>{n.response&&<p>{n.response}</p>}
   {n.decisions?.map((decision,i)=><p key={i}>{decision.result==='cleared'?'Шийдвэрлэсэн':'Дахин буцаасан'} · {names[decision.by]} ·
    {' '}{decision.at.slice(0,16)} · Ажил v{decision.workVersion} · Хариу {decision.responseVersion?('v'+decision.responseVersion):'хуучин бүртгэл'} · {decision.reason}</p>)}
   {paper.editable&&!n.cleared&&['returned','changed','in_progress'].includes(paper.status)&&<ActionForm run={run} action="respond" extra={{form,note:n.id}} button="Хариу хадгалах"><label>Хариу<input name="response" defaultValue={n.response} required/></label></ActionForm>}
   {paper.status==='submitted'&&!n.cleared&&n.author===({preparer:'nomin',reviewer:'temuulen',partner:'bat'}[role])&&n.response&&
    <ActionForm run={run} action="clear" extra={{form,note:n.id,version:String(paper.version),responseVersion:String(n.responses?.at(-1)?.version??0)}} button="Хянагчийн шийдвэр хадгалах">
     <label>Шийдвэр<select name="result"><option value="cleared">Шийдвэрлэсэн</option><option value="returned">Дахин буцаах</option></select></label>
     <label>Хянасан хамрах хүрээ ба үндэслэл<input name="reason" required/></label>
    </ActionForm>}
  </div>)}
  {!paper.notes.length&&!paper.reviewable&&<WorkspaceEmpty title="Хяналтын тэмдэглэл алга" description="Илгээсэн ажлын хувилбар дээр томилсон хянагч шийдвэрээ бүртгэнэ."/>}
  </div><div hidden={tab!=='analysis'} className="ew-paper-body">{sampling??<WorkspaceEmpty title="Энэ баримтад шинжилгээ холбогдоогүй" description="Холбогдох хөтөлбөр, өгөгдөл болон зөвшөөрсөн олонлог шаардлагатай."/>}</div>
  <div hidden={tab!=='history'} className="ew-paper-body">
  {paper.history.length>0&&<details className="feature-detail"><summary>Хувилбарын түүх</summary>{paper.history.map((h,i)=><div className="bench-item" key={i}>
   <b>v{h.version} · {names[h.by]} · {h.action}</b><p>{h.values.execution}</p><p>{h.values.conclusion}</p>
   {h.values.templateDigest&&(()=>{
    const digest=h.values.templateDigest;
    const body=digest===native?.digest?native.body:paper.oldTemplates?.[digest];
    if(!body)return null;
    const shared=Object.fromEntries(Object.entries(h.values).filter(([k])=>k.startsWith('shared.')).map(([k,v])=>[k.slice(7),v])) as PaperForm['shared'];
    const linked=Object.fromEntries(Object.entries(h.values).filter(([k])=>k.startsWith('linked.')).map(([k,v])=>[k.slice(7),v]));
    return <details><summary>{body.title} · {digest.slice(0,12)}</summary>
     <NativeFields template={body} answers={fieldAnswers(h.values)} set={()=>{}} disabled evidence={evidence} shared={shared} linked={linked}/>
    </details>;
   })()}
   <small>{h.evidence.length} холбоостой баримт · {new Date(h.at).toLocaleString()}</small>
  </div>)}</details>}
  {!!paper.staffingSignoffs?.length&&<details className="feature-detail"><summary>Томилгоотой хяналтын түүх</summary>
   {paper.staffingSignoffs.map((s,i)=><p className="micro" key={i}>v{s.version} · {s.action==='review'?'Хянав':'Илгээв'} · {s.seat.name} · {s.at.slice(0,10)} · {s.seat.credential.title} v{s.seat.credential.version}</p>)}
  </details>}  {!paper.history.length&&<WorkspaceEmpty title="Өмнөх хувилбар алга" description="Хадгалсан, илгээсэн болон хянасан хувилбарууд энд харагдана."/>}
  </div>
 </section>;
}

function SharedPilotWorkspace(){
 const [data,setData]=useState<Result|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [route,setRoute]=useState<WorkspaceRoute>({engagement:null,page:'home',paper:null}),[query,setQuery]=useState(''),[dirty,setDirty]=useState(false),[contextOpen,setContextOpen]=useState(false),[evidenceId,setEvidenceId]=useState('');
 const positions=useRef(new Map<string,number>());
 const routeRef=useRef(route),dirtyRef=useRef(false),dirtyForm=useRef<HTMLElement|null>(null),submittingForm=useRef<HTMLElement|null>(null);
 const clearDraft=()=>{dirtyRef.current=false;dirtyForm.current=null;setDirty(false);};
 const templateDraft=useCallback((active:boolean)=>{dirtyRef.current=active;dirtyForm.current=active?document.querySelector('[data-template-editor]'):null;setDirty(active);},[]);
 function allowLeave(){if(!dirtyRef.current)return true;if(!window.confirm('Хадгалаагүй өөрчлөлт байна. Өөрчлөлтийг орхиод үргэлжлүүлэх үү?'))return false;clearDraft();return true;}
 function present(next:WorkspaceRoute,history:'push'|'replace'='push'){routeRef.current=next;setRoute(next);setContextOpen(false);setEvidenceId('');window.history[history==='push'?'pushState':'replaceState'](null,'',workspaceUrl(next,window.location.pathname));}
 const pending=useRef<{intent:string;key:string}|null>(null);
 const selection=useRef<string|null>(null);
 const outdated=!!(data&&'role' in data&&(!Array.isArray(data.portfolio)||!data.formLibrary));
 const rawView=data&&'role' in data&&!outdated?data:null;
 const view:View|null=rawView?{...rawView,papers:rawView.papers?.map(p=>({...p,requestGap:rawView.fieldwork?.includes(p.form)&&!((rawView.requests??[]).some(r=>r.form===p.form&&r.dispatch==='issued'&&r.status==='complete')&&p.evidence.some(id=>rawView.evidence?.some(e=>e.id===id&&e.status==='accepted'&&e.current!==false)))?'Хүсэлтийн зөвшөөрсөн эх баримт шаардлагатай.':undefined}))}:null;
 const engagement=view?.engagement;
 const sealed=view?.archive.sealed??(!!view?.archive.packages.length&&!view?.archive.reopened);
 function show(result:Result){
  if('role' in result&&Array.isArray(result.portfolio)){
   selection.current=result.selected;
  }
  setData(result);
 }
 useEffect(()=>{
  const initial=readWorkspaceRoute(window.location.search);routeRef.current=initial;setRoute(initial);
  void send(pilotScope(initial.engagement));
  const back=()=>{const next=readWorkspaceRoute(window.location.search);if(!allowLeave()){window.history.pushState(null,'',workspaceUrl(routeRef.current,window.location.pathname));return;}routeRef.current=next;setRoute(next);setContextOpen(false);setEvidenceId('');void send(pilotScope(next.engagement));};
  const unload=(e:BeforeUnloadEvent)=>{if(dirtyRef.current){e.preventDefault();e.returnValue='';}};
  window.addEventListener('popstate',back);window.addEventListener('beforeunload',unload);
  return()=>{window.removeEventListener('popstate',back);window.removeEventListener('beforeunload',unload);};
 },[]);
 async function navigate(next:WorkspaceRoute){
  if(busy||!allowLeave())return;
  positions.current.set(workspaceUrl(routeRef.current),window.scrollY);
  if(next.engagement!==selection.current){if(!await send(pilotScope(next.engagement)))return;}
  present(next);window.requestAnimationFrame(()=>{document.getElementById('workspace-main')?.focus({preventScroll:true});window.scrollTo({top:positions.current.get(workspaceUrl(next))??0,behavior:'instant'});});
 }

 async function send(path:string,body?:unknown){
  setBusy(true);setError('');
  let scopedPath=path;
  try {
   let result=await request(path,body);
   if(path==='/login'&&window.location.search){
    scopedPath=pilotScope(routeRef.current.engagement);result=await request(scopedPath);
   }
   if(path==='/logout'){
    pending.current=null;selection.current=null;
    routeRef.current={engagement:null,page:'home',paper:null};setRoute(routeRef.current);setContextOpen(false);setEvidenceId('');
    window.history.replaceState(null,'',window.location.pathname);
   }
   clearDraft();show(result);
   if('role' in result&&routeRef.current.engagement!==result.selected)present({...routeRef.current,engagement:result.selected,paper:null,...(!result.selected?{page:'clients' as const,filter:undefined,stage:undefined}:{})},'replace');
   return true;
  }
  catch(e){
   if(e instanceof PilotRequestError&&[403,404].includes(e.status)&&scopedPath.startsWith('?engagement=')&&scopedPath!==pilotScope(null)){
    try{
     const recovered=await request(pilotScope(null));clearDraft();show(recovered);
     present({engagement:null,page:'clients',paper:null},'replace');
     setError('Сонгосон гэрээт ажил боломжгүй эсвэл хандах эрхгүй байна. Хандах боломжтой ажлаас сонгоно уу.');return false;
    }catch{setData(null);}
   }
   setError((e as Error).message);return false;
  }
  finally{setBusy(false);}
 }
 const run:Action=async(action,values={})=>{
  if(!view||selection.current!==view.selected)return false;
  if(dirtyRef.current&&!(action==='template-save'&&dirtyForm.current?.hasAttribute('data-template-editor'))&&submittingForm.current!==dirtyForm.current&&!allowLeave())return false;
  submittingForm.current=null;
  const intent=JSON.stringify([view.role,view.selected,action,Object.entries(values).sort(([a],[b])=>a.localeCompare(b))]);
  const command=pending.current?.intent===intent?pending.current:{intent,key:crypto.randomUUID()};
  pending.current=command;
  const ok=await send('/action'+pilotScope(view.selected),{action,fields:values,revision:view.revision,idempotencyKey:command.key});
  if(ok&&pending.current===command)pending.current=null;
  return ok;
 };
 async function openEngagement(id:string|null,form?:string){await navigate({engagement:id,page:form?'workpapers':id?'overview':'clients',paper:form??null});}
 if(!view)return <AuthFrame>{error&&<p className="callout amber" role="alert">{error}</p>}{data&&'setup' in data?<Access key={String(data.setup)} setup={data.setup} send={send}/>:<section className="card pad"><h2>{error?'Ажлын орчинд холбогдож чадсангүй':'Ажлын орчныг ачаалж байна…'}</h2>{error&&<button className="btn primary space-top" onClick={()=>void send(pilotScope(null))}>Дахин холбогдох</button>}</section>}</AuthFrame>;
 const go=(page:WorkspacePage,filter?:WorkspaceFilter)=>void navigate({engagement:view.selected,page,paper:null,...(filter?{filter,stage:''}:{})});
 const openPaper=(form:string)=>void navigate({engagement:view.selected,page:'workpapers',paper:form,filter:route.filter,stage:route.stage});
 const listFilters=(filter:WorkspaceFilter,stage:string)=>present({...route,filter,stage},'replace');
 const availablePapers=(view.papers??[]).filter(p=>engagement?.active||p.stage===1&&p.template);
 const paper=availablePapers.find(p=>p.form===route.paper);
 const selectedEvidence=(view.evidence??[]).find(e=>e.id===evidenceId);
 const registers=(parts:string[])=><PilotRegisters key={(view.selected??'firm')+'/'+parts.join('-')} sectionsOnly={parts} role={view.role} resources={view} evidence={view.evidence??[]} engagementId={view.selected} active={!!engagement?.active} run={run} onError={setError}/>;
 const showContext=(id:string)=>{setEvidenceId(id);setContextOpen(true);};
 const analysis=(p:Paper)=>!sealed&&view.selected&&(view.fieldwork?.includes(p.form)||!!view.samples?.[p.form]||!!view.journals?.[p.form])?<>
   <SampleDesk population={view.population} sample={view.samples?.[p.form]} paper={p} role={view.role} engagement={view.selected} evidence={view.evidence??[]} findings={(view.fieldFindings??[]).filter(f=>f.form===p.form&&f.id.startsWith('SAMPLE-'))} run={run}/>
   <JournalDesk population={view.population} journal={view.journals?.[p.form]} paper={p} role={view.role} engagement={view.selected} evidence={view.evidence??[]} findings={(view.fieldFindings??[]).filter(f=>f.form===p.form&&f.id.startsWith('JOURNAL-'))} run={run}/>
   <AreaDesk population={view.population} area={view.areas?.[p.form]} paper={p} role={view.role} engagement={view.selected} through={engagement?.reportDate??''} evidence={view.evidence??[]} findings={(view.fieldFindings??[]).filter(f=>f.form===p.form&&f.id.startsWith('AREA-'))} run={run}/>
 </>:undefined;
 return <WorkspaceShell view={view} route={route} navigate={next=>void navigate(next)} query={query} setQuery={setQuery} busy={busy} dirty={dirty} refresh={()=>{if(allowLeave())void send(pilotScope(view.selected));}} logout={()=>{if(allowLeave())void send('/logout',{});}} canLeave={allowLeave}>
  {error&&<div className="ew-error" role="alert"><b>Үйлдэл дуусаагүй</b><p>{error}</p><small>Оруулсан мэдээллээ шалгана уу. Шинэчлэхээс өмнө хадгалаагүй хариултаа хуулж авах боломжтой.</small><button type="button" aria-label="Мэдэгдэл хаах" onClick={()=>setError('')}><X size={16}/></button></div>}
  <fieldset disabled={busy} className="feature-fields" onChangeCapture={event=>{const form=(event.target as HTMLElement).closest('form');if(form){dirtyForm.current=form;setDirty(true);dirtyRef.current=true;}}} onSubmitCapture={event=>{submittingForm.current=event.target as HTMLFormElement;}}>
   {(route.page==='home'||route.page==='overview')&&<WorkOverview view={view} open={openPaper} go={go}/>}
   {(route.page==='clients'||!engagement&&route.page==='home')&&<EngagementPicker view={view} open={(id,form)=>void openEngagement(id,form)}/>}
   {!engagement&&route.page==='clients'&&view.intake&&<PilotIntake data={view.intake} role={view.role} run={run} open={id=>void openEngagement(id)}/>}
   {route.page==='library'&&<>{!engagement?<PilotFormLibrary role={view.role} forms={view.forms} library={view.formLibrary} run={run} onError={setError} onDraftChange={templateDraft}/>:<section className="ew-panel ew-panel-pad"><h2>Гэрээт ажилд маягт холбох</h2><p>Баталсан хувилбарыг энэ ажлын хүрээнд сонгоно. Шинээр зохиох болон нийтлэх ажил фирмийн санд хийгдэнэ.</p><button className="btn secondary space-top" onClick={()=>void navigate({engagement:null,page:'library',paper:null})}>Фирмийн маягтын сан нээх</button></section>}{engagement&&!sealed&&view.role!=='preparer'&&<AdoptPilotForm forms={view.forms.filter(f=>!view.extended||!view.programmes.some(p=>p.id===f.id)||view.papers?.some(p=>p.form===f.id&&p.planning?.template.number===undefined)&&view.fieldwork?.includes(f.id))} library={view.formLibrary} pins={Object.fromEntries((view.papers??[]).flatMap(p=>p.template?[[p.form,p.template.number]]:[]))} run={run} engagementId={view.selected!}/>}</>}
   {route.page==='people'&&<>{view.roster&&<RosterOverview roster={view.roster} open={id=>void openEngagement(id)}/ >}{view.staffing&&<EngagementStaffing staffing={view.staffing} role={view.role} sealed={sealed} run={run}/>}</>}
   {route.page==='admin'&&registers(['firm'])}
   {engagement&&<>
    {route.page==='overview'&&<>     <section className="card pad bench-card">
      <div className="section-heading"><h2>{engagement.client}</h2><span className="pill">{engagement.active?'Идэвхтэй':'Идэвхжүүлэхийг хүлээж байна'}</span></div>
      <p>{engagement.period.start} — {engagement.period.end} · Зорилтот тайлан {engagement.reportDate}</p>
      {view.members&&<EngagementAccess members={view.members} run={run}/>}
      {view.staffing&&<EngagementStaffing staffing={view.staffing} role={view.role} sealed={sealed} run={run}/>}
      {view.intakeContext&&<IntakeProvenance context={view.intakeContext} active={engagement.active} role={view.role}
       priorVisible={view.portfolio.some(p=>p.id===view.intakeContext?.prior)} run={run} open={id=>void openEngagement(id)}/>}
      {view.intakeContext&&!sealed&&<AcceptanceDesk state={view.acceptance} role={view.role} evidence={view.evidence??[]} run={run}/>}
      {view.selected&&view.intakeContext&&!sealed&&<TermsEditor id={view.selected} role={view.role} active={engagement.active}
       amendable={view.intakeTermsAmendable} canDraft={view.intakeTermsCanDraft}
       terms={view.intakeTerms} history={view.intakeTermsHistory??[]} evidence={view.evidence??[]} run={run} acceptance={view.acceptance} context={view.intakeContext}/>}
      {!!engagement.acceptanceGaps.length&&<ul>{engagement.acceptanceGaps.map(gap=><li key={gap}>{gap}</li>)}</ul>}
      {engagement.firm.find(r=>r.kind==='M01-F01')&&<p className="micro">Хүлээн авахад ашигласан фирмийн бүртгэл · {engagement.firm.find(r=>r.kind==='M01-F01')?.values.reporting}</p>}
      {!engagement.active&&(view.role==='partner'?<ActionForm run={run} action="activate" button="Шийдвэр бүртгэж идэвхжүүлэх">
       <label>Хараат бус байдлын шийдвэрийн ишлэл<input name="independence" required/></label>
       {!view.intakeContext&&<label>Тохиролцсон захидлын хувилбар<input name="letter" required/></label>}
       <label>Хүлээн авах шийдвэрийн үндэслэл<textarea name="assessment" required/></label>
      </ActionForm>:<p className="muted">Партнер шийдвэрээ бүртгэсний дараа баримт болон ажлын хэсэг нээгдэнэ.</p>)}
      {engagement.active&&<details><summary>Хүлээн авах шийдвэрийн түүх</summary>{engagement.decisions.map(d=><p key={d.version}>v{d.version} · {d.assessment||d.letter||d.independence} · {new Date(d.at).toLocaleString()}</p>)}</details>}
     </section>
{registers(['acceptance'])}</>}
    {route.page==='workpapers'&&(route.paper?<>
     <div className="ew-paper-toolbar"><button className="btn secondary" onClick={()=>void navigate({...route,page:'workpapers',paper:null})}><ArrowLeft size={15}/>Ажлын жагсаалт</button><span>{paper?'Хадгалсан v'+paper.version:''}{dirty?' · Хадгалаагүй өөрчлөлт':''}</span><button className="btn secondary" aria-expanded={contextOpen} onClick={()=>setContextOpen(v=>!v)}><PanelRightOpen size={16}/>Нотлох баримт</button></div>
     {paper?<div className={'ew-paper-layout '+(contextOpen?'with-context':'')}><Workpaper key={paper.id+'/'+paper.version} paper={paper} run={run} role={view.role} evidence={sealed?[]:view.evidence} sealed={sealed} active={engagement.active} engagementId={view.selected} staffing={view.staffing} sampling={analysis(paper)} unsaved={dirty}/>{contextOpen&&(selectedEvidence?<EvidencePreview file={selectedEvidence} engagement={view.selected} onClose={()=>{setEvidenceId('');setContextOpen(false);}}/>:<aside className="ew-paper-context"><h2>Холбоотой эх баримт</h2><p>Баримтын хувилбарыг сонгож, агуулгыг нь ажлын хажууд үзнэ.</p>{(view.evidence??[]).filter(e=>!query||e.name.toLowerCase().includes(query.toLowerCase())).map(e=><button className="ew-context-file" key={e.id} onClick={()=>showContext(e.id)}><FileText size={16}/><span>{e.name}<small>v{e.version} · {paper.evidence.includes(e.id)?'Энэ ажилд холбогдсон':e.source}</small></span></button>)}</aside>)}</div>:<WorkspaceEmpty title="Энэ ажлын баримт боломжгүй" description="Хандах эрх, хэрэглэх нөхцөл эсвэл баримтын дугаарыг шалгана уу."/>}
     {paper&&<div className="ew-next-paper"><span>Дараагийн баримтыг нээх нь энэ ажлыг илгээхгүй.</span><button className="btn secondary" disabled={availablePapers.indexOf(paper)>=availablePapers.length-1} onClick={()=>openPaper(availablePapers[availablePapers.indexOf(paper)+1].form)}>Дараагийн баримт<ArrowRight size={15}/></button></div>}
    </>:<>{!sealed&&view.role!=='preparer'&&<div className="ew-list-actions"><span>Холбогдсон эх болон баталсан маягтууд</span><button className="btn secondary" onClick={()=>go('library')}>Маягт холбох</button></div>}<WorkpaperIndex view={{...view,papers:availablePapers}} query={query} open={openPaper} routeFilter={route.filter} routeStage={route.stage} onFiltersChange={listFilters}/></>)}
    {route.page==='evidence'&&<><div className={'ew-paper-layout '+(contextOpen&&selectedEvidence?'with-context':'')}><EvidenceLibraryView view={view} query={query} preview={showContext}/>{contextOpen&&selectedEvidence&&<EvidencePreview file={selectedEvidence} engagement={view.selected} onClose={()=>{setEvidenceId('');setContextOpen(false);}}/>}</div>{!sealed&&<><SupportingEvidence view={view} run={run} onError={setError}/><Requests view={view} run={run} onError={setError}/></>}</>}
    {route.page==='data'&&(engagement.active&&!sealed?<><DataMethodsDesk data={view.dataMethods} role={view.role} evidence={view.evidence??[]} run={run}/><PopulationDesk dataMethods={view.dataMethods} key={view.population?.current.version} population={view.population} role={view.role} engagement={view.selected!} evidence={view.evidence??[]} run={run} readFile={readEvidence} onError={setError} requestImport={(view.requests??[]).some(r=>r.extract&&r.dispatch==='issued')}/><section className="ew-panel ew-panel-pad"><h2>Ажилтай холбогдсон шинжилгээ</h2><p>Түүвэр, журнал болон салбарын шинжилгээг тухайн ажлын баримтаас нээнэ.</p><div className="ew-analysis-links">{availablePapers.filter(p=>view.fieldwork?.includes(p.form)||view.samples?.[p.form]||view.areas?.[p.form]).map(p=><button key={p.id} onClick={()=>openPaper(p.form)}><FileText size={17}/><span>{p.form} · {p.title}</span><ArrowRight size={16}/></button>)}</div></section></>:<WorkspaceEmpty title={sealed?'Архивын эх хувилбарыг ашиглана':'Идэвхжүүлэх шийдвэр шаардлагатай'} description="Өгөгдөл боловсруулах эрх нь гэрээт ажлын одоогийн төлөвөөс хамаарна."/>)}
    {route.page==='planning'&&<><PlanningDesk resources={view} role={view.role} sealed={sealed} run={run}/>{registers(['planning'])}{!sealed&&<Delivery view={view} run={run} openPaper={id=>{const p=view.papers?.find(p=>p.id===id||p.form===id);if(p)openPaper(p.form);}}/>}{view.staffing&&<EngagementStaffing staffing={view.staffing} role={view.role} sealed={sealed} run={run}/>}</>}
    {route.page==='review'&&<><WorkpaperIndex key="review" view={view} query={query} open={openPaper} mode="review" routeFilter={route.filter} routeStage={route.stage} onFiltersChange={listFilters}/>      {view.impacts?.map(impact=><section className="card pad bench-card" key={impact.id}><h2>{impact.source} · Өөрчлөлтийн нөлөө</h2><p>{impact.reason} · {impact.targets.join(', ')}</p>
       {view.role==='reviewer'&&<ActionForm run={run} action="resolve-impact" extra={{id:impact.id}} button="Нөлөөллийн үнэлгээг бүртгэх"><label>Шийдвэрийн үндэслэл<input name="reason" required/></label></ActionForm>}
      </section>)}
{view.oversight&&<OversightDesk view={view.oversight} role={view.role} sealed={sealed} archive={view.archive.packages[0]?.id} run={run}/>}</>}
    {route.page==='completion'&&<>{engagement.active&&!sealed&&view.completion&&<CompletionDesk data={view.completion} role={view.role} papers={view.papers??[]} evidence={view.evidence??[]} engagement={view.selected!} run={run}/ >}{registers(['fieldwork','completion'])}      <section className="card pad bench-card">
       <h2>Партнерын багцын зөвшөөрөл</h2>
       {(view.extended||view.completion?.management||view.archive.reopened?.target)&&view.role==='partner'&&!sealed&&<ActionForm key={engagement.reportDate} run={run} action="report-date" button="Зорилтот тайлангийн өдрийг шинэчлэх">
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
        {(!sealed&&!view.gaps?.length||view.authorized?.current&&view.authorized.artifactSha256)&&<a className="btn secondary" href={api+'/report'+pilotScope(view.selected)}>{view.authorized?.current?'Зөвшөөрсөн тайлан татах':'Хянах тайлан татах'}</a>}
        {view.authorized&&<a href={api+'/authorizations'+pilotScope(view.selected)} className="btn secondary">Зөвшөөрлийн түүх татах ({view.authorized.count})</a>}
       </div>}
       {view.role==='partner'&&view.authorized?.current&&(!view.archive.packages.length||view.archive.reopened)&&<>
        {view.release?.strict&&!view.release.signature&&<button type="button" className="btn secondary" onClick={()=>void run('report-sign')}>Яг энэ тайланд локал гарын үсэг зурах</button>}
        {view.release?.signature&&<p>Локал гарын үсэг · {view.release.signature.at.slice(0,16)} · {view.release.signature.artifact.slice(0,16)}</p>}
        <ActionForm run={run} action="issue" button="Гаргалтыг бүртгэх"><label>Бодит гаргалтын бүртгэлийн ишлэл<input name="reference" required/></label></ActionForm>
        {view.archive.issue&&view.release?.signature&&<ActionForm run={run} action="delivery-start" button="Локал хүргэлтийн холбоос үүсгэх">
         <label>Хянасан хүлээн авагч<select name="recipient" required><option value="">Сонгох</option>
          {view.requestContacts?.map(contact=><option key={contact.id} value={contact.id}>{contact.name} · {contact.email}</option>)}
         </select></label>
        </ActionForm>}
        {view.deliveryLink&&<p><a href={'/pilot#delivery='+view.deliveryLink.token} target="_blank" rel="noopener noreferrer">Хүлээн авагчийн холбоос</a> · {view.deliveryLink.recipient}</p>}
        {view.release?.deliveries.map(d=><div className="bench-item" key={d.id}><b>{d.recipient} · {d.received?'Хүлээн авсан '+d.received.slice(0,16):(deliveryStates[d.state]??d.state)}</b><p>{d.response}</p>
         {d.events?.map((event,i)=><p className="micro" key={i}>{event.at.slice(0,16)} · {event.reference} · {event.reason}</p>)}
         {!sealed&&d.issued===view.archive.issue?.at&&['pending','unknown'].includes(d.state)&&<details><summary>Хүргэлтийн бодит үр дүн бүртгэх</summary><ActionForm run={run} action="delivery-result" extra={{id:d.id}} button="Үр дүн хадгалах"><label>Үр дүн<select name="state"><option value="failed">Амжилтгүйг баталгаажуулсан</option><option value="unknown">Өмнөх оролдлогын үр дүн тодорхойгүй</option><option value="withdrawn">Энэ хүлээн авагчийн хүргэлтийн шаардлагыг цуцалсан</option></select></label><label>Бодит эх баримт эсвэл эрхийн ишлэл<input name="reference" required/></label><label>Тодруулсан үр дүн, дараагийн эзэн ба үндэслэл<textarea name="reason" required/></label></ActionForm></details>}
        </div>)}
        {view.archive.issue&&<button type="button" className="btn secondary space-top"
         disabled={view.release?.strict&&!view.release.deliveries.some(d=>d.issued===view.archive.issue?.at&&d.state==='received')}
         onClick={()=>void run('archive-seal')}>Гаргасан багцыг архивт түгжих</button>}
       </>}
      </section>
</>}
    {route.page==='archive'&&<><AssemblyDesk data={view.assembly} sealed={sealed}/>{registers(['archive'])}{view.role==='partner'&&(!!view.laterFacts?.length||sealed&&view.release?.strict)&&<LaterFactsDesk facts={view.laterFacts??[]} packageId={sealed?view.archive.packages[0]?.id:undefined} engagement={view.selected!} papers={view.papers??[]} run={run} readFile={readEvidence} onError={setError}/ >}{view.oversight&&<OversightDesk view={view.oversight} role={view.role} sealed={sealed} archive={view.archive.packages[0]?.id} run={run}/>}</>}
   </>}
   {!engagement&&!['home','clients','library','people','admin','history'].includes(route.page)&&<WorkspaceEmpty title="Гэрээт ажлаа сонгоно уу" description="Дээд хэсгийн жагсаалтаас ажиллах гэрээт ажлаа сонгоно."/>}
   {route.page==='history'&&<section className="ew-panel ew-panel-pad"><h2>Үйлдлийн түүх</h2>{view.activity?.map(a=><article className="ew-activity" key={a.id}><span className="ew-activity-dot"/><div><b>{names[a.by]??a.by}</b><p>{a.text}</p><small>{new Date(a.at).toLocaleString('mn-MN')}</small></div></article>)}{!view.activity?.length&&<WorkspaceEmpty title="Үйлдлийн түүх алга" description="Хадгалсан үйлдлүүд хариуцсан хүн, огноотойгоор энд харагдана."/>}</section>}
  </fieldset>
 </WorkspaceShell>;
}

function ConfirmationRecipient({token}:{token:string}){
 const [details,setDetails]=useState<{request:string;part:string;recipient:string;contact:string;requiresScopeConfirmation?:boolean;scope?:{entity:string;start:string;end:string;evidenceType:string}}|null>(null);
 const [error,setError]=useState(''),[sent,setSent]=useState(false),[busy,setBusy]=useState(false);
 const path=api+'/confirmation/'+token;
 useEffect(()=>{
  let active=true;
  fetch(path,{cache:'no-store'}).then(async response=>{
   const result=await response.json();
   if(!response.ok)throw Error(result.error);
   if(active)setDetails(result);
  }).catch(e=>{if(active)setError(e.message);});
  return ()=>{active=false;};
 },[path]);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError('');
  try{
   const data=new FormData(e.currentTarget),file=await readEvidence(data.get('file'));
   const res=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({...file,response:String(data.get('response')),scopeConfirmed:data.get('scopeConfirmed')==='on'?'yes':''})});
   if(!res.ok)throw Error((await res.json()).error);
   setSent(true);
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 return <main className="audit-app"><div className="app-content pilot-content"><section className="card pad bench-card">
  <h1>Локал баталгаажуулалтын хариу</h1>
  {error&&<p className="callout amber" role="alert">{error}</p>}
  {sent?<p>Хариу болон эх файлыг аудитын багт бүртгэлээ.</p>:details&&<>
   <p>{details.request} · {details.part}</p><p>{details.contact} · {details.recipient}</p>
   <form className="feature-form" onSubmit={submit}>
    {details.requiresScopeConfirmation&&<label><input name="scopeConfirmed" type="checkbox" required/>Миний бодит хариу {details.scope?.entity} · {details.scope?.start}–{details.scope?.end} · {details.scope?.evidenceType} хүрээнд хамаарна. Энэ локал холбоос банк / этгээдийн таних баталгаа биш.</label>}
    <label>Хариу<textarea name="response" maxLength={4000} required/></label>
    <label>Баталгаажуулах эх файл<input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv" required/></label>
    <button className="btn primary" disabled={busy}>Хариу өгөх</button>
   </form>
  </>}
 </section></div></main>;
}

export default function PilotWorkspace(){
 const [route,setRoute]=useState<string|null>(null);
 useEffect(()=>{
  const read=()=>setRoute(window.location.hash);
  read();
  window.addEventListener('hashchange',read);
  return ()=>window.removeEventListener('hashchange',read);
 },[]);
 if(route===null)return null;
 const confirmation=/^#confirmation=([a-f0-9]{64})$/.exec(route)?.[1], delivery=/^#delivery=([a-f0-9]{64})$/.exec(route)?.[1];
 if(confirmation)return <ConfirmationRecipient token={confirmation}/>;
 if(delivery)return <ReportRecipient token={delivery}/>;
 if(route==='#oversight=quality'||route==='#oversight=custodian'){
  const role=route==='#oversight=quality'?'quality':'custodian';
  return <IndependentDesk key={role} role={role}/>;
 }
 return <SharedPilotWorkspace/>;
}
