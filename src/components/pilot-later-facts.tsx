import { useState, type FormEvent } from 'react';
import { pilotScope } from '@/lib/pilot-registers';
import type { WorkItem } from '@/lib/workspace';
import { DataAction } from './pilot-population';
import type { PilotAction } from './pilot-registers';

type Outcome='no-change'|'reissue'|'prevent-reliance';
export type LaterFact={
 id:string;occurred:string|null;discovered:string;knownAtReport:string;facts:string;impact:'possible'|'none';impactReason:string;
 original:{package:string;reportDate:string;issued:string;digest:string;reportSha256:string;recipients:string[]};
 source:{id:string;name:string;sha256:string};
 screeningHistory?:{impact:'possible'|'none';impactReason:string;at:string}[];
 communications:{id:string;audience:'management'|'governance'|'users';recipient:string;state:'pending'|'failed'|'delivered';day:string;reference:string;detail:string}[];
 plan?:{outcome:Outcome;procedures:string;users:string;authority:string;advice:string;reason:string;revisedStatements:'yes'|'no';paper?:string;reportDate?:string;
  dateHistory?:{from:string;to:string;reason:string}[]};
 closed?:{at:string;reason:string};successor?:string;
};
const outcomeNames={reissue:'Дахин гаргах','no-change':'Өөрчлөхгүй','prevent-reliance':'Өмнөх тайланд найдахаас сэргийлэх'};
const audienceNames={management:'Удирдлага',governance:'Засаглах удирдлага',users:'Өмнөх тайлангийн хүлээн авагч'};
const stateNames={pending:'Хүлээгдэж буй',failed:'Амжилтгүй',delivered:'Хүргэсэн'};

function FactDecision({row,papers,run}:{row:LaterFact;papers:WorkItem[];run:PilotAction}){
 const [outcome,setOutcome]=useState(row.impact==='none'?'no-change':'');
 return <DataAction run={run} action="later-fact-decide" extra={{id:row.id}} button="Партнерын шийдвэр батлах">
  <div className="field-grid">
   <label>Шийдвэр<select name="outcome" value={outcome} onChange={event=>setOutcome(event.target.value)} required>
    {row.impact==='none'?<option value="no-change">{outcomeNames['no-change']}</option>:<>
     <option value="">Сонгох</option><option value="reissue">{outcomeNames.reissue}</option><option value="prevent-reliance">{outcomeNames['prevent-reliance']}</option>
    </>}
   </select></label>
   <label>СТ шинэчлэх шаардлага<select name="revisedStatements" required>
    <option value="">Сонгох</option><option value="no">Үгүй</option>{row.impact==='possible'&&<option value="yes">Тийм</option>}
   </select></label>
   <label>Нэмэлт горим ба СТ-д үзүүлэх нөлөө<textarea name="procedures" required/></label>
   <label>Хэрэглэгчид ба найдах эрсдэл<textarea name="users" required/></label>
   <label>Хэрэглэх шаардлага, эх сурвалж<textarea name="authority" required/></label>
   <label>Зөвлөгөө ба хэрхэн хэрэглэсэн<textarea name="advice" required/></label>
   <label>Шийдвэрийн үндэслэл<textarea name="reason" required/></label>
   {outcome==='reissue'&&<>
    <label>Дахин хянах анхны багцын ажил<select name="paper" required><option value="">Сонгох</option>
     {papers.filter(p=>p.status==='reviewed'&&p.reviewedVersion===p.version).map(p=><option key={p.id} value={p.form}>{p.form} · {p.title}</option>)}
    </select></label>
    <label>Шинэ тайлангийн огноо<input name="reportDate" type="date" min={row.discovered} required/></label>
   </>}
  </div>
 </DataAction>;
}

