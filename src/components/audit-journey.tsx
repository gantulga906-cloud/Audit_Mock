import {issuedRequest} from '@/lib/feature-workflows';
import {useState} from 'react';
import {ArrowRight,CheckCircle2,ChevronRight,Clock3,FileCheck2,GitBranch,ShieldCheck} from 'lucide-react';
import {
 acceptanceGaps,activateEngagement,authorizationCurrent,canEdit,completeEqr,currentRelease,currentSelection,
 isCurrentReview,personById,recordRequestPart,recordSampleTest,reportGaps,resolveQualityConcern,saveIntake,workKey,
 type Engagement,type Model,type ViewId,
} from '@/lib/workspace';

type Props={model:Model;eng:Engagement;mutate:(fn:(m:Model)=>void)=>void;open:(form:string)=>void;go:(view:ViewId)=>void};

export function IntakeEditor({model,eng,mutate,go}:Props){
 const [draft,setDraft]=useState(eng.intake);
 if(!draft||!eng.intake)return null;
 const locked=eng.intake.active||eng.locked;
 return <section className="card pad journey-card">
  <span className="eyebrow">P01 · УРЬДЧИЛСАН БҮРТГЭЛ</span><h2>Аудитын хүсэлт</h2>
  <p className="muted">Тайлант жил тодорхойгүй үед ч хүсэлтийн мэдээллийг хадгалж болно.</p>
  <div className="field-grid">
   <label>Хүсэлтийн эх үүсвэр<select disabled={locked} value={draft.origin} onChange={e=>setDraft({...draft,origin:e.target.value as 'client'|'firm'})}><option value="client">Үйлчлүүлэгчээс</option><option value="firm">Манай фирмээс</option></select></label>
   <div><p className="micro">Тайлант үе: {model.bench?.periods[eng.id]?.start??'Тодорхойгүй'} — {model.bench?.periods[eng.id]?.end??''}</p><button className="quiet" onClick={()=>go('profile')}>Компанийн бүртгэлээс сонгох</button></div>
  </div>
  <label>Холбоо барих хүн<input disabled={locked} value={draft.contact} onChange={e=>setDraft({...draft,contact:e.target.value})}/></label>
  <label>Мэдэгдэж буй мэдээлэл<textarea disabled={locked} value={draft.facts} onChange={e=>setDraft({...draft,facts:e.target.value})}/></label>
  <div className="row-actions">
   <button className="btn secondary" disabled={locked} onClick={()=>mutate(m=>saveIntake(m,draft))}>Хүсэлт хадгалах</button>
   {personById(model.person).role==='partner'&&<><button className="btn secondary" onClick={()=>go('decisions')}>Шийдвэрийн бүртгэл</button><button className="btn primary" disabled={locked} onClick={()=>mutate(activateEngagement)}>Гэрээт ажлыг идэвхжүүлэх</button></>}
  </div>
  <p className="micro space-top">{locked?'Идэвхтэй · Тайлант жил '+eng.period:[...acceptanceGaps(eng),...(!eng.intake.period||!eng.intake.contact.trim()?['Тайлант жил ба холбоо барих хүн']:[])].join(' · ')||'Идэвхжүүлэхэд бэлэн'}</p>
 </section>;
}

