import {useState,type FormEvent,type ReactNode} from 'react';
import {pilotScope,type PilotRole} from '@/lib/pilot-registers';
import type {JournalRun,PopulationView,SampleView} from '@/lib/pilot-population';
import type {Evidence,Finding,WorkItem} from '@/lib/workspace';
import type {PilotAction} from './pilot-registers';

const money=(value:number)=>new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(value/100);
const issues:Record<string,string>={columns:'Багана зөрсөн',key:'Түлхүүр дутуу',amount:'Дүн буруу',entity:'Байгууллага зөрсөн',
 date:'Огноо буруу',period:'Тайлант үе зөрсөн',currency:'Валют зөрсөн',duplicate:'Давхардсан түлхүүр'};
const states={accepted:'Хүлээн авах',quarantined:'Тусгаарласан',excluded:'Хассан'};

export function DataAction({run,action,extra,button,children}:{
 run:PilotAction;action:string;extra?:Record<string,string>;button:string;children?:ReactNode;
}){
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  void run(action,{...Object.fromEntries([...data].map(([key,value])=>[key,String(value)])),...extra});
 }
 return <form className="feature-form" onSubmit={submit}>{children}<button className="btn secondary">{button}</button></form>;
}

export function PopulationDesk({population,role,engagement,evidence,run,readFile,onError}:{
 population?:PopulationView;role:PilotRole;engagement:string;run:PilotAction;
 evidence:(Evidence&{current?:boolean})[];
 readFile:(file:FormDataEntryValue|null)=>Promise<{name:string;base64:string}>;onError:(error:string)=>void;
}){
 const [page,setPage]=useState(0),[filter,setFilter]=useState('');
 const current=population?.current, controls=current?.controls;
 const rows=(current?.rows??[]).filter(r=>!filter||r.state===filter);
 const pageSize=50, last=Math.max(0,Math.ceil(rows.length/pageSize)-1), index=Math.min(page,last);
 function upload(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const form=e.currentTarget, data=new FormData(form);
  void readFile(data.get('file')).then(file=>run('population-import',{...file,currency:String(data.get('currency')),
   source:String(data.get('source'))})).then(ok=>{if(ok){form.reset();setPage(0);}}).catch(e=>onError(e.message));
 }
 const original=(id:string)=>'/api/pilot/evidence/'+id+pilotScope(engagement);
 return <section className="card pad bench-card">
  <h2>Эх олонлог ба санхүүгийн тайлангийн тулгалт</h2>
  {role!=='partner'&&<details className="feature-detail">
   <summary>Үйлчлүүлэгчийн эх CSV файл бүртгэх</summary>
   <p className="micro">id, account, amount, entity, date, currency · YYYY-MM-DD · UTF-8</p>
   <form className="feature-form" onSubmit={upload}>
    <div className="field-grid"><label>Эх файл<input name="file" type="file" accept=".csv" required/></label>
     <label>Нийлүүлсэн эх сурвалж<input name="source" required/></label>
     <label>Валют<input name="currency" maxLength={3} placeholder="MNT" required/></label></div>
    <button className="btn primary">Эх файл бүртгэх</button>
   </form>
  </details>}
  {current&&<>
   <p><a href={original(current.evidence)}>{current.name}</a> · v{current.version} · {current.currency} · {current.source} · <b>{population?.usable?'Хэрэглэхийг зөвшөөрсөн':current.approval?'Эх хяналт өөрчлөгдсөн':'Хяналт хүлээж байна'}</b></p>
   <p className="micro" style={{overflowWrap:'anywhere'}}>SHA-256 {current.sha256}</p>
   <p>Уншсан {current.counts.read} · Хүлээн авах {current.counts.accepted} · Тусгаарласан {current.counts.quarantined} · Хассан {current.counts.excluded}</p>
   <p>Уншигдсан дүн {Object.entries(current.readTotals??{}).map(([code,amount])=>code+' '+money(amount)).join(' · ')||'—'}
    {' · '}Хамрах хүрээний дүн {money(current.acceptedCents)} {current.currency} · Тоон дүнгүй мөр {current.counts.invalidAmounts}</p>
   {controls&&<p>Хараат бус хяналт {controls.count} мөр · {money(controls.cents)} · <a href={original(controls.evidence.id)}>{controls.source}</a> · Хэрэглэх зорилго {controls.use}</p>}
   {current.gaps.length>0&&<ul className="callout amber">{current.gaps.slice(0,30).map((gap,i)=><li key={i}>{gap}</li>)}</ul>}
   <details className="feature-detail" open={current.counts.quarantined>0}>
    <summary>Эх мөрийн задрал</summary>
    <label>Төлөв<select value={filter} onChange={e=>{setFilter(e.target.value);setPage(0);}}>
     <option value="">Бүх мөр</option>{Object.entries(states).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select></label>
    <div style={{overflowX:'auto'}}><table><thead><tr><th>Мөр</th><th>Түлхүүр</th><th>Данс</th><th>Огноо</th><th>Эх дүн</th><th>Төлөв, үндэслэл</th></tr></thead>
     <tbody>{rows.slice(index*pageSize,(index+1)*pageSize).map(r=><tr key={r.row}>
      <td>{r.row}</td><td>{r.id||'—'}</td><td>{r.account||'—'}</td><td>{r.date||'—'}</td><td>{r.rawAmount||'—'} {r.currency}</td>
      <td>{states[r.state]} {r.issues.map(key=>issues[key]).join(', ')} {r.reason}</td>
     </tr>)}</tbody></table></div>
    <div className="row-actions"><button type="button" className="btn secondary" disabled={index===0} onClick={()=>setPage(index-1)}>Өмнөх</button>
     <span>{index+1}/{last+1}</span><button type="button" className="btn secondary" disabled={index===last} onClick={()=>setPage(index+1)}>Дараах</button></div>
   </details>
   {current.bridge.length>0&&<details className="feature-detail" open><summary>Данс → Тайлангийн мөр</summary>
    {current.bridge.map(b=><p key={b.line}><b>{b.line}</b> · {b.accounts.join(', ')||'—'} · {money(b.computed)} / {b.reported===null?'—':money(b.reported)} · Зөрүү {b.difference===null?'—':money(b.difference)}</p>)}
   </details>}
   {role===current.preparedBy&&<details className="feature-detail"><summary>Тулгалт ба хамрах хүрээг хадгалах</summary>
    <DataAction key={current.version} run={run} action="population-reconcile" extra={{version:String(current.version)}} button="Тулгалтын шинэ хувилбар хадгалах">
     <div className="field-grid">
      <label>Хараат бус мөрийн тоо<input name="count" type="number" min={1} defaultValue={controls?.count} required/></label>
      <label>Хараат бус дүн<input name="total" type="number" step=".01" defaultValue={controls?controls.cents/100:undefined} required/></label>
      <label>Хяналтын эх сурвалж<input name="source" defaultValue={controls?.source} required/></label>
      <label>Хяналтын эх файл<select name="controlEvidence" defaultValue={controls?.evidence.id} required>
       <option value="">Сонгох</option>{evidence.filter(e=>e.status==='accepted'&&e.current!==false&&!e.population)
        .map(e=><option key={e.id} value={e.id}>{e.name} · v{e.version}</option>)}
      </select></label>
      <label>Хэрэглэх зорилго<input name="use" defaultValue={controls?.use} required/></label>
      <label>Данс,тайлангийн мөр<textarea name="mapping" defaultValue={controls?.mapping} placeholder="1500,PPE" required/></label>
      <label>Тайлангийн мөр,батлах дүн<textarea name="statements" defaultValue={controls?.statements} placeholder="PPE,15000" required/></label>
      <label>Хасах эх мөр,үндэслэл<textarea name="exclusions" defaultValue={controls?.exclusions} placeholder="8,Тайлант үеийн гадна"/></label>
     </div>
    </DataAction>
   </details>}
   {role!=='preparer'&&role!==current.preparedBy&&!current.approval&&current.gaps.length===0&&<DataAction run={run}
    action="population-approve" extra={{version:String(current.version)}} button="Энэ хувилбарыг батлах">
    <label>Хяналтын үндэслэл<input name="reason" required/></label>
   </DataAction>}
   {current.approval&&<p>{current.approval.at.slice(0,16)} · {current.approval.reason}</p>}
   {!!population?.history.length&&<details className="feature-detail"><summary>Хувилбарын түүх</summary>
    {population.history.map(v=><p key={v.version}>v{v.version} · <a href={original(v.evidence)}>{v.name}</a> · {v.counts.accepted}/{v.counts.read} · {v.approval?.reason??'Хяналтгүй'}</p>)}
   </details>}
  </>}
 </section>;
}

export function SampleDesk({population,sample,paper,role,engagement,evidence,findings,run}:{
 population?:PopulationView;sample?:SampleView;paper:WorkItem&{editable:boolean};role:PilotRole;engagement:string;
 evidence:(Evidence&{current?:boolean})[];findings:Finding[];run:PilotAction;
}){
 const [unit,setUnit]=useState('');
 const approved=population?.usable ? population.current : undefined;
 if(!approved&&!sample)return null;
 const reviewer=paper.reviewer===({preparer:'nomin',reviewer:'temuulen',partner:'bat'}[role]);
 const extra={form:paper.form,version:String(sample?.version??'')};
 const selected=sample?.selected?.find(r=>r.id===unit);
 const results=new Map(sample?.tests.map(t=>[t.unit,t]));
 return <details className="feature-detail space-top" open={!!sample}>
  <summary>Эх олонлогоос сонгох түүвэр {sample&&'· v'+sample.version}</summary>
  {sample&&<>
   <p><a href={'/api/pilot/evidence/'+sample.basis.source+pilotScope(engagement)}>Эх олонлог v{sample.basis.population}</a> · {sample.basis.line}
    {' · '}1.3 v{sample.basis.materiality} · 2.6 v{sample.basis.controls} · {sample.size} нэгж · seed {sample.seed}</p>
   <p>{sample.basis.specificMateriality&&`Тусгай босго · ${sample.basis.specificMateriality.scope} · ${sample.basis.specificMateriality.amount.toLocaleString()} · `}
    Гүйцэтгэлийн босго {sample.basis.performance.toLocaleString()}</p>
   <p>{sample.purpose}</p>
   {!sample.current&&<p className="callout amber">Түүврийн суурь өөрчлөгдсөн. Шинэ дизайн хадгалж, дахин хянуулна уу.</p>}
   {sample.current&&!sample.approval&&reviewer&&<DataAction run={run} action="sample-approve" extra={extra} button="Дизайныг батлах">
    <label>Хяналтын үндэслэл<input name="reason" required/></label>
   </DataAction>}
   {sample.current&&sample.approval&&!sample.selected&&(paper.editable||reviewer)&&<button type="button" className="btn secondary" onClick={()=>void run('sample-select',extra)}>Сонголт хийх</button>}
   {sample.selected&&<div className="space-top">
    <label>Сонгосон эх мөр<select value={unit} onChange={e=>setUnit(e.target.value)}>
     <option value="">Сонгох</option>{sample.selected.map(r=><option key={r.id} value={r.id}>{r.id} · эх мөр {r.row} · {money(r.cents)} · {results.has(r.id)?'Шалгасан':'Хүлээгдэж буй'}</option>)}
    </select></label>
    <p>{results.size}/{sample.selected.length} нэгжийн үр дүн бүртгэсэн</p>
    {selected&&results.get(unit)&&<p>{results.get(unit)?.detail} · <a href={'/api/pilot/evidence/'+results.get(unit)?.evidence+pilotScope(engagement)}>Нотлох баримт</a></p>}
    {selected&&sample.current&&paper.editable&&paper.status!=='submitted'&&<DataAction key={unit+'/'+sample.version} run={run} action="sample-test" extra={{...extra,unit}} button="Нэгжийн шалгалт хадгалах">
     <div className="field-grid">
      <label>Үр дүн<select name="result"><option value="pass">Зөрчилгүй</option><option value="exception">Зөрчилтэй</option></select></label>
      <label>Зөрүүний дүн<input name="amount" type="number" step=".01" min={0} defaultValue="0" required/></label>
      <label>Хүлээн авсан нотлох баримт<select name="evidence" required><option value="">Сонгох</option>
       {evidence.filter(e=>e.status==='accepted'&&e.current!==false&&!e.population).map(e=><option key={e.id} value={e.id}>{e.name} · v{e.version}</option>)}
      </select></label>
      <label>Гүйцэтгэсэн сорилын дүгнэлт<textarea name="detail" required/></label>
     </div>
    </DataAction>}
   </div>}
   {sample.history.length>0&&<details className="feature-detail"><summary>Өмнөх дизайн ба шалгалтууд</summary>
    {sample.history.map(h=><details className="feature-detail" key={h.version}>
     <summary>v{h.version} · эх олонлог v{h.basis.population} · {h.approval?'Хянасан':'Ноорог'}</summary>
     <p>{h.purpose} · seed {h.seed} · {h.approval?.reason}</p>
     {h.tests.map((r,i)=><p key={i}>{r.unit} · эх мөр {r.row} · {r.detail}</p>)}
    </details>)}
   </details>}
  </>}
  {approved&&paper.editable&&<details className="feature-detail"><summary>Дизайн бэлтгэх</summary>
   <DataAction run={run} action="sample-design" extra={{form:paper.form}} button="Дизайн хадгалах">
    <div className="field-grid">
     <label>Тайлангийн мөр<select name="line" defaultValue={sample?.basis.line} required>
      <option value="">Сонгох</option>{approved.bridge.filter(b=>b.accounts.length).map(b=><option key={b.line} value={b.line}>{b.line}</option>)}
     </select></label>
     <label>Сонгох тоо<input name="size" type="number" min={1} max={500} defaultValue={sample?.size} required/></label>
     <label>Дахин гаргах seed<input name="seed" type="number" min={0} max={4294967295} defaultValue={sample?.seed} required/></label>
     <label>Сорилын зорилго, тоо сонгосон үндэслэл<textarea name="purpose" defaultValue={sample?.purpose} required/></label>
    </div>
   </DataAction>
  </details>}
  {findings.map(f=><div className="bench-item" key={f.id}>
   <p><b>{f.title}</b> · {f.amount.toLocaleString()} · {f.resolution??'Шийдвэр хүлээж байна'}</p>
   {role==='partner'&&paper.status==='reviewed'&&!f.resolution&&<DataAction run={run} action="sample-resolve-finding" extra={{id:f.id}} button="Илрүүлэлтийн шийдвэр хадгалах">
    <label>Шийдвэрийн үндэслэл<input name="reason" required/></label>
   </DataAction>}
  </div>)}
 </details>;
}

export function JournalDesk({journal,population,paper,role,engagement,evidence,findings,run}:{
 journal?:JournalRun;population?:PopulationView;paper:WorkItem&{editable:boolean};role:PilotRole;engagement:string;
 evidence:(Evidence&{current?:boolean})[];findings:Finding[];run:PilotAction;
}){
 const [selected,setSelected]=useState('');
 const source=population?.current;
 const ready=!!population?.usable&&!!source&&source.rows.filter(r=>r.state==='accepted').every(r=>r.journal&&r.entryType);
 if(!journal&&!ready)return null;
 const caseRow=journal?.cases.find(c=>c.id===selected);
 const result=caseRow?.investigations.at(-1);
 const review=paper.reviewer===({preparer:'nomin',reviewer:'temuulen',partner:'bat'}[role]);
 const extra={form:paper.form,version:String(journal?.version??'')};
 const reasons:Record<string,string>={manual:'Гар бичилт',amount:'Босго давсан бичилт',cutoff:'Тайлант үеийн төгсгөл'};
 const original=(id:string)=>'/api/pilot/evidence/'+id+pilotScope(engagement);
 return <details className="feature-detail space-top" open={!!journal}>
  <summary>Журналын бичилтийн шинжилгээ {journal&&'· v'+journal.version}</summary>
  {ready&&paper.editable&&paper.status!=='submitted'&&<DataAction run={run} action="journal-run" extra={{form:paper.form}} button="Шалгуураар сонгох">
   <p className="micro">Гар бичилт, мөрийн үнэмлэхүй дүн ба тайлант үеийн төгсгөлийн шалгуур.</p>
   <div className="field-grid">
    <label>Дүнгийн босго<input name="threshold" type="number" min=".01" step=".01" defaultValue={journal?journal.threshold/100:undefined} required/></label>
    <label>Төгсгөлийн хоног<input name="days" type="number" min={0} max={31} defaultValue={journal?.days} required/></label>
   </div>
  </DataAction>}
  {journal&&<>
   <p><a href={original(journal.source)}>Эх олонлог v{journal.population}</a> · {journal.cases.length} тохиолдол · {journal.approval?.reason??'Хянаагүй'}</p>
   {!journal.current&&<p className="callout amber">Шалгалтын суурь өөрчлөгдсөн. Одоогийн эх олонлог дээр дахин ажиллуулна уу.</p>}
   {!!journal.cases.length&&<label>Сонгосон журнал<select value={selected} onChange={e=>setSelected(e.target.value)}>
    <option value="">Сонгох</option>{journal.cases.map(c=><option key={c.id} value={c.id}>{c.id} · {c.criteria.map(r=>reasons[r]).join(', ')}</option>)}
   </select></label>}
   {caseRow&&<>
    {caseRow.postings.map(r=><p key={r.row}>Эх мөр {r.row} · {r.id} · {r.account} · {r.date} · {money(r.cents)}</p>)}
    {result&&<p>{result.accounting} · <a href={original(result.evidence)}>Холбосон эх файл v{result.evidenceVersion}</a></p>}
    {journal.current&&paper.editable&&paper.status!=='submitted'&&<DataAction key={journal.version+'/'+selected} run={run} action="journal-investigate"
     extra={{...extra,entry:selected}} button="Шалгалтын дүгнэлт хадгалах">
     <div className="field-grid">
      <label>Зорилго<textarea name="purpose" defaultValue={result?.purpose} required/></label>
      <label>Зөвшөөрөл<textarea name="authority" defaultValue={result?.authority} required/></label>
      <label>Бүртгэлийн үнэлгээ<textarea name="accounting" defaultValue={result?.accounting} required/></label>
      <label>Үр дүн<select name="result" defaultValue={result?.result??'incomplete'}>
       <option value="incomplete">Шийдэгдээгүй</option><option value="explained">Тайлбарласан</option><option value="finding">Илрүүлэлт</option>
      </select></label>
      <label>Илрүүлэлтийн дүн<input name="amount" type="number" step=".01" min={0} defaultValue={result?result.cents/100:0} required/></label>
      <label>Хүлээн авсан нотлох баримт<select name="evidence" defaultValue={result?.evidence} required><option value="">Сонгох</option>
       {evidence.filter(e=>e.status==='accepted'&&e.current!==false&&!e.population).map(e=><option key={e.id} value={e.id}>{e.name} · v{e.version}</option>)}
      </select></label>
     </div>
    </DataAction>}
   </>}
   {journal.current&&review&&!journal.approval&&<DataAction run={run} action="journal-review" extra={extra} button="Журналын шалгалтыг батлах">
    <label>Хяналтын үндэслэл<input name="reason" required/></label>
   </DataAction>}
   {!!journal.history.length&&<details className="feature-detail"><summary>Өмнөх ажиллуулалтууд</summary>
    {journal.history.map(h=><p key={h.version}>v{h.version} · <a href={original(h.source)}>Эх олонлог v{h.population}</a> · {h.count} тохиолдол · {h.approval?.reason??'Хянаагүй'}</p>)}
   </details>}
  </>}
  {findings.map(f=><div className="bench-item" key={f.id}>
   <p>{f.title} · {f.amount.toLocaleString()} · {f.resolution??'Шийдвэр хүлээж байна'}</p>
   {role==='partner'&&paper.status==='reviewed'&&!f.resolution&&<DataAction run={run} action="fieldwork-resolve-finding" extra={{id:f.id}} button="Илрүүлэлтийн шийдвэр хадгалах">
    <label>Шийдвэрийн үндэслэл<input name="reason" required/></label>
   </DataAction>}
  </div>)}
 </details>;
}
