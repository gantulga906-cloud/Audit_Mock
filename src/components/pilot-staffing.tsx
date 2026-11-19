'use client';

import {useState} from 'react';
import {roleChoices,staffingChoices,type PilotRole} from '@/lib/pilot-registers';
import type {RosterAvailability,StaffingView,StaffSeat,WorkAssignment} from '@/lib/pilot-staffing';
import type {WorkItem} from '@/lib/workspace';
import type {PilotAction} from './pilot-registers';

const captions=Object.fromEntries(staffingChoices);
const accountRoles:Record<string,PilotRole>={nomin:'preparer',temuulen:'reviewer',bat:'partner'};
const person=(id:string)=>captions[accountRoles[id]]??id;

export function RosterOverview({roster,open}:{roster:RosterAvailability[];open:(id:string)=>void}){
 const [query,setQuery]=useState('');
 const day=new Date().toISOString().slice(0,10);
 return <section className="card pad bench-card">
  <h2>Фирмийн мэргэжилтэн ба боломжит цаг</h2>
  <p className="muted">Төлөвлөсөн цагийг боломжит хугацааны хүрээнд харуулна. Фирмийн бүртгэлд мэргэжилтэн, үнэмлэх, томилгоог бүртгэнэ.</p>
  <label>Мэргэжилтэн хайх<input value={query} onChange={e=>setQuery(e.target.value)}/></label>
  {roster.length===0&&<p>Баталсан мэргэжилтэн бүртгэгдээгүй.</p>}
  {roster.filter(r=>r.name.toLowerCase().includes(query.trim().toLowerCase())).map(r=><details className="feature-detail" key={r.id}>
   <summary>{r.name} · {({active:'Идэвхтэй',inactive:'Идэвхгүй',external:'Гадаад'})[r.status]} · v{r.version}</summary>
   {r.account&&<p>Нэвтрэх дүр · {captions[r.account]}</p>}
   {r.capacity!==null&&<p>{r.start} — {r.end} · Харагдах ажлын төлөвлөсөн {r.committed} цаг · Боломжит {r.capacity} цаг</p>}
   <p>Харагдах ажлын бүртгэсэн бодит цаг · {((r.actual??[]).reduce((sum,e)=>sum+e.minutes,0)/60).toFixed(2)} цаг · тайлант интервалуудыг доор тусад нь харуулав. Ашиглалт нь аудитын чанарын үнэлгээ биш.</p>
   {r.actual?.map((entry,i)=><p className="micro" key={i}>{entry.from} — {entry.through} · {entry.minutes} минут</p>)}
   {r.credentials.map(c=><div className="bench-item" key={c.id}><b>{c.title}</b>
    <p>{c.issuer&&c.issuer+' · '}{c.source}</p>
    <p className="micro">{c.from||'Эхлэх огноо тодорхойгүй'} — {c.validity==='no-expiry'?'Хугацаагүй':c.to||'Тодорхойгүй'}
     {!c.current?' · Эх хувилбар өөрчлөгдсөн':c.to&&c.to<day?' · Хугацаа дууссан':''}</p>
   </div>)}
   {r.assignments.map(a=><button type="button" className="quiet" key={a.engagement+'/'+a.capacity} onClick={()=>open(a.engagement)}>
    {a.client} · {captions[a.capacity]} · {a.start} — {a.end} · {a.hours} цаг
   </button>)}
  </details>)}
 </section>;
}

function Seat({seat}:{seat:StaffSeat}){
 return <div className="bench-item">
  <b>{captions[seat.capacity]} · {seat.name}</b>
  <p>{seat.start} — {seat.end} · {seat.hours} цаг · {seat.current?'Одоогийн баталгаа':'Эх хувилбар өөрчлөгдсөн'}</p>
  <p className="micro">Мэргэжилтэн v{seat.rosterVersion} · {seat.credential.title} v{seat.credential.version} · {seat.credential.source}</p>
  {seat.appointment&&<p className="micro">{seat.appointment.title} · v{seat.appointment.version} · {captions[seat.approvedBy]} · {seat.approvedAt.slice(0,10)}</p>}
  {seat.deliverable&&<p>{seat.deliverable} · Хариуцах аудитор {captions[seat.supervisor??'reviewer']}</p>}
 </div>;
}

