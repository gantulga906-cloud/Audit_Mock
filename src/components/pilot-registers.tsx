import {useState,type FormEvent} from 'react';
import {latestArchiveSelection,pilotScope,registers,roleChoices,sections,type PilotRecord,type PilotRole,type ProgrammeBasis,type RegisterField,type RecordStatus} from '@/lib/pilot-registers';
import type {Evidence} from '@/lib/workspace';
import type {PopulationView} from '@/lib/pilot-population';

export type PilotAction=(action:string,fields?:Record<string,string>)=>Promise<boolean>;
type NamedForm={id:string;title:string};
type ArchiveItem={
 id:string;previous?:string;issued:string;sealed:string;digest?:string;synthetic:number;disposed:number;holds:number;
 summary:{client:string;fileCount:number;files?:{id:string;name:string;version:number;sha256:string}[]};
 retention?:{policy:string;package:string;expires:string};
 access?:{actor:PilotRole;at:string;reason:string;scope:string}[];
};
export type RegisterResources={
 registers:PilotRecord[];forms:NamedForm[];programmes:NamedForm[];
 rules:{id:string;form:string;matches:boolean;outcome:string;basis:string}[];
 programmeTemplates?:Record<string,{version:string;procedures:{key:string;label:string}[]}[]>;
 population?:PopulationView;
 archive:{sealed?:boolean;packages:ArchiveItem[];reopened:{package?:string;basis:string;reportDate?:string;target?:{form:string;version:number}}|null;issue:{at:string;reference:string}|null};
 extended:boolean;
};
const state:Record<RecordStatus,string>={draft:'Ноорог',submitted:'Хяналтад',returned:'Засварт',approved:'Баталсан'};
const roleName=Object.fromEntries(roleChoices);
const rulesText:Record<string,string>={required:'Заавал',optional:'Сонголтоор',excluded:'Хамаарахгүй'};
const latestPackageLabel='Одоогийн түгжсэн багц';
const pinnedPackageLabel='Хүсэлтээр сонгосон түгжээтэй багц';
const spec=(kind:string)=>registers.find(r=>r.id===kind);
const heading=(r:PilotRecord)=>Object.values(r.values).find((v,i)=>v&&spec(r.kind)?.fields[i]?.type!=='record')||r.kind;
const canReview=(r:PilotRecord,role:PilotRole)=>spec(r.kind)?.approvers.includes(role)&&r.status==='submitted'&&
 (r.kind==='M04-F04'?r.declaration?.by!==role:r.owner!==role);

const programmeFields=['approach','templateVersion','procedure','nature','timing','extent'];
export function PlanningBasis({basis}:{basis:ProgrammeBasis}){
 const {risk,materiality,reliance,procedure}=basis;
 const levels:Record<string,string>={none:'Найдахгүй',partial:'Хэсэгчлэн',full:'Бүрэн',na:'Хамаарахгүй'};
 return <div className="space-top">
  <p><b>{risk.name}</b> · v{risk.version} · {risk.target} · {risk.assertion}</p>
  <p>{risk.response}</p>
  {materiality&&<p>1.3 · v{materiality.version} · Нийт {materiality.overall.toLocaleString()} · Гүйцэтгэл {materiality.performance.toLocaleString()} · Илт бага {materiality.trivial.toLocaleString()}{materiality.source?' · '+materiality.source:''}</p>}
  {reliance&&<p>2.6 · v{reliance.version} · {levels[reliance.level]??reliance.level} · {reliance.basis}</p>}
  {procedure&&<dl className="register-values">
   <div><dt>Төлөвлөсөн горим · {procedure.key}</dt><dd>{procedure.label}</dd></div>
   <div><dt>Шинж</dt><dd>{procedure.nature}</dd></div>
   <div><dt>Хугацаа</dt><dd>{procedure.timing}</dd></div>
   <div><dt>Хамрах хүрээ</dt><dd>{procedure.extent}</dd></div>
  </dl>}
 </div>;
}