export function LaterFactsDesk({facts,packageId,engagement,papers,run,readFile,onError}:{
 facts:LaterFact[];packageId?:string;engagement:string;papers:WorkItem[];run:PilotAction;
 readFile:(file:FormDataEntryValue|null)=>Promise<{name:string;base64:string}>;onError:(message:string)=>void;
}){
 const active=facts.find(row=>!row.closed);
 function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const form=event.currentTarget,data=new FormData(form);
  const fields=Object.fromEntries(Array.from(data.entries()).filter(([,value])=>typeof value==='string').map(([key,value])=>[key,String(value)]));
  void readFile(data.get('sourceFile')).then(file=>run('later-fact-record',{...fields,...file,package:packageId??''}))
   .then(ok=>{if(ok)form.reset();}).catch(error=>onError(error.message));
 }
 return <details className="card pad bench-card" open={!!active}>
  <summary>Тайлан гаргасны дараа илэрсэн нөхцөл</summary>
  {packageId&&!active&&<form className="feature-form" onSubmit={save}>
   <div className="field-grid">
    <label>Нөхцөл үүссэн өдөр (мэдэгдэж байвал)<input name="occurred" type="date"/></label>
    <label>Илрүүлсэн өдөр<input name="discovered" type="date" required/></label>
    <label>Тайлангийн огноонд мэдэж байсан зүйл<textarea name="knownAtReport" required/></label>
    <label>Шинээр илэрсэн нөхцөл<textarea name="facts" required/></label>
    <label>Анхны тайланд үзүүлэх нөлөө<select name="impact" required><option value="">Сонгох</option><option value="possible">Нөлөөлж болзошгүй</option><option value="none">Нөлөөгүй</option></select></label>
    <label>Нөлөөллийн үндэслэл<textarea name="impactReason" required/></label>
    <label>Нөхцөлийг дэмжсэн эх файл<input name="sourceFile" type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv" required/></label>
   </div><button className="btn primary">Шинэ нөхцөл бүртгэх</button>
  </form>}
  {facts.slice().reverse().map(row=><details className="feature-detail" key={row.id} open={!row.closed}>
   <summary>{row.discovered} · {row.closed?'Хаасан':row.plan?'Шийдвэр баталсан':'Үнэлж буй'}</summary>
   <p>Анхны тайлан {row.original.reportDate} · Гаргалт {row.original.issued} · Багц {row.original.package}</p>
   <p className="micro break-all">SHA-256 {row.original.reportSha256} · {row.original.digest}</p>
   <p>Үүссэн {row.occurred??'Тодорхойгүй'} · Илрүүлсэн {row.discovered}</p>
   <p>{row.knownAtReport}</p><p>{row.facts} · {row.impactReason}</p>
   <a href={'/api/pilot/evidence/'+row.source.id+pilotScope(engagement)}>{row.source.name}</a>
   {row.screeningHistory?.map((entry,index)=><p key={index}>{entry.at} · {entry.impact==='possible'?'Нөлөөлж болзошгүй':'Нөлөөгүй'} · {entry.impactReason}</p>)}
   {!row.plan&&!row.closed&&<details className="feature-detail"><summary>Нөлөөллийн үнэлгээг шинэчлэх</summary>
    <DataAction run={run} action="later-fact-screen" extra={{id:row.id}} button="Шинэ үнэлгээ хадгалах">
     <label>Анхны тайланд үзүүлэх нөлөө<select name="impact" defaultValue={row.impact}>
      <option value="possible">Нөлөөлж болзошгүй</option><option value="none">Нөлөөгүй</option>
     </select></label>
     <label>Өөрчилсөн үндэслэл<textarea name="impactReason" required/></label>
    </DataAction>
   </details>}
   {row.communications.map(entry=><p key={entry.id}>{entry.day} · {audienceNames[entry.audience]} · {entry.recipient} · {stateNames[entry.state]} · {entry.reference} · {entry.detail}</p>)}
   {!row.closed&&(!row.plan||row.plan.outcome==='prevent-reliance')&&<DataAction run={run} action="later-fact-communicate" extra={{id:row.id}} button="Бодит харилцаа, үр дүн бүртгэх">
    <div className="field-grid">
     <label>Хүлээн авагчийн төрөл<select name="audience">{row.plan?<option value="users">{audienceNames.users}</option>:<>
      <option value="management">{audienceNames.management}</option><option value="governance">{audienceNames.governance}</option>
     </>}</select></label>
     <label>Хүлээн авагч{row.plan?<select name="recipient" required><option value="">Сонгох</option>
      {row.original.recipients.map(recipient=><option key={recipient}>{recipient}</option>)}</select>:<input name="recipient" required/>}</label>
     <label>Огноо<input name="day" type="date" min={row.discovered} required/></label>
     <label>Бодит төлөв<select name="state"><option value="pending">{stateNames.pending}</option><option value="failed">{stateNames.failed}</option><option value="delivered">{stateNames.delivered}</option></select></label>
     <label>Хэлэлцүүлэг эсвэл хүргэлтийн нотолгооны ишлэл<input name="reference" required/></label>
     <label>Агуулга ба үр дүн<textarea name="detail" required/></label>
    </div>
   </DataAction>}
   {!row.plan&&!row.closed&&<FactDecision key={row.impact} row={row} papers={papers} run={run}/>}
   {row.plan&&<>
    <p>{outcomeNames[row.plan.outcome]} · {row.plan.paper} {row.plan.reportDate} · {row.plan.reason}</p>
    <p>{row.plan.procedures} · {row.plan.users} · {row.plan.authority} · {row.plan.advice}</p>
    {row.plan.dateHistory?.map(date=><p key={date.to}>{date.from} → {date.to} · {date.reason}</p>)}
    {!row.closed&&row.plan.outcome==='reissue'&&!row.successor&&<>
     <p>Архивын M12-F04 бүртгэлд баталсан ажлын баримт, огноогоор өөрчлөлтийг холбоно.</p>
     <DataAction run={run} action="later-fact-reschedule" extra={{id:row.id}} button="Шинэ огноо батлах">
      <label>Шинэ тайлангийн өдөр<input name="reportDate" type="date" required/></label>
      <label>Өөрчилсөн үндэслэл<input name="reason" required/></label>
     </DataAction>
    </>}
    {row.successor&&<p>Дараагийн архивын багц {row.successor}</p>}
    {!row.closed&&<DataAction run={run} action="later-fact-close" extra={{id:row.id}} button="Эцсийн шийдвэр бүртгэж хаах">
     <label>Үр дүн ба хаалтын үндэслэл<textarea name="reason" required/></label>
    </DataAction>}
   </>}
   {row.closed&&<p>{row.closed.at} · {row.closed.reason}</p>}
  </details>)}
 </details>;
}
