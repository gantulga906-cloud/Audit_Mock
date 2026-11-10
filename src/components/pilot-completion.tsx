import {pilotScope,type PilotRole} from '@/lib/pilot-registers';
import type {Evidence,Finding,WorkItem} from '@/lib/workspace';
import {DataAction} from './pilot-population';
import type {PilotAction} from './pilot-registers';

type Attachment={id:string;name:string;version:number;sha256:string};
type Approval={by:PilotRole;at:string;reason:string};
type Correction={version:number;amount:number;reference:string;account:string;sign:string;reason:string;support:Attachment;
 response?:{result:string;amount:number;file:Attachment;reason:string};
 postings:{amount:number;population:number;source:string;rows:{id:string;row:number;cents:number}[];reason:string}[]};
type FindingFact={classification:string;reference:string;criterion:string;effect:string;evidence:Attachment;paper:number};
type EvaluationInputs={statement:number;materiality:number;limits:{overall:number;performance:number;trivial:number};gross:number};
type Evaluation={version:number;inputs:EvaluationInputs;note:string;approval?:Approval};
type Management={version:number;statement:number;file:Attachment;notes:Attachment;authorization:Attachment;
 signer:string;capacity:string;date:string;basis:string;approval?:Approval};
export type CompletionView={
 enabled:boolean;inputs?:EvaluationInputs;
 findings:(Finding&{outstanding:number;correction?:Correction;postingCurrent:boolean;fact?:FindingFact;history:Correction[]})[];
 evaluation?:Evaluation&{current:boolean};evaluationHistory:Evaluation[];
 management?:Management&{current:boolean};managementHistory:Management[];
};
const money=(minor:number)=>new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(minor/100);
const status:Record<string,string>={identified:'Бүртгэсэн',agreed:'Зөвшөөрсөн',posted_verified:'Бичилт баталгаажсан',
 accepted:'Зөвшөөрсөн',partial:'Хэсэгчлэн зөвшөөрсөн',declined:'Татгалзсан'};