function Editor({kind,row,resources,evidence,run,onDone}:{
 kind:string;row?:PilotRecord;resources:RegisterResources;evidence:Evidence[];run:PilotAction;onDone:()=>void;
}){
 const def=spec(kind)!;
 const [values,setValues]=useState<Record<string,string>>(row?.values??{});
 const planning=kind==='M07-F01';
 const sourceLines=resources.population?.usable?resources.population.current.bridge:[];
 const selectedForm=resources.rules.find(r=>r.id===values.rule)?.form;
 const templates=resources.programmeTemplates?.[selectedForm??'']??[];
 const set=(key:string,value:string)=>setValues(v=>{
  const next={...v,[key]:value};
  if(planning&&key==='rule'){next.risk='';next.templateVersion='';next.procedure='';}
  if(planning&&key==='templateVersion')next.procedure='';
  return next;
 });
 function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const fields=Object.fromEntries(Object.entries(values).map(([key,value])=>['field.'+key,value]));
  void run('register',{kind,id:row?.id??'',operation:'save',...fields}).then(ok=>{if(ok)onDone();});
 }
 function options(field:RegisterField):readonly (readonly [string,string])[]|undefined{
  if(field.type==='choice')return field.choices;
  if(planning&&field.key==='templateVersion')return templates.map(t=>[t.version,t.version==='source'?'Эх маягт':'Баталсан v'+t.version]);
  if(planning&&field.key==='procedure')return (templates.find(t=>t.version===values.templateVersion)?.procedures??[]).map(p=>[p.key,p.key+' · '+p.label]);
  if(kind==='M06-F06'&&field.key==='populationLine')return sourceLines.map(l=>[l.line,l.line+' · '+l.computed/100]);
  if(field.type==='record')return resources.registers.filter(r=>r.kind===field.target&&r.id!==row?.id&&r.status==='approved'&&!r.stale&&
   (!planning||field.key!=='rule'||resources.rules.some(rule=>rule.id===r.id&&rule.matches))&&
   (!planning||field.key!=='risk'||r.values.programme===selectedForm)).map(r=>[r.id,heading(r)+' · v'+r.version]);
  if(field.type==='programme'||field.type==='form')return (field.type==='programme'?resources.programmes:resources.forms).map(f=>[f.id,f.id+' · '+f.title]);
  if(field.type==='evidence')return evidence.map(e=>[e.id,e.name+' · v'+e.version]);
  if(field.key==='package'){
   const packages=resources.archive.packages.map(p=>[p.id,p.summary.client+' · '+p.sealed.slice(0,16)+' · '+p.id.slice(0,8)] as const);
   if(kind==='M12-F07'&&resources.archive.sealed)return [[latestArchiveSelection,row?pinnedPackageLabel:latestPackageLabel],...packages];
   if(packages.length)return packages;
  }
  if(field.key==='evidenceId')return resources.archive.packages.find(p=>p.id===values.package)?.summary.files?.map(f=>[f.id,f.name+' · v'+f.version]);
  if(kind==='M12-F08'&&values.type==='release'&&field.key==='reference')return resources.registers.filter(r=>r.kind===kind&&r.values.package===values.package&&r.values.type==='hold').map(r=>[r.id,r.values.reference]);
 }
 return <form className="feature-form" onSubmit={save}>
  <div className="field-grid">{def.fields.filter(f=>(!f.forTypes||f.forTypes.includes(values.type))&&
   (!planning||!programmeFields.includes(f.key)||resources.extended&&values.decision==='adopt')).map(f=>{
   const choices=options(f),bound=kind==='M06-F06'&&!!values.populationLine&&['source','actual'].includes(f.key);
   const line=bound?sourceLines.find(l=>l.line===values.populationLine):undefined;
   const v=line?(f.key==='actual'?String(line.computed/100):resources.population!.current.name):(values[f.key]??'');
   return <label key={f.key}>{f.label}{f.optional&&!(planning&&programmeFields.includes(f.key))&&!(kind==='M12-F04'&&f.forTypes)?' (сонголтоор)':''}
    {choices?<select value={v} onChange={e=>set(f.key,e.target.value)}>
     <option value="">Сонгох</option>
     {v&&!choices.some(([id])=>id===v)&&<option value={v}>Өмнөх сонголт · {v}</option>}
     {choices.map(([id,label])=><option key={id} value={id}>{label}</option>)}
    </select>:f.type==='long'?<textarea value={v} onChange={e=>set(f.key,e.target.value)} maxLength={4000}/>:<input value={v} readOnly={bound} onChange={e=>set(f.key,e.target.value)} type={f.type==='date'?'date':f.type==='number'?'number':'text'} step={f.type==='number'?'any':undefined} maxLength={4000}/>}
   </label>;
  })}</div>
  {planning&&resources.extended&&values.decision==='adopt'&&<p className="micro">Шийдвэрийг илгээхийн өмнө арга хандлага, хувилбар, горимын шинж, хугацаа, хамрах хүрээг бүрэн оруулна уу.</p>}
  <div className="row-actions"><button className="btn primary">Ноорог хадгалах</button><button type="button" className="btn secondary" onClick={onDone}>Болих</button></div>
 </form>;
}

