import {useEffect,useState,type FormEvent} from 'react';
import {pilotScope,type PilotRole} from '@/lib/pilot-registers';
import {DataAction} from './pilot-population';
import type {Consultation} from './pilot-completion';
import type {PilotAction} from './pilot-registers';
import type {Note} from '@/lib/workspace';

type IndependentRole='quality'|'custodian';
type QualityNote={id:string;text:string;cleared?:{at:string};responses?:{text:string;at:string}[]};
type Quality={policy:{version:number;mode:string;reference:string;basis:string;reviewer:string;eligibility:string;
 eligibilityStatus?:'eligible'|'ineligible'|'unresolved'|''};current:boolean;notes:QualityNote[]};
type Custody={id:string;digest:string;recipient:string;offeredAt:string;downloadedAt?:string;accepted?:{at:string;reason:string}};
export type OversightView={quality?:Quality;custody:Custody[]};
export type ReleaseView={strict:boolean;signature?:{method:string;at:string;artifact:string};
 deliveries:{id:string;issued:string;recipient:string;state:string;downloaded?:string;received?:string;response?:string}[]};
const api='/api/pilot';
const captions={quality:'Хараат бус чанарын хяналт',custodian:'Хараат бус архивын хадгалалт'};

export function OversightDesk({view,role,sealed,archive,run}:{view:OversightView;role:PilotRole;sealed:boolean;archive?:string;run:PilotAction}){
 const q=view.quality;
 const status=q?.policy.mode==='not-required'?'Шийдвэрээр шаардлагагүй':
  q?.policy.mode==='unresolved'?'Хэрэглэх шаардлагыг тогтоогоогүй':
  q?.policy.eligibilityStatus==='ineligible'?'Хянагч шалгуур хангаагүй':
  q?.policy.eligibilityStatus==='unresolved'?'Хянагчийн шалгуурыг шийдээгүй':
  q?.current?'Одоогийн багцыг баталсан':'Хараат бус хяналт хүлээгдэж байна';
 return <details className="card pad bench-card"><summary>Чанарын хяналт ба хадгалалтын хүлээлцэх</summary>
  {!sealed&&role==='partner'&&<DataAction run={run} action="quality-policy" button="Чанарын шийдвэр хадгалах">
   <div className="field-grid">
    <label>Шаардлага<select name="mode" defaultValue={q?.policy.mode??'unresolved'}>
     <option value="unresolved">Тодорхойгүй</option><option value="required">Заавал</option><option value="not-required">Шаардлагагүй</option>
    </select></label>
    <label>Хэрэглэх бодлого, хэвлэл<input name="reference" defaultValue={q?.policy.reference} required/></label>
    <label>Шийдвэрийн үндэслэл<input name="basis" defaultValue={q?.policy.basis} required/></label>
    <label>Заавал үед санал болгосон хянагч<input name="reviewer" defaultValue={q?.policy.reviewer}/></label>
    <label>Хянагчийн шалгуурын шийдвэр<select name="eligibilityStatus" defaultValue={q?.policy.eligibilityStatus||'unresolved'}>
     <option value="unresolved">Тодорхойгүй</option><option value="eligible">Шалгуур хангасан</option><option value="ineligible">Шалгуур хангаагүй</option>
    </select></label>
    <label>Мэргэшил, эрх, хараат бус байдал, өмнөх оролцоо ба цаг<input name="eligibility" defaultValue={q?.policy.eligibility}/></label>
   </div>
  </DataAction>}
  {q&&<p>4.6 · v{q.policy.version} · {q.policy.reference} · {status}</p>}
  {q?.notes.map(note=><div className="bench-item" key={note.id}>
   <p>{note.text} · {note.cleared?'Шийдвэрлэсэн':'Нээлттэй'}</p>
   {note.responses?.map((response,i)=><p key={i}>{response.text}</p>)}
   {!sealed&&!note.cleared&&<DataAction run={run} action="quality-response" extra={{id:note.id}} button="Одоогийн багцад хариу холбох">
    <label>Хариу ба зассан ажлын лавлагаа<input name="reason" required/></label>
   </DataAction>}
  </div>)}
  <a href="/pilot#oversight=quality">{captions.quality}</a>
  {sealed&&role==='partner'&&archive&&view.custody.at(-1)?.id!==archive&&<DataAction run={run} action="archive-offer-custody"
   extra={{package:archive}} button="Яг түгжсэн багцыг хүлээлгэх"><label>Хадгалалт хүлээн авагч<input name="recipient" required/></label></DataAction>}
  {view.custody.map(c=><p key={c.id}>{c.recipient} · {c.accepted?'Хүлээн авсан '+c.accepted.at.slice(0,16):'Хүлээн авахыг хүлээж байна'} · {c.digest.slice(0,16)}</p>)}
  <p><a href="/pilot#oversight=custodian">{captions.custodian}</a></p>
 </details>;
}