export function CompletionDesk({data,role,papers,evidence,engagement,run}:{
 data:CompletionView;role:PilotRole;papers:WorkItem[];evidence:(Evidence&{current?:boolean})[];
 engagement:string;run:PilotAction;
}){
 const available=evidence.filter(e=>e.status==='accepted'&&e.current!==false);
 const href=(id:string)=>'/api/pilot/evidence/'+id+pilotScope(engagement);
 const fileChoice=(name:string,label:string,selected?:string)=><label key={name}>{label}<select name={name} defaultValue={selected??''} required>
  <option value="">Сонгох</option>{available.map(f=><option value={f.id} key={f.id}>{f.name} · v{f.version}</option>)}
 </select></label>;
 const reviewed=papers.filter(w=>w.stage===3&&w.status==='reviewed'&&w.reviewedVersion===w.version);
 const findingForm=(finding?:CompletionView['findings'][number])=><DataAction run={run} action="completion-finding-record"
  extra={finding?{id:finding.id}:undefined} button={finding?'Эх ажлын шинэ хувилбарыг үнэлэх':'Илрүүлэлт бүртгэх'}>
  <div className="field-grid">
   {!finding&&<label>Хянасан эх ажил<select name="form" required><option value="">Сонгох</option>
    {reviewed.map(p=><option key={p.form} value={p.form}>{p.form} · {p.title}</option>)}
   </select></label>}
   <label>Илрүүлэлт<input name="title" defaultValue={finding?.title} required/></label>
   <label>Асуудлын давтагдашгүй лавлагаа<input name="reference" defaultValue={finding?.fact?.reference} required/></label>
   <label>Ангилал<select name="classification" defaultValue={finding?.fact?.classification??'factual'}>
    <option value="factual">Баримтаар тогтоосон</option><option value="projected">Төсөөлсөн</option><option value="qualitative">Чанарын</option>
   </select></label>
   <label>Дүн<input name="amount" type="number" step=".01" min={0} defaultValue={finding?.amount??0} required/></label>
   {fileChoice('evidence','Нотлох баримт',finding?.fact?.evidence.id)}
   <label>Шалгуур<input name="criterion" defaultValue={finding?.fact?.criterion} required/></label>
   <label>Үр нөлөө ба дараагийн ажил<textarea name="effect" defaultValue={finding?.fact?.effect} required/></label>
  </div>
 </DataAction>;
 return <section className="card pad bench-card">
  <h2>Илрүүлэлт, залруулга ба дуусгалтын эх баримт</h2>
  {role==='reviewer'&&reviewed.length>0&&<details className="feature-detail"><summary>Хянасан ажлаас илрүүлэлт бүртгэх</summary>{findingForm()}</details>}
  {data.findings.map(f=>{
   const c=f.correction, latest=c?.postings.at(-1);
   return <details className="feature-detail" key={f.id}><summary>{f.title} · {status[f.status]} · Үлдэгдэл {money(f.outstanding)}</summary>
    <p>{f.form} · {f.qualitative} {f.resolution?' · '+f.resolution:''}</p>
    {f.fact&&<p>{f.fact.reference} · {f.fact.criterion} · <a href={href(f.fact.evidence.id)}>{f.fact.evidence.name}</a></p>}
    {f.fact&&role==='reviewer'&&reviewed.some(p=>p.form===f.form&&p.version!==f.fact?.paper)&&findingForm(f)}
    {c&&<>
     <p>Санал v{c.version} · {c.account} / {c.reference} · {money(c.amount)} · <a href={href(c.support.id)}>{c.support.name}</a></p>
     {c.response&&<p>{status[c.response.result]} · {money(c.response.amount)} · <a href={href(c.response.file.id)}>{c.response.file.name}</a></p>}
     {latest&&<p><a href={href(latest.source)}>Бичилтийн эх олонлог v{latest.population}</a> · {money(latest.amount)}
      {' · '}{f.postingCurrent?'Одоогийн баталгаажуулалт':'Түүхэн баталгаажуулалт'} · {latest.rows.map(r=>r.row).join(', ')}</p>}
     {role!=='preparer'&&!c.response&&<DataAction run={run} action="correction-response" extra={{id:f.id,version:String(c.version)}} button="Удирдлагын хариу бүртгэх">
      <div className="field-grid">
       <label>Бодит хариу<select name="result"><option value="accepted">Зөвшөөрсөн</option><option value="partial">Хэсэгчлэн</option><option value="declined">Татгалзсан</option></select></label>
       <label>Зөвшөөрсөн дүн<input name="amount" type="number" step=".01" min={0} defaultValue={c.amount/100} required/></label>
       {fileChoice('evidence','Удирдлагын хариуны эх файл')}<label>Үндэслэл<input name="reason" required/></label>
      </div>
     </DataAction>}
     {role==='partner'&&!!c.response?.amount&&!f.postingCurrent&&<DataAction run={run} action="correction-verify" extra={{id:f.id,version:String(c.version)}} button="Одоогийн эх олонлогт бичилт тулгах">
      <label>Бие даасан шалгалтын үндэслэл<input name="reason" required/></label>
     </DataAction>}
    </>}
    {role==='reviewer'&&f.outstanding>0&&reviewed.some(p=>p.form===f.form)&&<details className="feature-detail"><summary>Залруулгын санал бэлтгэх</summary>
     <DataAction run={run} action="correction-propose" extra={{id:f.id}} button="Санал хадгалах">
      <div className="field-grid">
       <label>Саналын дүн<input name="amount" type="number" step=".01" min=".01" defaultValue={f.outstanding/100} required/></label>
       <label>Данс<input name="account" defaultValue={c?.account} required/></label>
       <label>Дэвтрийн лавлагаа<input name="reference" defaultValue={c?.reference} required/></label>
       <label>Бичилтийн чиглэл<select name="sign" defaultValue={c?.sign??'debit'}><option value="debit">Дебет</option><option value="credit">Кредит</option></select></label>
       {fileChoice('evidence','Залруулгын үндэслэлийн эх файл')}<label>Саналын үндэслэл<input name="reason" required/></label>
      </div>
     </DataAction>
    </details>}
    {role==='partner'&&!f.resolution&&f.outstanding>0&&reviewed.some(p=>p.form===f.form)&&<DataAction run={run} action="fieldwork-resolve-finding" extra={{id:f.id}} button="Илрүүлэлтийн шийдвэр бүртгэх">
     <label>Тайлан ба үлдэгдэлд үзүүлэх нөлөө<input name="reason" required/></label>
    </DataAction>}
    {!!f.history.length&&<details><summary>Өмнөх санал, хариу ба бичилт</summary>
     {f.history.map(h=><p key={h.version}>v{h.version} · {money(h.amount)} · {h.response?.reason} · {h.postings.map(p=>money(p.amount)).join(', ')}</p>)}
    </details>}
   </details>;
  })}
  {(data.enabled||role==='reviewer')&&<details className="feature-detail" open={data.enabled}>
   <summary>Залруулаагүй дүн ба материаллаг байдал</summary>
   {data.inputs&&<p>Залруулаагүй дүн {money(data.inputs.gross)} · 1.3 v{data.inputs.materiality} · СТ v{data.inputs.statement} · Материаллаг байдал {data.inputs.limits.overall.toLocaleString()}</p>}
   {role==='reviewer'&&<DataAction run={run} action="completion-evaluate" button="Одоогийн дүн ба чанарын нөлөөг хадгалах">
    <label>Тоо болон чанарын нэгтгэсэн үнэлгээ<textarea name="note" defaultValue={data.evaluation?.note} required/></label>
   </DataAction>}
   {data.evaluation&&<p>Үнэлгээ v{data.evaluation.version} · {data.evaluation.current?'Одоогийн хяналт':'Шинэ хяналт шаардлагатай'} · {data.evaluation.note}</p>}
   {role==='partner'&&data.evaluation&&!data.evaluation.approval&&<DataAction run={run} action="completion-evaluation-approve" extra={{version:String(data.evaluation.version)}} button="Үнэлгээг батлах">
    <label>Хяналтын үндэслэл<input name="reason" required/></label>
   </DataAction>}
   {data.evaluationHistory.map(v=><p key={v.version}>v{v.version} · {money(v.inputs.gross)} · {v.approval?.reason??v.note}</p>)}
  </details>}
  <details className="feature-detail"><summary>Санхүүгийн тайлангийн эх ба удирдлагын зөвшөөрөл</summary>
   {data.management&&<p>СТ v{data.management.statement} · {data.management.signer} · {data.management.capacity} · {data.management.date}
    {' · '}{data.management.current?'Одоогийн баталсан хувилбар':'Хяналт шаардлагатай'} · <a href={href(data.management.file.id)}>{data.management.file.name}</a></p>}
   {role==='reviewer'&&<DataAction run={run} action="completion-management-submit" button="Тайлангийн яг хувилбар хянуулах">
    <div className="field-grid">
     {fileChoice('file','Санхүүгийн тайлангийн эх')}{fileChoice('notes','Тодруулгын эх')}{fileChoice('authorization','Удирдлагын баталсан нотолгоо')}
     <label>Баталсан хүн<input name="signer" required/></label><label>Албан тушаал<input name="capacity" required/></label>
     <label>Баталсан өдөр<input name="date" type="date" required/></label><label>Агуулгын тулгалт ба үндэслэл<input name="basis" required/></label>
    </div>
   </DataAction>}
   {role==='partner'&&data.management&&!data.management.approval&&<DataAction run={run} action="completion-management-approve"
    extra={{version:String(data.management.version)}} button="Яг энэ эх хувилбарыг батлах"><label>Хяналтын үндэслэл<input name="reason" required/></label></DataAction>}
  </details>
 </section>;
}