function Reason({action,label,source=false}:{action:(reason:string,source:string)=>void;label:string;source?:boolean}){
 return <form className="feature-form" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);action(String(data.get('reason')),String(data.get('source')??''));}}>
  <label>{label}<textarea name="reason" maxLength={4000} required/></label>
  {source&&<label>Гадаад мэдүүлгийн эх ишлэл<input name="source" required/></label>}
  <button className="btn secondary">{label} хадгалах</button>
 </form>;
}

function RecordCard({row,role,resources,evidence,run,edit,open,exportArchive,engagementId,readOnly}:{
 row:PilotRecord;role:PilotRole;resources:RegisterResources;evidence:Evidence[];run:PilotAction;edit:()=>void;
 open:(id:string)=>void;exportArchive:(id:string)=>void;engagementId:string|null;readOnly:boolean;
}){
 const def=spec(row.kind)!;
 const command=(operation:string,reason='',source='')=>void run('register',{kind:row.kind,id:row.id,operation,reason,source});
 const submitted=row.status==='submitted',draft=['draft','returned'].includes(row.status);
 const canEdit=!readOnly&&def.writers.includes(role)&&row.owner===role&&!submitted&&!(def.section==='archive'&&row.status==='approved');
 const declaration=row.kind==='M04-F04';
 const related=resources.registers.filter(r=>r.id!==row.id&&Object.values(r.values).includes(row.id));
 const archiveGrant=row.status==='approved'&&['M12-F07','M12-F10'].includes(row.kind);
 return <details className="feature-detail">
  <summary>{heading(row)} <span className="pill">{state[row.status]} · v{row.version}</span>{row.stale&&<span className="pill amber">Эх хувилбар өөрчлөгдсөн</span>}</summary>
  <dl className="register-values">{def.fields.filter(f=>row.values[f.key]).map(f=>{
   const v=row.values[f.key],file=f.type==='evidence'&&evidence.find(e=>e.id===v),linked=f.type==='record'&&resources.registers.find(r=>r.id===v);
   const fileLabel=file?file.name+' · v'+file.version:'';
   const display=f.key==='package'&&v===latestArchiveSelection?pinnedPackageLabel:f.choices?.find(([key])=>key===v)?.[1]??v;
   return <div key={f.key}><dt>{f.label}</dt><dd>{file?(resources.archive.packages.length&&!resources.archive.reopened?fileLabel:<a href={'/api/pilot/evidence/'+file.id+pilotScope(engagementId)}>{fileLabel}</a>):linked?<button type="button" className="quiet" onClick={()=>open(linked.id)}>{heading(linked)} · {linked.kind}</button>:display}</dd></div>;
  })}</dl>
  {row.template&&<p className="micro">{row.template.form} · {row.template.sheet} · {row.template.digest.slice(0,16)}</p>}
  {row.programmeBasis&&<PlanningBasis basis={row.programmeBasis}/>}
  {row.statementVersion&&<p className="micro">Санхүүгийн тайлан v{row.statementVersion}</p>}
  {row.values.expected&&row.values.actual&&<p>Зөрүү {Number(row.values.actual)-Number(row.values.expected)}</p>}
  {row.declaration&&<p>{roleName[row.declaration.by]} · {new Date(row.declaration.at).toLocaleString()} · {row.declaration.text} {row.declaration.evidence}</p>}
  {declaration&&!row.declaration&&<p className="muted">Мэдүүлэг хүлээгдэж байна.</p>}
  {declaration&&draft&&(row.values.assignee===role||row.values.assignee==='external'&&row.owner===role)&&<Reason label="Мэдүүлэг" source={row.values.assignee==='external'} action={(text,source)=>command('declare',text,source)}/>}
  {row.kind==='M08-F07'&&<><Reason label="Баримтын хэлэлцүүлэг" action={text=>command('reply',text)}/>{row.discussion?.map((r,i)=><p key={i}>{roleName[r.by]} · {r.text} · {new Date(r.at).toLocaleString()}</p>)}</>}
  {row.verification&&<p>{row.verification.restored?'Сэргээх шалгалт':'Бүрэн байдлын шалгалт'} · {row.verification.ok?row.verification.files+' файл · '+row.verification.digest?.slice(0,16):row.verification.error}</p>}
  {row.eligibility&&<p>Хугацаа дууссан өдөр {row.eligibility.expires} · {row.executedAt?'Агуулгын хуулбарыг устгасан':'Шийдвэрийн бүртгэл'}</p>}
  {row.successor&&<p>Үүсгэсэн дараагийн багц {row.successor}</p>}
  {row.revoked&&<p>Хандалт цуцалсан · {new Date(row.revoked.at).toLocaleString()} · {row.revoked.reason}</p>}
  <div className="row-actions space-top">
   {canEdit&&<button type="button" className="btn secondary" onClick={edit}>Бүртгэл засах</button>}
   {!readOnly&&row.owner===role&&draft&&<button type="button" className="btn primary" disabled={declaration&&!row.declaration} onClick={()=>command('submit')}>v{row.version} хувилбар илгээх</button>}
   {archiveGrant&&!row.revoked&&row.values.accessor===role&&<button type="button" className="btn secondary" onClick={()=>exportArchive(row.id)}>Зөвшөөрсөн багцыг татах</button>}
   {row.kind==='M12-F11'&&role==='partner'&&row.status==='approved'&&!row.executedAt&&row.eligibility?.synthetic&&<button type="button" className="btn secondary" onClick={()=>void run('archive-dispose',{id:row.id})}>Зохиомол архивын устгалыг хэрэгжүүлэх</button>}
  </div>
  {archiveGrant&&!row.revoked&&role==='partner'&&<Reason label="Хандалт цуцлах шалтгаан" action={reason=>command('revoke',reason)}/>}
  {!readOnly&&canReview(row,role)&&<div className="field-grid">
   <Reason label="Батлах үндэслэл" action={reason=>command('approve',reason)}/>
   <Reason label="Буцаах шалтгаан" action={reason=>command('return',reason)}/>
  </div>}
  {related.length>0&&<div className="row-actions space-top">{related.map(r=><button type="button" className="quiet" key={r.id} onClick={()=>open(r.id)}>{r.kind} · {heading(r)}</button>)}</div>}
  <details className="feature-detail"><summary>Хувилбарын түүх ({row.history.length})</summary>{row.history.map((h,i)=><details key={i}><summary>v{h.version} · {state[h.status]} · {roleName[h.by]} · {h.reason}</summary><p>{new Date(h.at).toLocaleString()}</p><dl className="register-values">{def.fields.filter(f=>h.values[f.key]).map(f=><div key={f.key}><dt>{f.label}</dt><dd>{f.choices?.find(([key])=>key===h.values[f.key])?.[1]??h.values[f.key]}</dd></div>)}</dl>
   {h.template&&<p className="micro">{h.template.form} · {h.template.sheet} · {h.template.digest.slice(0,16)}</p>}
   {h.programmeBasis&&<PlanningBasis basis={h.programmeBasis}/>}
  </details>)}</details>
 </details>;
}

