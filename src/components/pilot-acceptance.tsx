'use client';

import type {ReactNode} from 'react';
import {acceptanceChecks,type AcceptanceView} from '@/lib/pilot-acceptance';
import {roleChoices,type PilotRole} from '@/lib/pilot-registers';
import type {Evidence} from '@/lib/workspace';
import type {PilotAction} from './pilot-registers';

function Action({run,action,label,extra,children}:{run:PilotAction;action:string;label:string;extra?:Record<string,string>;children?:ReactNode}){
 return <form className="feature-form" data-acceptance-action={action} onSubmit={e=>{e.preventDefault();const data=Object.fromEntries([...new FormData(e.currentTarget)].map(([key,value])=>[key,String(value)]));void run(action,{...data,...extra});}}>
  {children}<button className="btn secondary">{label}</button>
 </form>;
}
const roles=Object.fromEntries(roleChoices);
const states:Record<string,string>={draft:'Ноорог',submitted:'Хяналтад',returned:'Засварт',reviewed:'Хянасан'};
const outcomes:Record<string,string>={accept:'Хүлээн авах',continue:'Үргэлжлүүлэх',defer:'Хойшлуулах',decline:'Татгалзах',conditional:'Нөхцөлтэй — нөхцөл биелтэл идэвхжүүлэхгүй'};
export function AcceptanceDesk({state,role,evidence,run,framework}:{state?:AcceptanceView;role:PilotRole;evidence:(Evidence&{current?:boolean})[];run:PilotAction;framework?:string}){
 const a=state?.assessment,p=state?.proposal;
 const files=evidence.filter(row=>row.status==='accepted'&&row.current!==false);
 const fileSelect=(name:string,value?:string,required=false)=><select name={name} defaultValue={value??''} required={required}><option value="">Сонгох</option>{files.map(row=><option key={row.id} value={row.id}>{row.name} · v{row.version}</option>)}</select>;
 if(!state)return role==='partner'?<details className="feature-detail"><summary>Хүлээн авах үнэлгээний шинэ хяналт</summary><p>Өмнөх шийдвэр хадгалагдана. Энэ горимд шилжүүлсний дараа одоогийн үнэлгээ, мэдүүлэг, тохиролцсон нөхцөлийг тусад нь батална.</p><Action run={run} action="acceptance-enable" label="Тусдаа үнэлгээ, шийдвэрийн горимд шилжүүлэх"/></details>:null;
 return <section aria-label="Хүлээн авах үнэлгээ ба шийдвэр" className="feature-detail">
  <h3>Хүлээн авах үнэлгээ ба шийдвэр</h3>
  <p className={state.current?'muted':'callout amber'}>{state.current?'Одоогийн мэдээлэлд хамаарах хүчинтэй шийдвэртэй.':'Шийдвэр хүлээгдэж байна, эсвэл ашигласан мэдээллийг дахин үнэлнэ.'}</p>
  <p className="micro">Асуулгын хариулт, мэдүүлэг ирсэн төлөв, даалгаврын биелэлт нь хүлээн авах шийдвэрийг автоматаар гаргахгүй.</p>
  {a&&<p>Үнэлгээ v{a.version} · {states[a.status]} · {a.byPerson?.name??roles[a.by]}{a.reviewedPerson&&' · Хянасан '+a.reviewedPerson.name}{a.recommendation&&' · '+outcomes[a.recommendation]}</p>}
  {role!=='partner'&&(!a||a.by===role&&a.status!=='submitted')&&<details><summary>Үнэлгээ бэлтгэх / шинэчлэх</summary>
   <Action key={'assessment-'+a?.version+'-'+p?.version} run={run} action="acceptance-assess" label="Үнэлгээ хадгалах">
    <label>Үнэлгээний төрөл<select name="kind" defaultValue={a?.kind??'initial'}><option value="initial">Анхны аудит</option><option value="continuance">Үргэлжилсэн аудит</option></select></label>
    <label>Яг үнэлж буй хамрах хүрээ<textarea name="assessmentScope" defaultValue={p?.scope??a?.scope} required/></label>
    {acceptanceChecks.map(([key,label,source])=>{const c=a?.checks[key];return <details className="feature-detail" key={key}><summary>{label}</summary><p className="micro">Эх горим · {source}</p>
     <label>Бодит үнэлгээ<select name={'result.'+key} defaultValue={c?.result??'unknown'}><option value="unknown">Тодорхойгүй / шийдээгүй</option><option value="supported">Нотолгоотой, шаардлага хангасан</option><option value="adverse">Сөрөг нөхцөлтэй</option>{key==='predecessor'&&<option value="na">Хамаарахгүй — үндэслэлтэй</option>}</select></label>
     <label>Үндэслэл, бодит нөхцөл<textarea name={'basis.'+key} defaultValue={c?.basis}/></label>
     <label>Үнэлсэн эх баримт{fileSelect('evidence.'+key,c?.evidence)}</label>
     <div className="field-grid"><label>Шийдээгүй ажлын хариуцагч<select name={'owner.'+key} defaultValue={c?.owner??''}><option value="">Сонгох</option>{roleChoices.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label><label>Хугацаа<input type="date" name={'due.'+key} defaultValue={c?.due}/></label></div>
     <label>Шийдээгүй / сөрөг нөхцөлд хийх ажил<textarea name={'followup.'+key} defaultValue={c?.followup}/></label>
    </details>;})}
    <label>Хэрэглэх шаардлага, харьяалал<textarea name="requirement" defaultValue={a?.requirement}/></label>
    <label>Хэрэглэх хувилбар, хүчинтэй хугацааны тайлбар<input name="edition" defaultValue={a?.edition}/></label>
    <label>Шаардлага ба хэрэглэгдэх байдлын эх баримт{fileSelect('ruleEvidence',a?.ruleEvidence)}</label>
   </Action>
  </details>}
  {a&&['draft','returned'].includes(a.status)&&a.by===role&&<Action run={run} action="acceptance-submit" label="Яг энэ үнэлгээг хяналтад илгээх"/>}
  {a?.status==='submitted'&&role!=='preparer'&&a.by!==role&&<div className="field-grid">
   <Action run={run} action="acceptance-review" extra={{version:String(a.version)}} label="Хянаж санал өгөх"><label>Санал<select name="recommendation"><option value="defer">Хойшлуулах</option><option value="decline">Татгалзах</option><option value="accept">Дэмжих</option></select></label><label>Хяналтын үндэслэл<textarea name="reason" required/></label></Action>
   <Action run={run} action="acceptance-return" extra={{version:String(a.version)}} label="Засварт буцаах"><label>Буцаах тодорхой асуудал<textarea name="reason" required/></label></Action>
  </div>}
  {a&&<details><summary>Үнэлгээ, хяналтын түүх</summary>{[a,...state.assessments].map(row=><details key={row.version}><summary>v{row.version} · {states[row.status]} · {row.edition}</summary>{acceptanceChecks.map(([key,label])=><p key={key}>{label} · {row.checks[key]?.result} · {row.checks[key]?.basis}</p>)}{row.history.map((event,i)=><p className="micro" key={i}>{roles[event.by]} · {event.at} · {event.reason}</p>)}</details>)}</details>}
  <details className="feature-detail"><summary>Нөхцөлийн ноорог, фирмийн хяналт ба илгээлт {p&&' · v'+p.version}</summary>
   <p>Ноорог хянах, илгээсэн тухай бүртгэх болон үйлчлүүлэгчийн бодит зөвшөөрөл нь тусдаа үйлдлүүд.</p>
   {p&&<><p>{p.scope} · {states[p.status]} · {p.framework}</p><p>{p.auditorResponsibilities}</p><p>{p.managementResponsibilities}</p><p>{p.deliverable} · {p.timetable} · {p.fees}</p>{p.sent?.map((event,i)=><p key={i} className="micro">Илгээлтийн бүртгэл · {event.reference} · {event.at}</p>)}</>}
   {role!=='partner'&&(!p||p.by===role)&&<Action key={'proposal-'+p?.version} run={run} action="intake-terms-propose" label="Нөхцөлийн ноорог хадгалах">
    {([['scope','Хамрах хүрээ'],['framework','Баталгаажуулсан тайлагналын хүрээ'],['templateReference','Ашигласан загварын яг хувилбар'],['auditorResponsibilities','Аудиторын үүрэг'],['managementResponsibilities','Удирдлагын үүрэг, мэдээлэл ба хүмүүст хандах эрх'],['deliverable','Гарах тайлан / үр дүн'],['timetable','Хугацаа'],['fees','Төлбөр ба тохиролцоо'],['treatmentBasis','Шинэчлэх / хэвээр хэрэглэх үндэслэл'],['justification','Өөрчлөлтийн бодит шалтгаан, баталгааны түвшний үнэлгээ']] as const).map(([key,label])=><label key={key}>{label}<textarea name={key} defaultValue={p?.[key]??(key==='framework'?framework??state.framework:'')} required/></label>)}
    <div className="field-grid"><label>Нөхцөлийг хэрэглэх хэлбэр<select name="treatment" defaultValue={p?.treatment??'new'}><option value="new">Шинэ</option><option value="revised">Өөрчилсөн</option><option value="unchanged">Хэвээр хэрэглэх / сануулах</option></select></label><label>Баталгааны түвшин<select name="assuranceChange" defaultValue={p?.assuranceChange??'same'}><option value="same">Хэвээр</option><option value="lower">Бууруулах хүсэлт — тусдаа үндэслэлтэй үнэлнэ</option></select></label></div>
   </Action>}
   {p?.status==='draft'&&role!=='preparer'&&p.by!==role&&<div className="field-grid">{[['intake-terms-review','Нөхцөлийн ноорог хянах'],['intake-terms-return','Ноорог буцаах']].map(([action,label])=><Action key={action} run={run} action={action} extra={{version:String(p.version)}} label={label}><label>Үндэслэл<textarea name="reason" required/></label></Action>)}</div>}
   {p?.status==='reviewed'&&role!=='preparer'&&<Action run={run} action="intake-terms-send" extra={{version:String(p.version)}} label="Бодит илгээлтийн үр дүнг бүртгэх"><label>Илгээсэн суваг, огноо, үр дүнгийн ишлэл<input name="reference" required/></label></Action>}
   {state.proposals.length>0&&<details><summary>Өмнөх нөхцөлийн нооргууд</summary>{state.proposals.map(row=><p key={row.version}>v{row.version} · {row.scope} · {states[row.status]} · {row.justification}</p>)}</details>}
  </details>
  {role==='partner'&&a&&<details className="feature-detail"><summary>Эрх бүхий хүлээн авах шийдвэр</summary><Action run={run} action="acceptance-decide" label="Тусдаа шийдвэр бүртгэх">
   <label>Шийдвэр<select name="outcome" defaultValue="defer">{Object.entries(outcomes).map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>
   <label>Шийдвэрийн үндэслэл<textarea name="rationale" required/></label><label>Бодит эрх, томилгооны үндэслэл<textarea name="authority" required/></label>
   <label>Эрхийн эх баримт{fileSelect('authorityEvidence',undefined,true)}</label><label>Хүчинтэй эцсийн өдөр<input type="date" name="validThrough" required/></label>
   <details><summary>Нөхцөлтэй шийдвэрийн нэмэлт мэдээлэл</summary><label>Нөхцөл<textarea name="condition"/></label><label>Нөхцөлийн зөвшөөрөгдсөн нөлөө, хийх ажил<textarea name="conditionEffect"/></label><label>Хариуцагч<select name="conditionOwner">{roleChoices.map(([key,text])=><option key={key} value={key}>{text}</option>)}</select></label><label>Биелүүлэх өдөр<input type="date" name="conditionDue"/></label></details>
  </Action></details>}
  <details><summary>Хүлээн авах шийдвэрийн түүх ({state.decisions.length})</summary>{state.decisions.map(row=><article key={row.version}><p><b>v{row.version} · {outcomes[row.outcome]}</b> · {row.person.name} · {row.at}</p><p>{row.rationale}</p><p className="micro">Үнэлгээ v{row.assessmentVersion} · Нөхцөл v{row.termsVersion??'—'} · {row.authority} · Хүчинтэй {row.validThrough}</p>{row.condition&&<p>{row.condition.text} · {roles[row.condition.owner]} · {row.condition.due} · {row.condition.effect}</p>}</article>)}</details>
 </section>;
}