type IndependentView={
 role:IndependentRole;assignments:{id:string;client:string}[];selected?:string;quality?:Quality;custody?:Custody;
 material?:{basis:string;gaps:string[];artifact:{form:string;sha256:string};reportDate:string;
  laterFact?:{discovered:string;knownAtReport:string;impactReason:string;procedures:string;authority:string;advice:string};
  consultations:Consultation[];
  papers:{form:string;title:string;version:number;status:string;values:Record<string,string>;notes?:Note[]}[];
  evidence:{id:string;name:string;sha256:string}[]};
 manifest?:{fileCount:number;files:{name:string;sha256:string;size:number}[];report:string};
};

async function jsonRequest<T>(path:string,fields?:Record<string,string>):Promise<T>{
 const result=await fetch(api+path,fields?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)}:{cache:'no-store'});
 const body=await result.json();
 if(!result.ok)throw Error(body.error);
 return body;
}

export function IndependentDesk({role}:{role:IndependentRole}){
 const [view,setView]=useState<IndependentView|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function send(path:string,fields?:Record<string,string>){
  setBusy(true);setError('');
  try{
   const next=await jsonRequest<IndependentView>('/oversight'+path,fields);
   setView(path==='/logout'||next.role!==role?null:next);
   return true;
  }catch(e){setError((e as Error).message);return false;}finally{setBusy(false);}
 }
 useEffect(()=>{jsonRequest<IndependentView>('/oversight').then(next=>{if(next.role===role)setView(next);}).catch(()=>{});},[role]);
 const material=view?.material,custody=view?.custody;
 const link=(item:string)=>api+'/oversight/download/'+item+pilotScope(view?.selected??null);
 const act:PilotAction=(action,values={})=>send('/action'+pilotScope(view?.selected??null),{...values,action});
 function login(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  void send('/login',{role,password:String(new FormData(e.currentTarget).get('password'))});
 }
 return <main className="audit-app"><div className="app-content pilot-content"><section className="card pad bench-card">
  <a href="/pilot#workspace">Аудитын багийн ажлын орчин</a><h1>{captions[role]}</h1>
  {error&&<p className="callout amber" role="alert">{error}</p>}
  <fieldset className="feature-fields" disabled={busy}>
   {!view?<form className="feature-form" onSubmit={login}><label>Хараат бус нууц үг<input name="password" type="password" required/></label>
    <button className="btn primary">Нэвтрэх</button></form>:<>
    <button type="button" className="btn secondary" onClick={()=>void send('/logout',{})}>Гарах</button>
    {view.assignments.map(item=><button type="button" key={item.id} className="btn secondary" onClick={()=>void send(pilotScope(item.id))}>{item.client}</button>)}
    {!view.assignments.length&&<p>Томилсон ажил алга.</p>}
    {material&&<>
     <p>{material.artifact.form} · {material.reportDate} · {view.quality?.current?'Одоогийн баталсан хяналт':'Хяналт шаардлагатай'}</p>
     <p className="micro break-all">SHA-256 {material.artifact.sha256}</p><a href={link('report')}>Хянах тайлан татах</a>
     {!!material.gaps.length&&<ul>{material.gaps.map(gap=><li key={gap}>{gap}</li>)}</ul>}
     <details className="feature-detail"><summary>Холбоотой ажлын хувилбар, дүгнэлт, нотолгоо</summary>
      {material.laterFact&&<div><h2>Гаргалтын дараах нөхцөл</h2><p>{material.laterFact.discovered} · {material.laterFact.knownAtReport} · {material.laterFact.impactReason}</p>
       <p>{material.laterFact.procedures} · {material.laterFact.authority} · {material.laterFact.advice}</p></div>}
      {material.papers.map(p=><details key={p.form}><summary>{p.form} · {p.title} · v{p.version}</summary>
       <p>{p.values.execution}</p><p>{p.values.conclusion}</p>
       {p.notes?.map(note=><div key={note.id}><p>{note.text} · {note.cleared?'Шийдвэрлэсэн':'Нээлттэй'}</p>
        {note.decisions?.map((decision,i)=><p key={i}>{decision.at.slice(0,16)} · Ажил v{decision.workVersion} · Хариу v{decision.responseVersion} · {decision.reason}</p>)}
       </div>)}
      </details>)}
      {material.consultations.map(row=><details key={row.id}><summary>{row.title} · {row.form} v{row.paper}</summary>
       <p>{row.scope}</p><p>{row.decision?.reason}</p></details>)}
      {material.evidence.map(file=><p key={file.id}><a href={link(file.id)}>{file.name}</a> · {file.sha256.slice(0,16)}</p>)}
     </details>
     {view.quality?.notes.map(n=><div key={n.id}><p>{n.text}</p>{n.responses?.map((r,i)=><p key={i}>{r.text}</p>)}</div>)}
     <DataAction run={act} action="return" extra={{basis:material.basis}} button="Тодорхой засварт буцаах"><label>Тэмдэглэл<textarea name="reason" required/></label></DataAction>
     {!material.gaps.length&&<DataAction run={act} action="approve" extra={{basis:material.basis}} button="Яг энэ багцыг чанарын хувьд батлах">
      <label>Хянасан нотолгоо ба шийдвэр<textarea name="reason" required/></label>
     </DataAction>}
    </>}
    {custody&&view.manifest&&<>
     <p>{custody.recipient} · {view.manifest.fileCount} эх файл · {custody.accepted?'Хүлээн авсан':'Хүлээлгэн өгсөн'}</p>
     <p className="micro break-all">SHA-256 {custody.digest}</p><a href={link(custody.id)}>Яг баталгаажсан архив татах</a>
     <ul>{view.manifest.files.map((f,i)=><li key={i}>{f.name} · {f.size} B · {f.sha256.slice(0,16)}</li>)}</ul>
     {!custody.accepted&&<DataAction run={act} action="accept" extra={{package:custody.id}} button="Бүрэн багцыг хүлээн авах">
      <label>Татсан багцын хэш<input name="digest" required/></label><label>Унших боломж ба хүлээн авсан тэмдэглэл<input name="reason" required/></label>
     </DataAction>}
    </>}
   </>}
  </fieldset>
 </section></div></main>;
}