export function RequestParts({model,eng,mutate}:Props){
 const r=model.requests.find(r=>r.engagement===eng.id&&!r.dispatch&&r.form==='3.1.2'&&r.parts);
 const [references,setReferences]=useState<Record<string,string>>({});
 const [reasons,setReasons]=useState<Record<string,string>>({});
 if(!r)return null;
 const editable=r.owner===model.person&&eng.intake?.active&&!eng.locked;
 return <section className="card pad journey-card">
  <span className="eyebrow">{r.id} · 3.1.2</span><h2>Хүсэлтийн баримт тус бүр</h2>
  <p className="muted">{r.parts!.filter(p=>p.state==='accepted').length}/{r.expected} үнэлж хүлээн авсан · Эзэн: {personById(r.owner).name} · {r.due}</p>
  {r.parts!.map(p=><div className="journey-part" key={p.id}>
   <div><b>{p.title}</b><p className="micro">{({missing:'Хүлээгдэж буй',received:'Үнэлгээ хүлээж буй',accepted:'Хүлээн авсан',rejected:'Солих шаардлагатай'})[p.state]}{p.evidence?' · '+model.evidence.find(ev=>ev.id===p.evidence)?.name:''}</p>{p.reason&&<p className="text-amber">{p.reason}</p>}</div>
   {editable&&p.state!=='accepted'&&(p.state==='received'?<>
    <label>Буцаах шалтгаан<input value={reasons[p.id]??''} onChange={e=>setReasons({...reasons,[p.id]:e.target.value})}/></label>
    <div className="row-actions"><button className="btn secondary" disabled={!reasons[p.id]?.trim()} onClick={()=>mutate(m=>recordRequestPart(m,r.id,p.id,'reject',reasons[p.id]))}>Буцаах</button><button className="btn primary" onClick={()=>mutate(m=>recordRequestPart(m,r.id,p.id,'accept'))}>Үнэлж хүлээн авах</button></div>
   </>:<>
    <label>Ирсэн баримт сонгох<select value={references[p.id]??''} onChange={e=>setReferences({...references,[p.id]:e.target.value})}><option value="">Сонгоно уу</option>{model.evidence.filter(ev=>ev.engagement===eng.id&&ev.status!=='rejected'&&!r.parts!.some(other=>other.evidence===ev.id)).map(ev=><option value={ev.id} key={ev.id}>{ev.name}</option>)}</select></label>
    <button className="btn secondary" disabled={!references[p.id]} onClick={()=>mutate(m=>recordRequestPart(m,r.id,p.id,'receive',references[p.id]))}>Ирснийг бүртгэх</button>
   </>)}
  </div>)}
  {r.history.length>0&&<details><summary>Ирэлт ба үнэлгээний түүх</summary>{r.history.map((h,i)=><p className="micro" key={i}>{h}</p>)}</details>}
 </section>;
}

export function SampleUnit({model,eng,mutate,id,selectionStamp}:Props&{id:string;selectionStamp:string}){
 const [detail,setDetail]=useState(''),[amount,setAmount]=useState(''),[result,setResult]=useState<'pass'|'exception'>('pass');
 const work=model.work[workKey(eng.id,'3.1.2')];
 const saved=work.values[`sample.${selectionStamp}.${id}`];
 return <div className="journey-part">
  <b>{id} · {model.datasets[eng.id].rows.find(r=>r.id===id)?.amount.toLocaleString()} MNT</b>
  {saved&&<p className="micro">{saved}</p>}
  {canEdit(model,work)&&<><div className="field-grid"><label>Үр дүн<select value={result} onChange={e=>setResult(e.target.value as 'pass'|'exception')}><option value="pass">Зөрүүгүй</option><option value="exception">Зөрүүтэй</option></select></label>{result==='exception'&&<label>Зөрүүний дүн<input type="number" min="0" value={amount} onChange={e=>setAmount(e.target.value)}/></label>}</div><label>Шалгалтын тайлбар<input value={detail} onChange={e=>setDetail(e.target.value)}/></label><button className="btn secondary" disabled={!detail.trim()||(result==='exception'&&!amount.trim())} onClick={()=>mutate(m=>recordSampleTest(m,id,result,detail,result==='pass'?0:Number(amount)))}>Нэгжийн үр дүн хадгалах</button></>}
 </div>;
}

