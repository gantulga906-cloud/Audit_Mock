import {useEffect,useState,type FormEvent} from 'react';
import {pilotScope,type PilotRole} from '@/lib/pilot-registers';
import {CustodyInspectionForm,type CustodyInspection,type CustodyInspectionItem} from './pilot-archive-controls';
import {DataAction} from './pilot-population';
import type {Consultation} from './pilot-completion';
import type {PilotAction} from './pilot-registers';
import type {Note} from '@/lib/workspace';
import type {Evidence,WorkItem} from '@/lib/workspace';

type IndependentRole='quality'|'custodian';
type QualityNote={id:string;text:string;cleared?:{at:string};responses?:{text:string;at:string}[]};
type Quality={policy:{version:number;mode:string;reference:string;basis:string;reviewer:string;eligibility:string;
 eligibilityStatus?:'eligible'|'ineligible'|'unresolved'|'';forms?:string[]};current:boolean;notes:QualityNote[]};
type Custody={id:string;digest:string;recipient:string;offeredAt:string;downloadedAt?:string;accepted?:{at:string;reason:string};returned?:{at:string;reason:string;owner:string};resolution?:string;inspections?:CustodyInspection[];assignment?:{custodian:string;independence:string;location:string;medium:string;confidentiality:string;authority:{id:string;sha256:string}}};
export type OversightView={quality?:Quality;finalQuality?:Quality;custody:Custody[]};
function EligibilityFields({evidence}:{evidence:Evidence[]}){return <><p>Шалгуур бүрийн бодит эх, өмнөх оролцоо ба хэрэглэгдэх дүрмийг тусдаа үнэлнэ.</p>{[['competence','Мэргэшил'],['capability','Чадвар ба бодит цаг'],['authority','Томилох / гүйцэтгэх эрх'],['objectivity','Объектив байдал ба хараат бус нөхцөл']].map(([key,label])=><label key={key}>{label}<select name={key}><option value="unresolved">Тодорхойгүй / хангаагүй</option><option value="supported">Бодит эхээр дэмжсэн</option></select></label>)}<label>Өмнөх оролцоо / cooling-off<select name="coolingOff"><option value="unresolved">Тодорхойгүй</option><option value="satisfied">Хэрэглэх шалгуур хангасан</option><option value="not-applicable">Үндэслэлтэй хамаарахгүй</option></select></label><label>Бодит эрх ба шалгуурын эх<select name="eligibilityEvidence"><option value="">Сонгох / хараахан ирээгүй</option>{evidence.filter(e=>e.status==='accepted').map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label></>;}
function FinalQualityDesk({q,papers,evidence,role,run}:{q?:Quality;papers:WorkItem[];evidence:Evidence[];role:PilotRole;run:PilotAction}){
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const f=new FormData(event.currentTarget),values=Object.fromEntries([...f].filter(([k])=>k!=='scope').map(([k,v])=>[k,String(v)]));void run('quality-final-policy',{...values,forms:JSON.stringify(f.getAll('scope'))});}
 return <details className="feature-detail" data-final-quality><summary>Томилсон R4 эцсийн баталгаа · формал EQR-ээс тусдаа</summary>{role==='partner'&&<form className="feature-form" onSubmit={submit}><div className="field-grid"><label>Томилсон шаардлага<select name="mode" defaultValue={q?.policy.mode??'unresolved'}><option value="unresolved">Тодорхойгүй</option><option value="required">Томилсон хүрээнд шаардлагатай</option><option value="not-required">Энэ хүрээнд томилоогүй</option></select></label><label>Бодлого, хэвлэл ба эрхийн ишлэл<input name="reference" required/></label><label>Томилсон / томилоогүй бодит үндэс<textarea name="basis" required/></label><label>Хянагчийн бодит нэр<input name="reviewer"/></label><label>Шалгуурын шийдвэр<select name="eligibilityStatus"><option value="unresolved">Тодорхойгүй</option><option value="ineligible">Хангаагүй</option><option value="eligible">Бодит эхээр хангадаг</option></select></label><label>Бодит мэргэшил, эрх, өмнөх оролцоо ба цаг<textarea name="eligibility"/></label><EligibilityFields evidence={evidence}/></div><fieldset><legend>Яг томилсон ажлууд</legend>{papers.map(p=><label key={p.form}><span><input type="checkbox" name="scope" value={p.form} defaultChecked={q?.policy.forms?.includes(p.form)}/>{p.form} · {p.title}</span></label>)}</fieldset><button className="btn secondary">Тусдаа эцсийн хяналтын шийдвэр хадгалах</button></form>}
 {q&&<p>v{q.policy.version} · {q.policy.mode} · {q.policy.forms?.join(', ')} · {q.current?'Одоогийн хүрээнд баталсан':'Шийдвэр / бодит хяналт хүлээж байна'}</p>}{q?.notes.map(note=><div key={note.id}><p>{note.text} · {note.cleared?'Тусдаа хаасан':'Нээлттэй'}</p>{!note.cleared&&role!=='preparer'&&<DataAction action="quality-final-response" extra={{id:note.id}} run={run} button="Яг томилсон хүрээнд хариу өгөх"><label>Бодит хариу ба засвар<textarea name="reason" required/></label></DataAction>}</div>)}</details>;
}
export type ReleaseView={strict:boolean;distributionGaps?:string[];signature?:{method:string;at:string;artifact:string};
 deliveries:{id:string;issued:string;recipient:string;state:string;downloaded?:string;received?:string;response?:string;
 events?:{state:string;at:string;actor:string;reference:string;reason:string}[]}[]};
