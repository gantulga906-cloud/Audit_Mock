import {useState} from 'react';
import {CircleAlert,Check,Download,ShieldCheck} from 'lucide-react';
import {advanceCustody,authorizationCurrent,authorizeReport,bindStatements,currentRelease,issueReport,personById,recordDistribution,reportGaps,resolveFinding,saveStatements,setEngagementDecision,verifyPosting,type Engagement,type Model} from '@/lib/workspace';

type Props={model:Model;eng:Engagement;mutate:(fn:(m:Model)=>void)=>void;open:(form:string)=>void;download:(name:string,value:unknown)=>void};

export function DecisionEditor({eng,mutate,open}:Props){
 const [assessment,setAssessment]=useState(''),[letter,setLetter]=useState(''),[independence,setIndependence]=useState(''),[decision,setDecision]=useState<Engagement['acceptance']>(eng.acceptance);
 const actual=eng.decisions?.at(-1);
 return <div className="journey-grid">
  <section className="card pad journey-card">
   <span className="eyebrow">1.4.3 / 1.4.5</span><h2>Шийдвэрийн эх баримтууд</h2>
   <label>Хараат бус байдлын шийдвэрийн ишлэл<input placeholder="Жишээ: 1.4.5 v2 · үнэлгээний дугаар" value={independence} onChange={e=>setIndependence(e.target.value)}/></label>
   <div className="row-actions"><button className="btn secondary" disabled={eng.locked||!independence.trim()} onClick={()=>mutate(m=>setEngagementDecision(m,'independence',true,independence))}>Хараат бус байдлыг бүртгэх</button><button className="quiet" disabled={eng.locked||!eng.independence} onClick={()=>mutate(m=>setEngagementDecision(m,'independence',false))}>Дахин үнэлэх</button></div>
   <p className="micro">{actual?.independence||'Шийдвэр хүлээгдэж буй'}</p>
   <label>Тохиролцсон захидлын хувилбар<input placeholder="Жишээ: 1.4.3 v1 · захидлын дугаар" value={letter} onChange={e=>setLetter(e.target.value)}/></label>
   <div className="row-actions"><button className="btn secondary" disabled={eng.locked||!letter.trim()} onClick={()=>mutate(m=>setEngagementDecision(m,'termsAgreed',true,letter))}>Захидлын хувилбар бүртгэх</button><button className="quiet" disabled={eng.locked||!eng.termsAgreed} onClick={()=>mutate(m=>setEngagementDecision(m,'termsAgreed',false))}>Тохиролцоог дахин нээх</button></div>
   <p className="micro">{actual?.letter||'Тохиролцоо хүлээгдэж буй'}</p>
  </section>
  <section className="card pad journey-card">
   <span className="eyebrow">1.4.1 / 1.4.2</span><h2>Хүлээн авах шийдвэр</h2>
   <label>Шийдвэр<select value={decision} onChange={e=>setDecision(e.target.value as Engagement['acceptance'])}><option value="pending">Хүлээгдэж буй</option><option value="accepted">Хүлээн авах / үргэлжлүүлэх</option><option value="conditional">Нөхцөлтэй</option><option value="declined">Татгалзах</option></select></label>
   <label>Шийдвэрийн үндэслэл, хувилбар<textarea value={assessment} onChange={e=>setAssessment(e.target.value)}/></label>
   <button className="btn primary" disabled={eng.locked||(decision!=='pending'&&!assessment.trim())} onClick={()=>mutate(m=>setEngagementDecision(m,'acceptance',decision,assessment))}>Шийдвэр хадгалах</button>
   <button className="quiet space-top" onClick={()=>open('1.1.1')}>1.1.1 · Холбогдсон маягт</button>
   <details><summary>Шийдвэрийн хувилбарууд ({eng.decisions?.length??0})</summary>{eng.decisions?.map(d=><p className="micro" key={d.version}>v{d.version} · {d.decision} · {d.assessment} · {d.letter} · {d.independence} · {personById(d.by).name}</p>)}</details>
  </section>
 </div>;
}