export function AuditJourney(props:Props){
 const {model,eng,mutate,open,go}=props,role=personById(model.person).role,work=model.work[workKey(eng.id,'3.1.2')],selection=currentSelection(model,eng.id);
 const [qualityNotes,setQualityNotes]=useState<Record<string,string>>({});
 const request=model.requests.find(r=>r.engagement===eng.id&&!r.dispatch&&r.form==='3.1.2'&&r.parts);
 const steps=[
  {title:'Хүсэлт ба шийдвэр',detail:eng.intake?.active?'Идэвхжсэн':acceptanceGaps(eng).join(' · ')||'Идэвхжүүлэх',done:!!eng.intake?.active,action:()=>go(role==='partner'?'decisions':'engagements')},
  {title:'Томилгоо ба хугацаа',detail:`${personById(work.owner).name} · ${work.due||'Товлоогүй'}`,done:!!work.due,action:()=>go(role==='preparer'?'tasks':'progress')},
  {title:'Баримтын үнэлгээ',detail:request?request.parts!.filter(p=>p.state==='accepted').length+'/'+request.expected+' үнэлсэн':'Энэ жишээнд тусгай хүсэлтгүй',done:request?.status==='complete'},
  {title:'Түүвэр ба ажлын хяналт',detail:isCurrentReview(work)?`3.1.2 v${work.version} хянагдсан`:selection?`${selection.ids.length} нэгж · ${personById(work.reviewer).name}`:'1.3 ба 2.6 хянаж, түүвэр сонгоно',done:isCurrentReview(work),action:()=>open('3.1.2')},
  {title:'Тайлан ба хадгалалт',detail:eng.custody==='accepted'?'Хүлээн авсан':currentRelease(model,eng)?'Одоогийн багц гарсан':`${reportGaps(model,eng.id).length} шаардлага`,done:eng.custody==='accepted',action:()=>go(role==='preparer'?'forms':'reporting')},
 ];
 if(role==='quality')return <section className="card pad journey-card"><h2>Томилсон чанарын ажил</h2><p>{eng.formalEqr?'Формал EQR · Багцын хувилбартай холбоотой':'Формал EQR шаардахгүй · Ердийн баталгаажуулалт тусдаа'}</p>
  {eng.qualityConcerns.map(c=><div className="journey-part" key={c.id}><b>{c.text}</b>{c.resolved?<p className="micro">Шийдвэрлэсэн</p>:<><label>Чанарын асуудлын үндэслэл<textarea value={qualityNotes[c.id]??''} onChange={e=>setQualityNotes({...qualityNotes,[c.id]:e.target.value})}/></label><button className="btn secondary" disabled={!qualityNotes[c.id]?.trim()||eng.locked} onClick={()=>mutate(m=>resolveQualityConcern(m,c.id,qualityNotes[c.id]))}>Асуудлын шийдвэр бүртгэх</button></>}</div>)}
  <div className="row-actions"><button className="btn secondary" onClick={()=>open('4.6')}>4.6 · Чанарын ажил</button><button className="btn secondary" onClick={()=>go('reporting')}>Багцын төлөв</button>{eng.formalEqr&&<button className="btn primary" disabled={eng.locked||eng.qualityConcerns.some(c=>!c.resolved)} onClick={()=>mutate(completeEqr)}>Одоогийн багцын EQR бүртгэх</button>}</div></section>;
 return <>
  <section className="card pad journey-overview">
   <div className="section-heading"><div><span className="eyebrow">АУДИТЫН УРСГАЛ · ЗОХИОМОЛ ӨГӨГДӨЛ</span><h2>Үндсэн хөрөнгийн нэмэгдэл</h2></div><GitBranch size={22}/></div>
   {!eng.intake&&<p className="muted">Хүсэлтээс эхлэх бүтэн жишээг үзэхийн тулд Оргил Технологи ХХК-г сонгоно уу.</p>}
   <div className="journey-steps">{steps.map((s,i)=><div key={s.title} className={s.done?'journey-done':''}>
    <span className="journey-number">{s.done?<CheckCircle2 size={17}/>:i+1}</span>
    <b>{s.title}</b><p>{s.detail}</p>
    {s.action&&<button className="quiet" onClick={s.action}>Нээх<ChevronRight size={13}/></button>}
   </div>)}</div>
  </section>
  <div className="journey-grid">
   {eng.intake&&<IntakeEditor key={eng.id} {...props}/>}
   <RequestParts key={eng.id} {...props}/>
   <section className="card pad journey-card">
    <span className="eyebrow">3.3.1 → 3.1.2 → 4.1.1</span><h2>Түүврийн шалгалт ба илрүүлэлт</h2>
    <div className="row-actions"><button className="btn secondary" onClick={()=>open('1.3')}>1.3 · Материаллаг байдал</button><button className="btn secondary" onClick={()=>open('2.6')}>2.6 · Хяналтад найдах</button>{role!=='partner'&&<button className="btn secondary" onClick={()=>go('sampling')}>3.3.1 · Түүвэр</button>}</div>
    {selection&&eng.intake?<div>{selection.ids.map(id=><SampleUnit key={selection.stamp+id} id={id} selectionStamp={selection.stamp} {...props}/>)}</div>:<p className="muted space-top">Одоогийн баталгаатай сонголтыг хүлээж байна.</p>}
    <button className="quiet space-top" onClick={()=>open('3.1.2')}>3.1.2 · Ажил, хяналт, буцаалт <ArrowRight size={15}/></button>
   </section>
   {role==='partner'&&<section className="card pad journey-card"><span className="eyebrow">4.1.A1 → 5.1</span><h2>Гаргалт ба хүлээлцэх</h2><p className="muted">{authorizationCurrent(model,eng)?'Одоогийн багц зөвшөөрөгдсөн':'Одоогийн багцад зөвшөөрөл дутуу'}</p><div className="row-actions"><button className="btn secondary" onClick={()=>go('reporting')}><FileCheck2 size={15}/>Тайлагнал</button><button className="btn secondary" onClick={()=>go('archive')}><ShieldCheck size={15}/>Хадгалалт</button></div></section>}
  </div>
 </>;
}

