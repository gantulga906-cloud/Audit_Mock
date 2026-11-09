import {useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {DEMO_DAY,personById,STATUS,type Engagement,type Model,type WorkItem} from '@/lib/workspace';

const DAY=86400000;
const iso=(d:Date)=>d.toISOString().slice(0,10);
const from=(s:string)=>new Date(s+'T00:00:00Z');
const add=(s:string,n:number)=>iso(new Date(from(s).getTime()+n*DAY));
const monday=(s:string)=>add(s,-((from(s).getUTCDay()+6)%7));
const monthLabel=(s:string)=>new Intl.DateTimeFormat('mn-MN',{month:'long',year:'numeric',timeZone:'UTC'}).format(from(s));
const daysFrom=(s:string,count:number)=>Array.from({length:count},(_,i)=>add(s,i));
const names=['Да','Мя','Лх','Пү','Ба','Бя','Ня'];

export function DeliveryTimeline({items,select,baseline,milestone,initialStart='2026-11-02',today=DEMO_DAY}:{items:WorkItem[];select:(id:string)=>void;baseline:boolean;milestone:string;initialStart?:string;today?:string}){
 const [start,setStart]=useState(initialStart),[span,setSpan]=useState(28),[owner,setOwner]=useState(''),[reviewer,setReviewer]=useState('');
 const days=daysFrom(start,span),end=days.at(-1)!;
 const filtered=items.filter(w=>(!owner||w.owner===owner)&&(!reviewer||w.reviewer===reviewer));
 const inRange=filtered.filter(w=>w.due&&w.due>=start&&(w.start||w.due)<=end);
 const elsewhere=filtered.filter(w=>!inRange.includes(w));
 const range=(a:string,b:string)=>{
  if(!b||b<start||(a||b)>end)return undefined;
  const column=(d:string)=>Math.round((from(d).getTime()-from(start).getTime())/DAY);
  const left=Math.max(0,column(a||b)),right=Math.min(span-1,column(b));
  return {left:`${left/span*100}%`,width:`${Math.max(1,right-left+1)/span*100}%`};
 };
 return <>
  <div className="plan-controls">
   <button className="btn secondary" aria-label="Өмнөх хугацаа" onClick={()=>setStart(add(start,-span))}><ChevronLeft size={16}/></button>
   <label>Эхлэх өдөр<input type="date" value={start} onChange={e=>e.target.value&&setStart(e.target.value)}/></label>
   <button className="btn secondary" aria-label="Дараагийн хугацаа" onClick={()=>setStart(add(start,span))}><ChevronRight size={16}/></button>
   <label>Хугацааны цонх<select value={span} onChange={e=>setSpan(Number(e.target.value))}><option value={7}>7 хоног</option><option value={14}>14 хоног</option><option value={28}>28 хоног</option></select></label>
   <label>Бэлтгэгч<select value={owner} onChange={e=>setOwner(e.target.value)}><option value="">Бүгд</option>{[...new Set(items.map(w=>w.owner))].map(id=><option key={id} value={id}>{personById(id).name}</option>)}</select></label>
   <label>Хянагч<select value={reviewer} onChange={e=>setReviewer(e.target.value)}><option value="">Бүгд</option>{[...new Set(items.map(w=>w.reviewer))].map(id=><option key={id} value={id}>{personById(id).name}</option>)}</select></label>
  </div>
  <div className="timeline-caption"><span>{start} — {end}</span><span>◆ Тайлангийн зорилтот өдөр: {milestone}</span><span>● Бодитоор хянасан өдөр</span></div>
  <div className="gantt-scroll"><div className="gantt" style={{minWidth:span>14?1060:720}}>
   <div className="gantt-header"><span>АЖИЛ · БЭЛТГЭГЧ → ХЯНАГЧ</span><div style={{gridTemplateColumns:`repeat(${span},1fr)`}}>{days.map(d=><span key={d} className={d===today?'today':''} title={d}>{d===milestone?'◆ ':''}{d.slice(8)}<small>{d.slice(5,7)} сар</small></span>)}</div></div>
   {[1,2,3,4,5].map(stage=>{const rows=inRange.filter(w=>w.stage===stage);return rows.length>0&&<div key={stage}><div className="gantt-group"><b>{stage} · {['Хүлээн авах','Төлөвлөлт','Гүйцэтгэл','Тайлагнал','Архив'][stage-1]}</b><span>{rows.length} ажил</span></div>{rows.map(w=>{
    const planned=range(w.start,w.due),original=range(w.baselineStart,w.baselineDue),actual=w.completedAt?.slice(0,10),actualStyle=actual?range(actual,actual):undefined;
    return <div className="gantt-row" key={w.id}>
     <button className="gantt-name" onClick={()=>select(w.id)}><span className={`status-dot ${w.status}`}/><div><small>{w.form} · {personById(w.owner).initials} → {personById(w.reviewer).initials}</small><b>{w.title}</b><small>{STATUS[w.status]}{w.status==='submitted'&&w.history.find(h=>h.version===w.submittedVersion)?' · '+w.history.find(h=>h.version===w.submittedVersion)?.at.slice(0,10):''}{w.notes.some(n=>!n.cleared)?' · Нээлттэй тэмдэглэл':''}</small></div></button>
     <div className="gantt-track" style={{backgroundSize:`${100/span}% 100%`}}>
      {baseline&&original&&<i className="baseline" title={`Суурь: ${w.baselineStart} – ${w.baselineDue}`} style={original}/>}
      {planned&&<button className={`gantt-bar ${w.status}`} aria-label={`${w.form} төлөвлөгөө`} title={`${w.start} – ${w.due} · ${STATUS[w.status]}`} style={planned} onClick={()=>select(w.id)}>{w.form}</button>}
      {actualStyle&&<span className="actual-marker" style={actualStyle} title={`Бодитоор хянасан: ${actual}`}>●</span>}
     </div>
    </div>;
   })}</div>;})}
  </div></div>
  <details className="plan-outside" open={inRange.length===0}><summary>Товлоогүй {elsewhere.filter(w=>!w.due).length} · Цонхны гадна {elsewhere.filter(w=>!!w.due).length}</summary>{elsewhere.map(w=><button key={w.id} className="quiet" onClick={()=>select(w.id)}>{w.form} · {w.title} · {w.due||'Товлоогүй'}</button>)}</details>
 </>;
}

export function PlanningCalendar({model,eng,items,select,tasksView,initialDay=DEMO_DAY,today=DEMO_DAY,teamCalendar=true}:{
 model:Pick<Model,'person'|'tasks'|'events'>;eng:Pick<Engagement,'id'|'reportDate'>;items:WorkItem[];
 select:(id:string)=>void;tasksView:()=>void;initialDay?:string;today?:string;teamCalendar?:boolean;
}){
 const [cursor,setCursor]=useState(initialDay),[mode,setMode]=useState<'month'|'week'|'agenda'>('month'),[personal,setPersonal]=useState(true),[expanded,setExpanded]=useState('');
 const role=personById(model.person).role;
 const match=(owner:string,reviewer?:string)=>!personal||owner===model.person||reviewer===model.person;
 const first=cursor.slice(0,7)+'-01';
 const days=mode==='week'?daysFrom(monday(cursor),7):daysFrom(monday(first),42);
 const within=(s:string)=>mode==='week'?s>=days[0]&&s<=days.at(-1)!:s.startsWith(cursor.slice(0,7));
 const entries=[
  ...items.filter(w=>w.due&&match(w.owner,w.reviewer)).map(w=>({id:w.id,title:`${w.form} · ${w.title}`,start:w.due,end:w.due,kind:'work',open:()=>select(w.id)})),
  ...model.tasks.filter(t=>t.engagement===eng.id&&t.due&&!t.done&&match(t.owner)).map(t=>({id:t.id,title:t.title,start:t.due,end:t.due,kind:'manual',open:tasksView})),
  ...model.events.filter(e=>e.engagement===eng.id&&match(e.owner)).map(e=>({...e,open:()=>setExpanded(expanded===e.id?'':e.id)})),
  ...(role==='quality'?[]:[{id:'milestone',title:'Тайлангийн зорилтот өдөр',start:eng.reportDate,end:eng.reportDate,kind:'review',open:()=>setExpanded(expanded==='milestone'?'':'milestone')}]),
 ].sort((a,b)=>a.start.localeCompare(b.start));
 function move(delta:number){
  if(mode==='week')setCursor(add(cursor,delta*7));
  else{const d=from(first);d.setUTCMonth(d.getUTCMonth()+delta);setCursor(iso(d));}
  setExpanded('');
 }
 return <section className="card calendar-card">
  <div className="calendar-tools"><div>
   <button className="quiet" aria-label="Хуанлийн өмнөх хугацаа" onClick={()=>move(-1)}><ChevronLeft size={17}/></button>
   <h2>{mode==='week'?`${days[0]} – ${days.at(-1)}`:monthLabel(cursor)}</h2>
   <button className="quiet" aria-label="Хуанлийн дараагийн хугацаа" onClick={()=>move(1)}><ChevronRight size={17}/></button>
  </div><div className="segmented">{([['week','7 хоног'],['month','Сар'],['agenda','Жагсаалт']] as const).map(([k,label])=><button key={k} className={mode===k?'active':''} onClick={()=>setMode(k)}>{label}</button>)}</div>
  {role!=='quality'&&teamCalendar&&<select aria-label="Хуанлийн хамрах хүрээ" value={personal?'mine':'team'} onChange={e=>setPersonal(e.target.value==='mine')}><option value="mine">Миний хуанли</option><option value="team">Гэрээт ажлын хуанли</option></select>}</div>
  {mode==='agenda'?<div className="agenda-list">{entries.filter(e=>within(e.start)||within(e.end)||(e.start<first&&e.end>=first)).map(e=><button key={e.id} className="agenda-item" onClick={e.open}><span>{e.start.slice(5)}</span><div><b>{e.title}</b><small>{e.kind==='work'?'Албан ажлын хугацаа':e.kind==='manual'?'Хувийн даалгавар':'Төлөвлөсөн цонх'}</small></div><ChevronRight size={16}/></button>)}{!entries.some(e=>within(e.start)||within(e.end))&&<p className="pad muted">Энэ хугацаанд товлосон ажил алга.</p>}</div>:<>
   <div className="calendar-weekdays">{names.map(n=><span key={n}>{n}</span>)}</div>
   <div className="calendar-grid">{days.map(d=>{const list=entries.filter(e=>e.start<=d&&e.end>=d);const limit=expanded===d||mode==='week'?list.length:3;return <div key={d} className={`calendar-cell ${d===today?'current':''} ${!within(d)?'outside':''}`}><span className="day-number">{d.slice(8)}</span>{list.slice(0,limit).map(e=><button key={e.id} className={`calendar-event ${e.kind}`} title={e.title} onClick={e.open}>{e.title}</button>)}{list.length>limit&&<button className="calendar-more" onClick={()=>setExpanded(d)}>+{list.length-limit} ажил</button>}</div>;})}</div>
  </>}
  {entries.find(e=>e.id===expanded)&&<div className="callout"><span>{entries.find(e=>e.id===expanded)?.title} · {entries.find(e=>e.id===expanded)?.start}</span></div>}
  <div className="card-foot"><span>Албан хугацаа нь ажлын бүртгэлээс харагдана. Хувийн даалгавар тусдаа.</span><span>Цаггүй огноо</span></div>
 </section>;
}