export function EngagementStaffing({staffing,role,sealed,run}:{staffing:StaffingView;role:PilotRole;sealed:boolean;run:PilotAction}){
 return <details className="feature-detail">
  <summary>Багийн томилгоо ба нөөц · {staffing.seats.filter(s=>s.current).length} баталсан</summary>
  <p>Мэргэжилтний томилгоог M04-F06-д батална. Хандах эрхийг партнер тусад нь олгоно.</p>
  {staffing.gaps.map(gap=><p className="micro text-amber" key={gap}>{gap}</p>)}
  {staffing.seats.map(s=><Seat key={s.id} seat={s}/>)}
  {staffing.accepted?.length&&<details><summary>Хүлээн авахад ашигласан томилгоо</summary>
   {staffing.accepted.map(s=><Seat key={s.id} seat={s}/>)}
  </details>}
  {!sealed&&!staffing.managed&&role==='partner'&&<button type="button" className="btn secondary"
   onClick={()=>void run('staffing-enable')}>Баталсан томилгоог энэ ажилд мөрдөх</button>}
 </details>;
}

export function WorkAssignmentEditor({paper,history,staffing,run}:{paper:WorkItem;history:WorkAssignment[];staffing?:StaffingView;run:PilotAction}){
 const legacy=roleChoices.filter(([key])=>staffing?.members.includes(key as PilotRole)&&(!staffing.managed||staffing.seats.some(s=>s.current&&s.capacity===key)));
 const options=staffing?.people??legacy.map(([id,name])=>({id,name,role:id}));
 const named=!!staffing?.people;
 return <details className="feature-detail">
  <summary>Assign named leads and contributors</summary>
  <form className="feature-form" key={String(paper.assignmentRevision??0)+'/'+paper.owner+'/'+paper.reviewer} onSubmit={e=>{
   e.preventDefault();const data=new FormData(e.currentTarget);
   void run('work-assign',{form:paper.form,owner:String(data.get('owner')),reviewer:String(data.get('reviewer')),reason:String(data.get('reason')),expectedAssignmentRevision:String(paper.assignmentRevision??0),...(named&&{contributors:JSON.stringify(data.getAll('contributor')),reviewers:JSON.stringify(data.getAll('coReviewer'))})});
  }}>
   <label>Lead preparer<select name="owner" defaultValue={named?paper.owner:accountRoles[paper.owner]} required><option value="">Choose person</option>{options.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
   <label>Lead reviewer<select name="reviewer" defaultValue={named?paper.reviewer:accountRoles[paper.reviewer]} required><option value="">Choose person</option>{options.filter(p=>!named||p.role!=='preparer').map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
   {named&&<><fieldset><legend>Other preparers / contributors</legend>{options.map(p=><label key={p.id}><input type="checkbox" name="contributor" value={p.id} defaultChecked={paper.contributors?.includes(p.id)&&p.id!==paper.owner}/>{p.name}</label>)}</fieldset>
    <fieldset><legend>Other reviewers</legend>{options.filter(p=>p.role!=='preparer').map(p=><label key={p.id}><input type="checkbox" name="coReviewer" value={p.id} defaultChecked={paper.reviewers?.includes(p.id)&&p.id!==paper.reviewer}/>{p.name}</label>)}</fieldset></>}
   <label>Reason and outstanding handoff scope<input name="reason" required/></label>
   <p>Contributors can prepare. The lead preparer submits; only the accountable lead reviewer approves. Authors cannot review their own work.</p>
   <button className="btn secondary" disabled={options.length<2}>Save assignment</button>
  </form>
  {history.map(h=><p className="micro" key={h.at+'/'+h.owner}>{h.at.slice(0,10)} · {person(h.by)} · {person(h.previous.owner)}/{person(h.previous.reviewer)} → {person(h.owner)}/{person(h.reviewer)} · {h.reason}</p>)}
 </details>;
}