export default function PilotRegisters({role,resources,evidence,engagementId,active,run,onError}:{
 role:PilotRole;resources:RegisterResources;evidence:Evidence[];engagementId:string|null;active:boolean;run:PilotAction;onError:(message:string)=>void;
}){
 const [section,setSection]=useState(engagementId?'acceptance':'firm'),[kind,setKind]=useState(''),[editId,setEdit]=useState<string|null>(null),[focus,setFocus]=useState(''),[unit,setUnit]=useState('');
 const available=sections.filter(([key])=>key==='firm'||key==='acceptance'&&engagementId||active);
 const current=available.some(([key])=>key===section)?section:'firm';
 const group=registers.filter(r=>r.section===current),def=group.find(r=>r.id===kind)??group[0];
 const readOnly=!!engagementId&&current==='firm';
 const data=resources.registers.filter(r=>r.kind===def.id&&(def.id!=='M01-F03'||!unit||r.values.unit===unit||r.id===focus))
  .sort((a,b)=>a.id===focus?-1:b.id===focus?1:0);
 const queue=resources.registers.filter(r=>(!engagementId||spec(r.kind)?.section!=='firm')&&
  (canReview(r,role)||r.kind==='M04-F04'&&r.values.assignee===role&&!r.declaration||r.owner===role&&r.status==='returned'));
 function open(id:string){
  const row=resources.registers.find(r=>r.id===id),target=row&&spec(row.kind);
  if(target){setSection(target.section);setKind(target.id);setEdit(null);setFocus(id);}
 }
 async function exportArchive(id:string){
  try{
   const res=await fetch('/api/pilot/archive-export/'+id+pilotScope(engagementId),{method:'POST'});
   const bundle=await res.json();
   if(!res.ok)throw Error(bundle.error);
   const url=URL.createObjectURL(new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'}));
   const link=document.createElement('a');link.href=url;link.download='audit-'+bundle.scope+'-'+bundle.id+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){onError((e as Error).message);}
 }
 const editing=data.find(r=>r.id===editId);
 return <section className="card pad bench-card" id="registers">
  <h2>Аудитын бүртгэл ба шийдвэр</h2>
  {queue.length>0&&<div className="row-actions space-top">{queue.slice(0,10).map(r=><button key={r.id} type="button" className="btn secondary" onClick={()=>open(r.id)}>{r.kind} · {heading(r)} · {state[r.status]}</button>)}</div>}
  <nav aria-label="Аудитын бүртгэлийн хэсэг" className="tabs space-top">{available.map(([key,label])=><button key={key} type="button" className={current===key?'active':''} onClick={()=>{setSection(key);setEdit(null);setFocus('');}}>{label}</button>)}</nav>
  {current==='planning'&&resources.rules.length>0&&<div className="space-top">{resources.rules.map(r=><p key={r.id}>{r.form} · {rulesText[r.outcome]} · {r.matches?'Тохирсон':'Тохироогүй'} · {r.basis}</p>)}</div>}
  {current==='archive'&&<div className="space-top">
   {resources.archive.issue&&<p>Гаргалтын бүртгэл · {resources.archive.issue.reference} · {new Date(resources.archive.issue.at).toLocaleString()}</p>}
   {resources.archive.reopened&&<p>Агуулгын өөрчлөлт нээлттэй · {resources.archive.reopened.basis}
    {resources.archive.reopened.target&&' · Дахин хянах ажил '+resources.archive.reopened.target.form+' · Өмнөх v'+resources.archive.reopened.target.version}
    {resources.archive.reopened.reportDate&&' · Баталсан тайлангийн өдөр '+resources.archive.reopened.reportDate}</p>}
   {resources.archive.packages.map(p=><details className="feature-detail" key={p.id}><summary>{p.summary.client} · {p.sealed.slice(0,16)} · {p.disposed?'Агуулга устгасан':'Түгжсэн'}</summary>
    <p>{p.id} · {p.summary.fileCount} файл · {p.holds} идэвхтэй хориг</p>{p.digest&&<p className="micro">SHA-256 {p.digest}</p>}
    {p.retention&&<p>Хадгалалтын эцсийн өдөр {p.retention.expires}{p.retention.package!==p.id&&' · Өмнөх багцын бодлого'}</p>}
    {p.access?.map((a,i)=><p key={i}>{roleName[a.actor]} · {a.scope} · {a.reason} · {new Date(a.at).toLocaleString()}</p>)}
   </details>)}
  </div>}
  <label className="space-top">Эх шаардлага<select value={def.id} onChange={e=>{setKind(e.target.value);setEdit(null);setFocus('');}}>{group.map(r=><option value={r.id} key={r.id}>{r.id} · {r.label}</option>)}</select></label>
  {def.id==='M01-F03'&&<label>Нэгжээр шүүх<select value={unit} onChange={e=>setUnit(e.target.value)}><option value="">Бүх нэгж</option>{resources.registers.filter(r=>r.kind==='M01-F02'&&r.status==='approved').map(r=><option value={r.id} key={r.id}>{r.values.name}</option>)}</select></label>}
  {readOnly&&<p className="muted">Энэ бүртгэлийг гэрээт ажлын жагсаалтаас нээж өөрчилнө.</p>}
  {!readOnly&&def.writers.includes(role)&&editId===null&&<button type="button" className="btn secondary space-top" onClick={()=>setEdit('new')}>Шинэ бүртгэл</button>}
  {editId!==null&&<Editor key={def.id+'/'+editId} kind={def.id} row={editing} resources={resources} evidence={evidence} run={run} onDone={()=>setEdit(null)}/>}
  {data.length===0&&editId===null&&<p className="muted">Энэ шаардлагын бүртгэл алга.</p>}
  {data.map(r=><RecordCard key={r.id} row={r} role={role} resources={resources} evidence={evidence} run={run} edit={()=>setEdit(r.id)} open={open} exportArchive={exportArchive} engagementId={engagementId} readOnly={readOnly}/>)}
 </section>;
}