export function ReleaseEditor({model,eng,mutate,open,download}:Props){
 const [statements,setStatements]=useState(eng.statements?.statements??''),[notes,setNotes]=useState(eng.statements?.notes??''),[resolutions,setResolutions]=useState<Record<string,string>>({});
 const [postings,setPostings]=useState<Record<string,string>>({});
 const role=personById(model.person).role,partner=role==='partner',gaps=reportGaps(model,eng.id),authorized=authorizationCurrent(model,eng),release=currentRelease(model,eng);
 const paper=model.work[`${eng.id}/4.1.A1`],findings=model.findings.filter(f=>f.engagement===eng.id);
 return <>
  <div className="journey-grid">
   <section className="card pad journey-card"><span className="eyebrow">4.1.A1 · БАГЦЫН ХУВИЛБАР</span><h2>Тайлан, СТ ба тодруулга</h2>
    <p className="muted">Тайлангийн ажил v{paper.version} · Холбосон СТ v{eng.reportFsVersion} · Одоогийн СТ v{eng.fsVersion}</p>
    {role!=='quality'&&<div className="row-actions"><button className="quiet" onClick={()=>open('4.1.A1')}>4.1.A1 · Тайлан</button><button className="quiet" onClick={()=>open('4.4')}>4.4 · Дуусгалт</button></div>}
    <label>Санхүүгийн тайлангийн демо агуулга<textarea readOnly={!partner||eng.locked} value={statements} onChange={e=>setStatements(e.target.value)}/></label>
    <label>Тодруулгын демо агуулга<textarea readOnly={!partner||eng.locked} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
    {partner&&<div className="row-actions"><button className="btn secondary" disabled={eng.locked||!statements.trim()||!notes.trim()||(statements===eng.statements?.statements&&notes===eng.statements?.notes)} onClick={()=>mutate(m=>saveStatements(m,statements,notes))}>СТ ба тодруулгын шинэ хувилбар</button><button className="btn secondary" disabled={eng.locked||eng.reportFsVersion===eng.fsVersion} onClick={()=>mutate(bindStatements)}>Одоогийн СТ-г холбох</button></div>}
   </section>
   <section className="card pad journey-card"><span className="eyebrow">ЗӨВШӨӨРӨЛ → ГАРГАЛТ</span><h2>Гаргалтын бэлэн байдал</h2>
    <div className="readiness-list">{gaps.map(g=><div key={g}><CircleAlert size={16}/><span>{g}</span></div>)}{!gaps.length&&<div className="text-green"><Check size={16}/>Сонгосон демо шаардлага хангагдсан</div>}</div>
    <p className={eng.authorized&&!authorized?'text-amber':'muted'}>{authorized?'Одоогийн багц зөвшөөрөгдсөн':eng.authorized?'Багц өөрчлөгдсөн · Өмнөх зөвшөөрөл үйлчлэхгүй':'Багцын зөвшөөрөл хүлээгдэж буй'}</p>
    <p className="micro">{eng.formalEqr?'Формал EQR нь энэ багцын тусдаа шаардлага':'Формал EQR шаардахгүй (демо нөхцөл)'}</p>
    {partner&&<div className="row-actions"><button className="btn secondary" disabled={eng.locked||authorized||!!gaps.length} onClick={()=>mutate(authorizeReport)}><ShieldCheck size={16}/>Яг энэ багцыг зөвшөөрөх</button><button className="btn primary" disabled={eng.locked||!!gaps.length||!authorized||!!release} onClick={()=>mutate(issueReport)}>{release?'Одоогийн багц гарсан':'Гаргалт бүртгэх'}</button></div>}
    {release&&eng.recipients.map((r,i)=><div className="recipient" key={r.name}><div><b>{r.name}</b><small>{r.status}</small></div>{partner&&<button className="quiet" onClick={()=>mutate(m=>recordDistribution(m,i,r.status==='failed'?'delivered':'failed'))}>Демо оролдлого бүртгэх</button>}</div>)}
    <details><summary>Зөвшөөрөл ба гаргалтын түүх</summary>{eng.authorizationHistory?.map((a,i)=><div key={i} className="timeline-caption"><span>{a.at} · Тайлангийн ажил v{a.package?.paper.version} / СТ v{a.fs}</span><button className="quiet" onClick={()=>download(`authorization-${eng.id}-${i+1}.json`,a)}>Харах / татах</button></div>)}{eng.releaseHistory?.map((r,i)=><div key={i} className="timeline-caption"><span>{r.issuedAt} · Гаргасан</span><button className="quiet" onClick={()=>download(`release-${eng.id}-${i+1}.json`,r)}>Багц татах</button></div>)}</details>
   </section>
  </div>
  {role!=='quality'&&<section className="card pad space-top journey-card"><h2>Илрүүлэлт ба шийдвэр</h2><p className="muted">Зөвшөөрсөн боловч баталгаажаагүй бичилт үлдэгдэлд хэвээр. Партнерын шийдвэр нь бичилт баталгаажуулсан гэсэн үг биш.</p>
   {findings.map(f=><div className="journey-part" key={f.id}><b>{f.title} · {f.amount.toLocaleString()} MNT</b><p className="micro">{f.resolution||f.qualitative||'Шийдвэр хүлээгдэж буй'}</p><button className="quiet" onClick={()=>open(f.form)}>{f.form} · Эх ажил</button>
    {partner&&!eng.locked&&<><div className="field-grid"><label>Шийдвэрийн үндэслэл<input value={resolutions[f.id]??f.resolution??''} onChange={e=>setResolutions({...resolutions,[f.id]:e.target.value})}/></label><button className="btn secondary" disabled={!resolutions[f.id]?.trim()} onClick={()=>mutate(m=>resolveFinding(m,f.id,resolutions[f.id]))}>Илрүүлэлтийн шийдвэр хадгалах</button></div><div className="field-grid"><label>Баталгаажсан бичилтийн ишлэл<input value={postings[f.id]??f.evidence} onChange={e=>setPostings({...postings,[f.id]:e.target.value})}/></label><button className="btn secondary" disabled={!postings[f.id]?.trim()} onClick={()=>mutate(m=>verifyPosting(m,f.id,postings[f.id]))}>Бичилт баталгаажуулах</button></div></>}
   </div>)}
  </section>}
 </>;
}