export function ReportRecipient({token}:{token:string}){
 const path='/delivery/'+token;
 const [data,setData]=useState<{contact:string;recipient:string;form:string;sha256:string}|null>(null);
 const [error,setError]=useState(''),[sent,setSent]=useState(false);
 useEffect(()=>{jsonRequest<{contact:string;recipient:string;form:string;sha256:string}>(path).then(setData).catch(e=>setError(e.message));},[path]);
 const receive:PilotAction=async(_,fields={})=>{
  try{await jsonRequest(path,fields);setSent(true);setError('');return true;}
  catch(e){setError((e as Error).message);return false;}
 };
 return <main className="audit-app"><div className="app-content pilot-content"><section className="card pad bench-card">
  <h1>Локал гарын үсэгтэй тайлан хүлээн авах</h1>
  {error&&<p className="callout amber" role="alert">{error}</p>}
  {sent?<p>Яг энэ тайлангийн хүлээн авалтыг бүртгэлээ.</p>:data&&<>
   <p>{data.contact} · {data.recipient} · {data.form}</p><p className="micro break-all">SHA-256 {data.sha256}</p>
   <a className="btn secondary" href={api+path+'/artifact'}>Тайлан татах</a>
   <DataAction run={receive} action="receive" extra={{sha256:data.sha256}} button="Хүлээн авснаа бүртгэх">
    <label>Хүлээн авсан тэмдэглэл<input name="response" required/></label>
   </DataAction>
  </>}
 </section></div></main>;
}