const api='/api/pilot';
const captions={quality:'Хараат бус чанарын хяналт',custodian:'Хараат бус архивын хадгалалт'};

export function OversightDesk({view,role,sealed,archive,run,managed=false,archiveManaged=false,papers=[],evidence=[]}:{view:OversightView;role:PilotRole;sealed:boolean;archive?:string;run:PilotAction;managed?:boolean;archiveManaged?:boolean;papers?:WorkItem[];evidence?:Evidence[]}){
 const q=view.quality;
 const status=q?.policy.mode==='not-required'?'Шийдвэрээр шаардлагагүй':
  q?.policy.mode==='unresolved'?'Хэрэглэх шаардлагыг тогтоогоогүй':
  q?.policy.eligibilityStatus==='ineligible'?'Хянагч шалгуур хангаагүй':
  q?.policy.eligibilityStatus==='unresolved'?'Хянагчийн шалгуурыг шийдээгүй':
  q?.current?'Одоогийн багцыг баталсан':'Хараат бус хяналт хүлээгдэж байна';
 return <details className="card pad bench-card"><summary>Чанарын хяналт ба хадгалалтын хүлээлцэх</summary>
  {!sealed&&role==='partner'&&<DataAction run={run} action="quality-policy" button="Чанарын шийдвэр хадгалах">
   <div className="field-grid">
    {managed&&<h3>Формал EQR хэрэглэх эсэх ба тусдаа шалгуур</h3>}
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
    {managed&&<EligibilityFields evidence={evidence}/>}
   </div>
  </DataAction>}
  {q&&<p>4.6 · v{q.policy.version} · {q.policy.reference} · {status}</p>}
  {managed&&!sealed&&<FinalQualityDesk q={view.finalQuality} papers={papers} evidence={evidence} role={role} run={run}/>}
  {q?.notes.map(note=><div className="bench-item" key={note.id}>
   <p>{note.text} · {note.cleared?'Шийдвэрлэсэн':'Нээлттэй'}</p>
   {note.responses?.map((response,i)=><p key={i}>{response.text}</p>)}
   {!sealed&&!note.cleared&&<DataAction run={run} action="quality-response" extra={{id:note.id}} button="Одоогийн багцад хариу холбох">
    <label>Хариу ба зассан ажлын лавлагаа<input name="reason" required/></label>
   </DataAction>}
  </div>)}
  <a href="/pilot#oversight=quality">{captions.quality}</a>
  {sealed&&role==='partner'&&archive&&(view.custody.at(-1)?.id!==archive||view.custody.at(-1)?.returned)&&<DataAction run={run} action="archive-offer-custody"
   extra={{package:archive}} button="Яг түгжсэн багцыг хүлээлгэх">{archiveManaged&&<><label>Бодит хараат бус хадгалагч<input name="custodianName" required/></label><label>Томилох эрхийн хянасан эх<select name="custodianAuthority" required><option value="">Сонгох</option>{evidence.filter(e=>e.status==='accepted').map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label>{[['independence','Оролцоо, эрх ба бие даасан үүргийн бодит үндэс'],['location','Бодит очих байршил'],['medium','Зөөгч / орчин'],['confidentiality','Нууцлал ба хамгаалалтын нөхцөл']].map(([key,label])=><label key={key}>{label}<textarea name={key} required/></label>)}</>}<label>Хадгалалт хүлээн авагч<input name="recipient" required/></label>{view.custody.at(-1)?.returned&&<label>Зөрчлийг шийдвэрлэсэн бодит ажил ба эх ишлэл<textarea name="resolution" required/></label>}</DataAction>}
  {view.custody.map(c=><p key={c.id+c.offeredAt}>{c.recipient} · {c.accepted?'Хүлээн авсан '+c.accepted.at.slice(0,16):c.returned?'Зөрчилтэй буцаасан · '+c.returned.reason:'Хүлээн авахыг хүлээж байна'} · {c.digest.slice(0,16)}</p>)}
  <p><a href="/pilot#oversight=custodian">{captions.custodian}</a></p>
 </details>;
}

type IndependentView={
 role:IndependentRole;managedArchive?:boolean;archiveRestrictions?:{holds:number;retention?:{status?:string;expires?:string}};inspectionItems?:CustodyInspectionItem[];custodyReadable?:boolean;managed?:boolean;formalAvailable?:boolean;finalQuality?:Quality;finalMaterial?:IndependentView['material'];assignments:{id:string;client:string}[];selected?:string;quality?:Quality;custody?:Custody;
 material?:{basis:string;gaps:string[];artifact:{form:string;sha256:string};reportDate:string;
  laterFact?:{discovered:string;knownAtReport:string;impactReason:string;procedures:string;authority:string;advice:string};
  consultations:Consultation[];
  papers:{form:string;title:string;version:number;status:string;values:Record<string,string>;notes?:Note[]}[];
  evidence:{id:string;name:string;sha256:string}[]};
 manifest?:{fileCount:number;files:{name:string;sha256:string;size:number}[];report:string};
 manifestError?:string;
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
 const [reviewKind,setReviewKind]=useState('formal');
 const confirmation=reviewKind==='confirmation'||!view?.formalAvailable&&!!view?.finalMaterial,selectedQuality=confirmation?view?.finalQuality:view?.quality;
 const material=confirmation?(view?.finalMaterial??view?.material):view?.material,custody=view?.custody;
 const link=(item:string)=>api+'/oversight/download/'+item+pilotScope(view?.selected??null);
 const act:PilotAction=(action,values={})=>send('/action'+pilotScope(view?.selected??null),{...values,...(role==='quality'&&{reviewKind:confirmation?'confirmation':'formal'}),action});
 function login(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  void send('/login',{role,password:String(new FormData(e.currentTarget).get('password'))});
 }
 return <main className="audit-app ew-independent"><div className="app-content pilot-content"><section className="card pad bench-card">
  <a href="/pilot#workspace">Аудитын багийн ажлын орчин</a><h1>{captions[role]}</h1>
  {error&&<p className="callout amber" role="alert">{error}</p>}
  <fieldset className="feature-fields" disabled={busy}>
   {!view?<form className="feature-form" onSubmit={login}><label>Хараат бус нууц үг<input name="password" type="password" required/></label>
    <button className="btn primary">Нэвтрэх</button></form>:<>
    <button type="button" className="btn secondary" onClick={()=>void send('/logout',{})}>Гарах</button>
    {view.assignments.map(item=><button type="button" key={item.id} className="btn secondary" onClick={()=>void send(pilotScope(item.id))}>{item.client}</button>)}
    {!view.assignments.length&&<p>Томилсон ажил алга.</p>}
    {material&&<>{view.finalMaterial&&view.formalAvailable&&<label>Хянах тусдаа үүрэг<select value={reviewKind} onChange={e=>setReviewKind(e.target.value)}><option value="formal">Формал EQR</option><option value="confirmation">Томилсон эцсийн баталгаа</option></select></label>}<h2>{confirmation?'Томилсон ажлын эцсийн баталгаа':'Формал EQR'}</h2>
     <p>{material.artifact.form} · {material.reportDate} · {selectedQuality?.current?'Одоогийн баталсан хяналт':'Хяналт шаардлагатай'}</p>
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
     {selectedQuality?.notes.map(n=><div key={n.id}><p>{n.text} · {n.cleared?'Тусдаа хаасан':'Нээлттэй'}</p>{n.responses?.map((r,i)=><p key={i}>{r.text}</p>)}{!n.cleared&&!!n.responses?.length&&<DataAction action="clear" extra={{basis:material.basis,id:n.id,responseVersion:String(n.responses.length)}} run={act} button="Яг энэ хариуг хараат бусаар хаах"><label>Хариу, бодит засвар ба үлдсэн асуудлыг хянасан нь<textarea name="reason" required/></label></DataAction>}</div>)}
     <DataAction run={act} action="return" extra={{basis:material.basis}} button="Тодорхой засварт буцаах"><label>Тэмдэглэл<textarea name="reason" required/></label></DataAction>
     {!material.gaps.length&&<DataAction run={act} action="approve" extra={{basis:material.basis}} button="Яг энэ багцыг чанарын хувьд батлах">
      {view.managed&&<>{[['workPerformed','Бодитоор гүйцэтгэсэн хяналт'],['judgments','Яг чухал шийдвэр, баримт ба хэлэлцүүлэг'],['conclusion','Бодит дүгнэлт ба үлдсэн хязгаар'],['notice','Бодит дуусгасан мэдэгдэл ба эрх бүхий этгээд']].map(([key,label])=><label key={key}>{label}<textarea name={key} required/></label>)}</>}<label>Хянасан нотолгоо ба шийдвэр<textarea name="reason" required/></label>
     </DataAction>}
    </>}
    {custody&&<>
     {view.manifestError&&<p className="callout amber" role="alert">{view.manifestError}</p>}
     {custody.returned&&<p>Зөрчилтэй буцаасан · {custody.returned.reason} · Хариуцах баг {custody.returned.owner}</p>}
     {custody.resolution&&<p>Дахин хүргүүлсэн шийдвэр · {custody.resolution}</p>}
     {view.manifest&&<>
     <p>{custody.recipient} · {view.manifest.fileCount} эх файл · {custody.accepted?'Хүлээн авсан':'Хүлээлгэн өгсөн'}</p>
     <p className="micro break-all">SHA-256 {custody.digest}</p><a href={link(custody.id)}>Яг баталгаажсан архив татах</a>
     <ul>{view.manifest.files.map((f,i)=><li key={i}>{f.name} · {f.size} B · {f.sha256.slice(0,16)}</li>)}</ul>
     {view.archiveRestrictions&&<p>Үргэлжилсэн хориг · {view.archiveRestrictions.holds} · Хадгалалт · {view.archiveRestrictions.retention?.status==='confirmed'?view.archiveRestrictions.retention.expires:'Хэрэглэх шаардлага шийдээгүй · хэвээр хадгална'}</p>}
     {view.managedArchive&&custody.assignment&&<><p>{custody.assignment.custodian} · {custody.assignment.location} · {custody.assignment.medium}</p><p>{custody.assignment.independence} · {custody.assignment.confidentiality}</p><a href={link(custody.assignment.authority.id)}>Томилох эрхийн бодит эх</a></>}
     {view.managedArchive&&!custody.returned&&view.inspectionItems&&<CustodyInspectionForm key={custody.id+'/'+custody.offeredAt+'/'+(custody.inspections?.at(-1)?.version??0)} items={view.inspectionItems} packageId={custody.id} digest={custody.digest} run={act} latest={custody.inspections?.at(-1)}/>}
     {view.managedArchive&&custody.accepted&&!view.custodyReadable&&<p className="callout amber">Өмнөх хүлээн авалтын түүх хадгалагдсан. Одоогийн шалгалтад уншигдахгүй / боломжгүй бүрдэл үлдсэн.</p>}
     {!custody.accepted&&!custody.returned&&<DataAction run={act} action="accept" extra={{package:custody.id}} button="Бүрэн багцыг хүлээн авах">
      <label>Татсан багцын хэш<input name="digest" required/></label><label>Унших боломж ба хүлээн авсан тэмдэглэл<input name="reason" required/></label>
     </DataAction>}
     </>}
     {!custody.accepted&&!custody.returned&&<DataAction run={act} action="return" extra={{package:custody.id,digest:custody.digest}} button="Багцыг зөрчилтэй буцаах"><label>Зөрчил ба хийх засвар<textarea name="reason" required/></label><label>Засвар хариуцах баг<select name="owner"><option value="partner">Партнер</option><option value="reviewer">Ахлах хянагч</option></select></label></DataAction>}
    </>}
   </>}
  </fieldset>
 </section></div></main>;
}

export function ReportRecipient({token}:{token:string}){
 const path='/delivery/'+token;
 type Recipient={contact:string;recipient:string;form:string;sha256:string;packageSha256?:string;statements?:{sha256:string};notes?:{sha256:string}};
 const [data,setData]=useState<Recipient|null>(null);
 const [error,setError]=useState(''),[sent,setSent]=useState(false);
 useEffect(()=>{jsonRequest<Recipient>(path).then(setData).catch(e=>setError(e.message));},[path]);
 const receive:PilotAction=async(_,fields={})=>{
  try{await jsonRequest(path,fields);setSent(true);setError('');return true;}
  catch(e){setError((e as Error).message);return false;}
 };
 return <main className="audit-app ew-independent"><div className="app-content pilot-content"><section className="card pad bench-card">
  <h1>Локал гарын үсэгтэй тайлан хүлээн авах</h1>
  {error&&<p className="callout amber" role="alert">{error}</p>}
  {sent?<p>Яг энэ тайлангийн хүлээн авалтыг бүртгэлээ.</p>:data&&<>
   <p>{data.contact} · {data.recipient} · {data.form}</p><p className="micro break-all">SHA-256 {data.sha256}</p>
   <a className="btn secondary" href={api+path+'/artifact'}>Тайлан татах</a>
   {data.packageSha256&&<><p className="micro break-all">Яг багц SHA-256 {data.packageSha256}</p><p>Хүлээн авалтаас өмнө тайлан, бүтэн СТ ба тодруулгыг тус бүр татаж шалгана.</p><a className="btn secondary" href={api+path+'/statements'}>Бүтэн санхүүгийн тайлан татах</a><p className="micro break-all">SHA-256 {data.statements?.sha256}</p><a className="btn secondary" href={api+path+'/notes'}>Тодруулга татах</a><p className="micro break-all">SHA-256 {data.notes?.sha256}</p></>}
   <DataAction run={receive} action="receive" extra={{sha256:data.sha256,...(data.packageSha256&&{packageSha256:data.packageSha256})}} button="Хүлээн авснаа бүртгэх">
    <label>Хүлээн авсан тэмдэглэл<input name="response" required/></label>
   </DataAction>
  </>}
 </section></div></main>;
}