export function NextActions({model,eng,go,open}:Pick<Props,'model'|'eng'|'go'|'open'>){
 const role=personById(model.person).role;
 const requests=model.requests.filter(r=>r.engagement===eng.id&&r.owner===model.person&&issuedRequest(r)&&r.status!=='complete');
 const rows=Object.values(model.work).filter(w=>w.engagement===eng.id&&(role==='quality'?w.form==='4.6':w.owner===model.person&&['returned','waiting','changed'].includes(w.status)||w.reviewer===model.person&&w.status==='submitted')).slice(0,5);
 const gaps=role==='partner'?reportGaps(model,eng.id):[];
 if(!requests.length&&!rows.length&&!gaps.length)return null;
 return <section className="card pad next-actions"><div className="section-heading"><h2>Дараагийн үйлдэл</h2><Clock3 size={18}/></div>
  {requests.map(r=><button key={r.id} onClick={()=>go('requests')}><span><b>{r.id} · {r.title}</b><small>{r.parts?.find(p=>p.state==='rejected')?.reason??(r.status==='ready'?'Ирсэн баримтыг үнэлэх':'Дутуу баримтыг тодруулах')} · {personById(r.owner).name} · {r.due}</small></span><ChevronRight size={16}/></button>)}
  {rows.map(w=><button key={w.id} onClick={()=>open(w.form)}><span><b>{w.form} · {w.title}</b><small>{w.notes.find(n=>!n.cleared)?.text??(w.status==='submitted'?'Илгээсэн хувилбарыг хянах':role==='quality'?'Томилсон чанарын ажил':'Эх баримт эсвэл шинэ хувилбар хүлээгдэж байна')} · {personById(w.status==='submitted'?w.reviewer:w.owner).name} · {w.due||'Товлоогүй'}</small></span><ChevronRight size={16}/></button>)}
  {gaps.map(g=><button key={g} onClick={()=>go(g.startsWith('1.4')||g.includes('идэвхжээгүй')?'decisions':'reporting')}><span><b>{g}</b><small>Гаргалтын шаардлага · {eng.reportDate}</small></span><ChevronRight size={16}/></button>)}
 </section>;
}
