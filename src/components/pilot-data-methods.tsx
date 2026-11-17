import {useState,type FormEvent} from 'react';
import {dataMethodNames,dataMethodColumns,type DataMethodsView,type DataRevision} from '@/lib/pilot-data-methods';
import type {Evidence} from '@/lib/workspace';
import type {PilotRole} from '@/lib/pilot-registers';
import type {PilotAction} from './pilot-registers';
import {DataAction} from './pilot-population';

const lines=(value:FormDataEntryValue|null)=>String(value??'').split(/\r?\n/).filter(x=>x.trim()).map(line=>line.split(',').map(x=>x.trim()));
export function DataMethodsDesk({data,role,evidence,run}:{data?:DataMethodsView;role:PilotRole;evidence:(Evidence&{current?:boolean})[];run:PilotAction}){
 const [method,setMethod]=useState('AUTO-003'),[profile,setProfile]=useState('');if(!data)return null;
 const accepted=evidence.filter(e=>e.status==='accepted'&&e.current!==false),selected=data.profiles.find(p=>p.id===profile)?.current;
 async function saveProfile(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=new FormData(event.currentTarget),mapping=Object.fromEntries(['id','account','amount','debit','credit','entity','date','currency','journal','entry_type','reference'].map(key=>[key,String(form.get('map.'+key)??'').trim()]).filter(([,v])=>v));if(await run('data-profile-save',{id:profile,name:String(form.get('name')),definition:JSON.stringify({amount:form.get('amount'),unit:form.get('unit'),sign:form.get('sign'),dateFormat:form.get('dateFormat'),mapping})}))setProfile('');}
 function calculate(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const form=new FormData(event.currentTarget),configuration:Record<string,unknown>={currency:form.get('currency')};
  if(method==='AUTO-003')Object.assign(configuration,{sourceCount:Number(form.get('sourceCount')),sourceTotal:form.get('sourceTotal'),businessKey:String(form.get('businessKey')).split(',').map(x=>x.trim())});
  if(method==='AUTO-004')configuration.family=form.get('family');
  if(method==='AUTO-005')Object.assign(configuration,{tolerance:form.get('tolerance'),grain:form.get('grain'),ledgerScope:form.get('ledgerScope')});
  if(method==='AUTO-006')Object.assign(configuration,{tolerance:form.get('tolerance'),mapping:lines(form.get('mapping')).map(([account,line,sign])=>({account,line,sign:Number(sign)}))});
  if(method==='AUTO-007'){const totals=new Map<string,{id:string;operands:{id:string;sign:number}[]}>();for(const [id,operand,sign] of lines(form.get('totals'))){if(!totals.has(id))totals.set(id,{id,operands:[]});totals.get(id)!.operands.push({id:operand,sign:Number(sign)});}Object.assign(configuration,{tolerance:form.get('tolerance'),totals:[...totals.values()],references:lines(form.get('references')).map(([from,to])=>({from,to})),repeated:lines(form.get('repeated')).map(([from,to,sign])=>({from,to,sign:Number(sign)}))});}
  if(method==='AUTO-008')Object.assign(configuration,{priorPeriod:form.get('priorPeriod'),currentPeriod:form.get('currentPeriod'),priorBasis:form.get('priorBasis'),crosswalk:lines(form.get('crosswalk')).map(([prior,current])=>({prior,current})),adjustments:lines(form.get('adjustments')).map(([account,amount,record])=>({account,amount,record}))});
  if(method==='AUTO-010')Object.assign(configuration,{currentPeriod:form.get('currentPeriod'),priorPeriod:form.get('priorPeriod'),relationships:lines(form.get('relationships')).map(([key,absolute,percentage,predicate])=>({key,absolute,percentage,predicate})),ratios:lines(form.get('ratios')).map(([name,numerator,denominator,expected,tolerance])=>({name,numerator,denominator,expected,tolerance}))});
  void run('data-check-run',{id:String(form.get('refresh')??''),method,primary:String(form.get('primary')),secondary:String(form.get('secondary')??''),use:String(form.get('use')),configuration:JSON.stringify(configuration)});
 }
 const files=(name:string,label:string,required=true)=><label>{label}<select name={name} required={required}><option value="">Сонгох</option>{accepted.map(e=><option key={e.id} value={e.id}>{e.name} · v{e.version}</option>)}</select></label>;
 return <section className="card pad bench-card" data-data-methods>
  <h2>Импортын профайл ба өгөгдлийн баталсан аргууд</h2>
  <p>Эх файл бүр өөрийн хувилбар, байгууллага, үе, валют ба мөрийн нэгжтэй. Арифметик таарц нь нотолгооны хангалттай байдлын дүгнэлт биш.</p>
  {!data.managed&&role==='partner'&&<DataAction action="evidence-enable" run={run} button="G03 хэрэглээний хяналтыг идэвхжүүлэх"><label>Шалтгаан<textarea name="reason" required/></label></DataAction>}
  {role!=='partner'&&<details className="feature-detail"><summary>Баганын зураглалтай импортын профайл</summary>
   <label>Засах / шинэ профайл<select value={profile} onChange={e=>setProfile(e.target.value)}><option value="">Шинэ профайл</option>{data.profiles.filter(p=>p.current.by===role&&p.current.status!=='submitted').map(p=><option key={p.id} value={p.id}>{p.current.name} · v{p.current.version}</option>)}</select></label>
   <form className="feature-form" data-profile-form key={profile+'/'+selected?.version} onSubmit={event=>void saveProfile(event)}><div className="field-grid">
    <label>Профайлын нэр<input name="name" defaultValue={selected?.name} required/></label>
    <label>Дүнгийн эх<select name="amount" defaultValue={selected?.definition?.amount??'signed'}><option value="signed">Тэмдэгтэй дүн</option><option value="debit-credit">Дебит ба кредит тусдаа</option></select></label>
    <label>Эхийн мөнгөн нэгж<select name="unit" defaultValue={selected?.definition?.unit??'major'}><option value="major">Үндсэн нэгж · 1.00</option><option value="minor">1/100 нэгж · бүхэл тоо</option></select></label>
    <label>Эхийн тэмдэг<select name="sign" defaultValue={selected?.definition?.sign??'debit-positive'}><option value="debit-positive">Дебит эерэг</option><option value="credit-positive">Кредит эерэг</option></select></label>
    <label>Огнооны яг формат<select name="dateFormat" defaultValue={selected?.definition?.dateFormat??'iso'}><option value="iso">YYYY-MM-DD</option><option value="dmy">DD/MM/YYYY</option></select></label>
    {(['id','account','amount','debit','credit','entity','date','currency','journal','entry_type','reference'] as const).map(key=><label key={key}>Эхийн багана → {({id:'Мөрийн түлхүүр',account:'Данс',amount:'Тэмдэгтэй дүн',debit:'Дебит',credit:'Кредит',entity:'Байгууллага',date:'Огноо',currency:'Валют',journal:'Журнал',entry_type:'Гүйлгээний төрөл',reference:'Ишлэл'})[key]}<input name={'map.'+key} defaultValue={selected?.definition?.mapping[key]} placeholder={key}/></label>)}
   </div><button className="btn primary">Профайлын шинэ хувилбар хадгалах</button></form>
  </details>}
  {data.profiles.map(p=><RevisionCard key={p.id} row={p.current} history={p.versions} profile role={role} run={run} evidence={accepted}/>)}
  {role!=='partner'&&<details className="feature-detail"><summary>Эхэд тулгуурласан шинэ тооцоолол</summary><form className="feature-form" data-method-form onSubmit={calculate}>
   <p className="micro">{dataMethodColumns[method]} Мөнгөн дүн нь үндсэн нэгжээр; unit нь тайлангийн дэлгэцийн 1, 1000 эсвэл 1000000 нэгж. period нь YYYY-MM-DD.</p>
   <div className="field-grid"><label>Хяналтын арга<select value={method} onChange={e=>setMethod(e.target.value)}>{Object.entries(dataMethodNames).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>{files('primary','Баталсан үндсэн эх')}{!['AUTO-007'].includes(method)&&files('secondary',method==='AUTO-003'?'Хараат бус эхийн хяналтын файл':'Тулган шалгах баталсан эх')}
    <label>Нэг валютын код<input name="currency" maxLength={3} placeholder="MNT" required/></label><label>Бодит хэрэглээ ба хязгаар<textarea name="use" required/></label>
    <label>Шинэчлэх өмнөх тооцоолол<select name="refresh"><option value="">Шинэ тооцоолол</option>{data.checks.filter(c=>c.current.by===role&&c.current.status!=='submitted'&&c.current.method===method).map(c=><option key={c.id} value={c.id}>{c.current.use} · v{c.current.version}</option>)}</select></label>
    {method==='AUTO-003'&&<><label>Баталгаатай эхийн нийт мөрийн тоо<input name="sourceCount" type="number" min={0} required/></label><label>Баталгаатай эхийн нийт дүн<input name="sourceTotal" required/></label><label>Бизнес түлхүүрийн талбарууд<input name="businessKey" placeholder="id эсвэл journal,reference" required/></label></>}
    {method==='AUTO-004'&&<label>Яг тулгах мастер<select name="family">{['account','customer','supplier','employee','item','currency'].map(name=><option key={name}>{name}</option>)}</select></label>}
    {['AUTO-005','AUTO-006','AUTO-007'].includes(method)&&<label>Баталсан хүлцэл · үндсэн мөнгөн нэгж<input name="tolerance" type="number" step=".01" min={0} required/></label>}
    {method==='AUTO-005'&&<><label>TB мөрийн нэгж<select name="grain"><option value="account">Данс бүр нэг мөр</option><option value="account-detail">Дансны дэлгэрэнгүй · тусдаа мөрийн ID</option></select></label><label>Журналын бодит хамрах хүрээ<select name="ledgerScope"><option value="selected">Сонгосон данснууд</option><option value="complete">Бүрэн журнал</option></select></label></>}
    {method==='AUTO-006'&&<label>Данс,тайлангийн мөр,тэмдэг (+1 эсвэл -1)<textarea name="mapping" required/></label>}
    {method==='AUTO-007'&&<><label>Нийлбэрийн ID,оролтын ID,тэмдэг<textarea name="totals"/></label><label>Ишлэлийн эх ID,зорилтот ID<textarea name="references"/></label><label>Давтагдсан дүнгийн эх ID,зорилтот ID,тэмдэг<textarea name="repeated"/></label></>}
    {method==='AUTO-008'&&<><label>Өмнөх аудитлагдсан хаалтын өдөр<input name="priorPeriod" type="date" required/></label><label>Одоогийн эхний өдөр<input name="currentPeriod" type="date" defaultValue={data.context?.start} required/></label><label>Өмнөх аудитлагдсан эхийн бодит эрх ба шалгасан үндэс<textarea name="priorBasis" required/></label><label>Өмнөх данс,одоогийн данс · өөрчлөгдсөн бол<textarea name="crosswalk"/></label><label>Данс,баталсан залруулгын дүн,нээлтийн үнэлгээний бүртгэлийн ID<textarea name="adjustments"/></label></>}
    {method==='AUTO-010'&&<><label>Одоогийн харьцуулах өдөр<input name="currentPeriod" type="date" required/></label><label>Өмнөх харьцуулах өдөр<input name="priorPeriod" type="date" required/></label><label>Мөрийн код,үнэмлэхүй босго,хувийн босго,or / and<textarea name="relationships"/></label><label>Харьцааны нэр,хүртвэрийн код,хуваарийн код,хүлээгдсэн дүн,хүлцэл<textarea name="ratios"/></label></>}
   </div><button className="btn primary">Яг эхүүдээр тооцоолж хадгалах</button>
  </form></details>}
  {data.checks.map(p=><RevisionCard key={p.id} row={p.current} history={p.versions} role={role} run={run} evidence={accepted}/>)}
 </section>;
}
const monetary=new Set(['opening','closing','debit','credit','rollforward','debitResidual','creditResidual','balance','grossDebit','grossCredit','wholeLedgerBalance','sourceTotal','bridgedTotal','amountResidual','computed','reported','residual','adjustment','prior','actual','delta','gross']);
function RevisionCard({row,history,profile=false,role,run,evidence}:{row:DataRevision;history:DataRevision[];profile?:boolean;role:PilotRole;run:PilotAction;evidence:Evidence[]}){
 const [page,setPage]=useState(0);
 const prefix=profile?'data-profile-':'data-check-',extra={id:row.id,version:String(row.version)},editable=row.by===role&&['draft','returned'].includes(row.status);
 const columns=[...new Set((row.outputs??[]).flatMap(output=>Object.keys(output)))],lastPage=Math.max(0,Math.ceil((row.outputs?.length??0)/100)-1),index=Math.min(page,lastPage);
 const display=(key:string,value:unknown)=>typeof value==='number'?monetary.has(key)?(value/100).toLocaleString(undefined,{maximumFractionDigits:2}):String(value):value===null?'Тодорхойгүй':value===undefined?'—':Array.isArray(value)?value.join(', '):String(value);
 return <details className="feature-detail" data-data-revision={row.id}><summary>{profile?row.name:dataMethodNames[row.method??'']} · v{row.version} · {row.status}{!profile&&row.status==='approved'&&!row.usable?' · хэрэглээний суурь өөрчлөгдсөн / хязгаарлалттай':''}</summary>
  {row.use&&<p>{row.use}</p>}{row.inputs?.map(ref=><p key={ref.id}>{ref.name} · v{ref.version} · {ref.sha256.slice(0,12)}</p>)}
  {!profile&&<><p>Зөрүү {row.issues?.length??0} · шинжилгээний нээлттэй асуудал {row.cases?.filter(c=>c.result!=='resolved').length??0}. Мөнгөн дүнг үндсэн нэгжээр харуулав; тайлангийн мөр нь өөрийн заасан дэлгэцийн нэгжтэй.</p>
   {row.outputs?.length? <><div className="table-scroll"><table className="ew-table"><thead><tr>{columns.map(key=><th key={key}>{key}</th>)}</tr></thead><tbody>{row.outputs.slice(index*100,(index+1)*100).map((output,i)=><tr key={i}>{columns.map(key=><td key={key}>{display(key,output[key])}</td>)}</tr>)}</tbody></table></div>{lastPage>0&&<div className="row-actions"><button className="btn secondary" disabled={index===0} onClick={()=>setPage(index-1)}>Өмнөх</button><span>{index+1}/{lastPage+1}</span><button className="btn secondary" disabled={index===lastPage} onClick={()=>setPage(index+1)}>Дараах</button></div>}</>:null}
   {!!row.issues?.length&&<details><summary>Бүх илэрсэн зөрүү ({row.issues.length})</summary><ul>{row.issues.map((issue,i)=><li key={i}>{Object.entries(issue).map(([k,v])=>k+': '+display(k,v)).join(' · ')}</li>)}</ul></details>}
   {editable&&row.cases?.map(c=><DataAction key={c.id} run={run} action="data-check-explain" extra={{...extra,case:c.id}} button="Энэ тайлбарыг хадгалах"><p>{c.id}</p><label>Бодит тайлбар ба шалгасан ажил<textarea name="reason" required/></label><label>Дүгнэлт<select name="result"><option value="incomplete">Нэмэлт ажил</option><option value="resolved">Бодит эхээр шийдвэрлэсэн</option></select></label><label>Дэмжих эх<select name="evidence" required>{evidence.map(e=><option key={e.id} value={e.id}>{e.name} · v{e.version}</option>)}</select></label></DataAction>)}
  </>}
  {editable&&<button className="btn secondary" onClick={()=>void run(prefix+'submit',extra)}>Яг энэ хувилбарыг хяналтад илгээх</button>}
  {row.status==='submitted'&&role!=='preparer'&&row.by!==role&&<div className="field-grid"><DataAction action={prefix+'approve'} extra={extra} run={run} button="Хараат бусаар батлах">{!profile&&<label>Хэрэглээний шийдвэр<select name="disposition"><option value="limited">Хязгаарлалттай</option><option value="usable">Зөвшөөрсөн хэрэглээнд бэлэн</option></select></label>}<label>Яг эх, параметр ба үр дүнг хянасан үндэс<textarea name="reason" required/></label></DataAction><DataAction action={prefix+'return'} extra={extra} run={run} button="Засварт буцаах"><label>Засах бодит асуудал<textarea name="reason" required/></label></DataAction></div>}
  <details><summary>Хувилбарын түүх ({history.length})</summary>{history.map(version=><details key={version.version}><summary>v{version.version} · {version.by} · {version.at} · {version.status}</summary><p>{version.review?.reason}</p>{version.events?.map((event,i)=><p className="micro" key={i}>{event.at} · {event.by} · {event.operation} · {event.status} · {event.review?.reason}</p>)}{version.cases?.map(c=><p key={c.id}>{c.id} · {c.result} · {c.reason}</p>)}</details>)}</details>
 </details>;
}
