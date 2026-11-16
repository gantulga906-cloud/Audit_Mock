import {useState,type FormEvent} from 'react';
import type {PilotAction,RegisterResources} from './pilot-registers';
import type {PilotRole} from '@/lib/pilot-registers';

export function PlanningDesk({resources,role,sealed,run}:{resources:RegisterResources;role:PilotRole;sealed:boolean;run:PilotAction}){
 const planning=resources.planning;
 const [correction,setCorrection]=useState('');
 if(!planning)return null;
 async function log(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const form=event.currentTarget,fields=Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,String(value)]));
  fields.from=new Date(fields.from).toISOString();fields.through=new Date(fields.through).toISOString();
  if(await run('effort-log',fields)){form.reset();setCorrection('');}
 }
 return <section className="card pad bench-card" data-planning-desk>
  <h2>Төлөвлөлтийн суурь ба бодит цаг</h2>
  <p>Төлөвлөсөн цаг, бодит зарцуулалт, хугацааны зөрчлийг тусад нь хөтөлнө. Бодит цаг төсөв давсан ч хадгалагдана.</p>
  {!planning.managed&&!sealed&&role==='partner'&&<form className="feature-form" onSubmit={event=>{event.preventDefault();void run('planning-enable',{reason:String(new FormData(event.currentTarget).get('reason'))});}}>
   <label>Одоогийн ажлын төлөвлөлтийн хяналтыг идэвхжүүлэх үндэслэл<textarea name="reason" required/></label><button className="btn secondary">G02 хяналт идэвхжүүлэх</button>
  </form>}
  {planning.programmes.map(programme=><details key={programme.form} className="feature-detail" data-planning-form={programme.form}>
   <summary>{programme.form} · {programme.gap?'Төлөвлөлтийн ажил үлдсэн':'Баталсан суурьтай'}</summary>
   {programme.gap&&<p className="warning">{programme.gap}</p>}
   <ul>{programme.risks.map(risk=><li key={risk.id}>{risk.name} · v{risk.version} · {risk.type==='overall'?'Нийт түвшин':programme.responses.filter(r=>r.risk===risk.id).map(r=>r.procedure).join(', ')||'Хариу горим дутуу'}</li>)}</ul>
  </details>)}
  {resources.registers.filter(r=>r.kind==='M05-F05'&&r.status==='approved').map(budget=>{
   const actual=planning.effort.filter(e=>e.current&&e.from.slice(0,10)>=budget.values.start&&e.through.slice(0,10)<=budget.values.end).reduce((n,e)=>n+e.minutes,0)/60;
   return <p key={budget.id}>Төсөв v{budget.version}{budget.stale?' · дахин хянана':''} · {budget.values.start}–{budget.values.end} · төлөвлөсөн {budget.values.hours} цаг · {role==='preparer'?'өөрийн':'энэ ажлын'} бодит {actual.toFixed(2)} цаг</p>;
  })}
  {planning.managed&&!sealed&&<form className="feature-form" data-effort-form onSubmit={event=>void log(event)}>
   <div className="field-grid">
    <label>Ажлын баримт<select name="work" required><option value="">Сонгох</option>{resources.forms.map(f=><option key={f.id} value={f.id}>{f.id} · {f.title}</option>)}</select></label>
    <label>Эхэлсэн · таны цагийн бүс<input name="from" type="datetime-local" required/></label>
    <label>Дууссан · таны цагийн бүс<input name="through" type="datetime-local" required/></label>
    <label>Гүйцэтгэсэн ажил<textarea name="purpose" required maxLength={4000}/></label>
    <label>Залруулах өмнөх бүртгэл<select name="supersedes" value={correction} onChange={event=>setCorrection(event.target.value)}><option value="">Шинэ бодит цаг</option>{planning.effort.filter(e=>e.current&&e.by===role).map(e=><option key={e.id} value={e.id}>{e.work} · {e.from} · {e.minutes} минут</option>)}</select></label>
    {correction&&<label>Залруулгын шалтгаан<textarea name="reason" required maxLength={4000}/></label>}
   </div><button className="btn primary">Бодит цаг бүртгэх</button>
  </form>}
  <details className="feature-detail"><summary>Бодит цагийн өөрчлөгдөшгүй түүх ({planning.effort.length})</summary>
   {planning.effort.map(e=><p key={e.id}>{e.by} · {e.work} · {e.from}–{e.through} · {e.minutes} минут · {e.current?'Одоогийн':'Залруулсан · эхийг хадгалсан'} · {e.purpose}{e.correction&&' · '+e.correction}</p>)}
  </details>
 </section>;
}