export function ArchiveEditor({model,eng,mutate,download,open}:Props){
 const release=currentRelease(model,eng);
 return <section className="card pad journey-card"><span className="eyebrow">5.1 · ГАРГАСАН БАГЦ</span><h2>Бүрдүүлэлт ба хүлээлцэх</h2>
  <p className="muted">{release?`Тайлангийн ажил v${release.package?.paper.version} · СТ v${release.fs} · ${release.issuedAt}`:'Одоогийн багцын гаргалт алга.'}</p>
  <p>{eng.locked?'Түгжээтэй':'Нээлттэй'} · {({none:'Шилжүүлээгүй',offered:'Хүлээн авалт хүлээгдэж буй',accepted:'Хадгалалтад хүлээн авсан'})[eng.custody]} · {eng.hold?'Хадгалалтын хориг идэвхтэй':'Хадгалалтын хориг бүртгэгдээгүй'}</p>
  <div className="row-actions"><button className="btn secondary" disabled={!release} onClick={()=>download(`manifest-${eng.id}.json`,{engagement:eng.id,release,locked:eng.locked,custody:eng.custody,hold:eng.hold})}><Download size={15}/>Гаргасан багцын manifest</button>
  <button className="btn secondary" disabled={!release||eng.locked} onClick={()=>mutate(m=>advanceCustody(m,'lock'))}>Багцыг түгжих</button>
  <button className="btn secondary" disabled={!release||!eng.locked||eng.custody!=='none'} onClick={()=>mutate(m=>advanceCustody(m,'offer'))}>Хадгалалтад санал болгох</button>
  <button className="btn primary" disabled={!release||eng.custody!=='offered'} onClick={()=>mutate(m=>advanceCustody(m,'accept'))}>Хүлээн авалтыг бүртгэх</button></div>
  <button className="quiet space-top" onClick={()=>open('5.1')}>5.1 · Эх шалгах хуудас</button>
 </section>;
}
