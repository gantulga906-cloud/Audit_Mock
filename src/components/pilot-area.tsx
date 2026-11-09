import {useState} from 'react';
import {areaFlags,areaMethods,areaProfiles,areaSources,type AreaLink,type AreaRun} from '@/lib/pilot-area';
import {pilotScope,type PilotRole} from '@/lib/pilot-registers';
import type {PopulationView} from '@/lib/pilot-population';
import type {Evidence,Finding,WorkItem} from '@/lib/workspace';
import {DataAction} from './pilot-population';
import type {PilotAction} from './pilot-registers';

const labels:Record<string,string>={
 invoices:'Нэхэмжилсэн',ledger:'Дэвтрийн дүн',creditAtClose:'Хаалтын өмнөх кредит',open:'Хаалтын авлага',
 subsequentCash:'Тулгасан дараа үеийн төлөлт',remaining:'Үлдсэн авлага',notDue:'Хугацаа болоогүй',
 days1to30:'1–30 хоног',days31to60:'31–60 хоног',days61to90:'61–90 хоног',over90:'90-ээс дээш',
 receipts:'Хүлээн авсан',payments:'Тулгасан төлбөр',candidateLiability:'Шалгах өглөгийн дүн',
 bankMovements:'Банкны хөдөлгөөн',bookMovements:'Дэвтрийн хөдөлгөөн',bankAdjusted:'Тохируулсан банк',
 bookAdjusted:'Тохируулсан дэвтэр',residual:'Үлдэгдлийн зөрүү',matched:'Таарсан гүйлгээ',
 invoice:'Нэхэмжилсэн',posting:'Дэвтрийн бичилт',credit:'Кредит',receipt:'Төлөлт',allocated:'Хуваарилсан',
 expected:'Тооцоолсон дүн',candidate:'Шалгах дүн',received:'Хүлээн авсан дүн',invoiced:'Нэхэмжилсэн дүн',
 price:'Нэгж үнэ',discount:'Хөнгөлөлт',allowedPrice:'Баталсан үнэ',allowedDiscount:'Зөвшөөрсөн хөнгөлөлт',
 adjustment:'Тохируулга',payment:'Төлбөр',paid:'Төлсөн дүн',bank:'Банкны дүн',reference:'Лавлах дугаар',
 invoiceDate:'Нэхэмжилсэн өдөр',deliveryDate:'Хүргэсэн өдөр',receiptDate:'Хүлээн авсан өдөр',
 inventoryValue:'Бүртгэлийн бараа материал',countedItems:'Тоолсон нэр төрөл',unresolvedCounts:'Тооллогын шийдэгдээгүй зөрүү',
 expectedQuantity:'Тооцоолсон тоо',closingQuantity:'Бүртгэлийн эцсийн тоо',countedQuantity:'Тоолсон тоо',
 assetCost:'Хөрөнгийн эцсийн өртөг',accumulated:'Хуримтлагдсан элэгдэл',carrying:'Дансны цэвэр дүн',
 additions:'Нэмэгдэл',addition:'Нэмэгдлийн баримт',supported:'Баримтаар дэмжсэн',expectedCost:'Тооцоолсон өртөг',
 expectedAccumulated:'Тооцоолсон хуримтлагдсан элэгдэл',cost:'Бүртгэлтэй өртөг',
 gross:'Нийт цалин',expectedEmployee:'Тооцоолсон ажилтны шимтгэл',expectedEmployer:'Тооцоолсон ажил олгогчийн шимтгэл',
 expectedWithholding:'Тооцоолсон суутгал',expectedNet:'Тооцоолсон цэвэр цалин',recordedNet:'Бүртгэсэн цэвэр цалин',
 expectedLiability:'Тооцоолсон суутгал ба шимтгэлийн өглөг',expectedExpense:'Тооцоолсон зардал',bankPaid:'Банкны төлөлт',
 ledgerExpense:'Дэвтрийн зардал',ledgerLiability:'Дэвтрийн өглөг',ledgerSettlement:'Дэвтрийн төлөлт',
 expectedTax:'Тооцоолсон тайлант татвар',recordedTax:'Бүртгэсэн татвар',deferredTax:'Тооцоолсон хойшлогдсон татвар',
 filedTax:'Тайлан эсвэл хүснэгтийн дүн',taxPaid:'Татварын төлөлт',ledgerTax:'Дэвтрийн татвар',unsettledTax:'Үлдсэн татвар',
 loanPrincipal:'Тооцоолсон зээлийн үндсэн дүн',loanInterest:'Тооцоолсон зээлийн хүү',recordedInterest:'Бүртгэсэн хүү',
 ledgerInterest:'Дэвтрийн хүү',headroom:'Гэрээний шалгуурын нөөц',closing:'Бүртгэсэн эцсийн үлдэгдэл',
 initialLiability:'Анхны түрээсийн өр төлбөр',initialRou:'Анхны ашиглах эрхийн хөрөнгө',
 leaseLiability:'Тооцоолсон түрээсийн өглөг',leaseRou:'Тооцоолсон ашиглах эрхийн хөрөнгө',
 recordedLiability:'Бүртгэсэн түрээсийн өглөг',recordedRou:'Бүртгэсэн ашиглах эрх',ledgerRou:'Дэвтрийн ашиглах эрх',
 fxFunctional:'Тооцоолсон үйл ажиллагааны валютын дүн',fxRecorded:'Бүртгэсэн валютын дүн',equityClosing:'Тооцоолсон өмчийн үлдэгдэл',
 contributions:'Баталсан оруулсан хөрөнгө',distributions:'Баталсан хуваарилалт',investmentCost:'Хөрөнгө оруулалтын тооцоолсон өртөг',
 investmentIncome:'Хөрөнгө оруулалтын орлого',valuedInstruments:'Тооцсон хэрэгслийн тоо',investmentPv:'Тооцоолсон өнөөгийн үнэ цэнэ',
 ledgerIncome:'Дэвтрийн хөрөнгө оруулалтын орлого',expectedUnits:'Тооцоолсон нэгж',closingUnits:'Бүртгэсэн нэгж',valuation:'Бүртгэсэн үнэлгээ',
 payChanges:'Босго давсан ажилтан-сар',offCycle:'Хуваариас гадуурх ажилтан-сар',missingComparator:'Харьцуулах суурьгүй ажилтан-сар',
 priorGross:'Өмнөх сарын нийт цалин',deltaGross:'Цалингийн өөрчлөлт',
};
const amount=(value:number)=>new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(value/100);
const countKeys=['matched','countedItems','unresolvedCounts','expectedQuantity','closingQuantity','countedQuantity','valuedInstruments',
 'expectedUnits','closingUnits','payChanges','offCycle','missingComparator'];
const display=(key:string,value:number|string)=>typeof value==='string'||countKeys.includes(key)?value:amount(value);
const roleId={preparer:'nomin',reviewer:'temuulen',partner:'bat'};

function SourceRows({item,area,href}:{item:AreaLink;area:AreaRun;href:(id:string)=>string}){
 return <>
  <dl className="register-values">{Object.entries(item.metrics).map(([key,value])=><div key={key}>
   <dt>{labels[key]??key}</dt><dd>{display(key,value)}</dd>
  </div>)}</dl>
  <ul>{item.trace.map(t=>{
   const source=t.source==='ledger'?{id:area.source,name:'Баталсан дэвтэр'}:area.files[t.source];
   return <li key={t.source+'/'+t.row}><a href={href(source.id)}>{source.name}</a> · эх мөр {t.row}</li>;
  })}</ul>
 </>;
}

export function AreaDesk({paper,area,population,evidence,role,engagement,through,findings,run}:{
 paper:WorkItem&{editable:boolean};area?:AreaRun;population?:PopulationView;evidence:(Evidence&{current?:boolean})[];
 role:PilotRole;engagement:string;through:string;findings:Finding[];run:PilotAction;
}){
 const [selected,setSelected]=useState(''),[linked,setLinked]=useState('');
 const profile=areaProfiles[paper.form as keyof typeof areaProfiles];
 if(!profile)return null;
 const method=Object.hasOwn(areaMethods,profile.method)?areaMethods[profile.method as keyof typeof areaMethods]:undefined;
 const item=area?.cases.find(c=>c.id===selected), disposition=item?.reviews?.at(-1);
 const sourceMatch=area?.links.find(link=>link.id===linked);
 const extra={form:paper.form,version:String(area?.version??'')};
 const eligible=evidence.filter(e=>e.status==='accepted'&&e.current!==false&&!e.population);
 const csv=eligible.filter(e=>/\.csv$/i.test(e.name));
 const preparer=paper.editable&&paper.status!=='submitted';
 const reviewer=paper.reviewer===roleId[role]&&paper.owner!==roleId[role];
 const href=(id:string)=>'/api/pilot/evidence/'+id+pilotScope(engagement);
 return <details className="feature-detail space-top" open={!!area}>
  <summary>{profile.title}{area?' · v'+area.version:''}</summary>
  {!population?.usable&&<p className="muted">Дэвтрийн баталсан эх олонлог шаардлагатай.</p>}
  {preparer&&population?.usable&&<details className="feature-detail">
   <summary>Эх файлууд сонгож горим ажиллуулах</summary>
   <p className="micro">Туслах нотлох баримтад CSV файлуудаа хавсаргаж, тусад нь үнэлнэ. Дэвтрийн reference баганад яг таарах эх дугаарыг ашиглана.</p>
   <DataAction run={run} action="area-run" extra={{form:paper.form}} button="Горим ажиллуулах">
    <div className="field-grid">
     <label>{method?.primary??'Дэвтрийн баталсан мөр'}<select name="line" defaultValue={area?.line} required>
      <option value="">Сонгох</option>{population.current.bridge.filter(b=>b.accounts.length).map(b=><option key={b.line} value={b.line}>{b.line}</option>)}
     </select></label>
     <label>Шалгалт хамрах эцсийн огноо<input name="through" type="date" defaultValue={area?.through??through} required/></label>
     {profile.method!=='bank'&&<label>Хүлээгдэж буй бичилтийн тэмдэг<select name="sign" defaultValue={area?.params.sign??(['3.1.9','3.1.10','3.1.14','3.1.15','3.1.16','3.1.21'].includes(paper.form)?'credit':'debit')}>
      <option value="debit">Дебет эерэг</option><option value="credit">Кредит эерэг болгон хөрвүүлэх</option>
     </select></label>}
     {method?.edition&&<label>Баталсан дүрмийн хувилбар<input name="edition" defaultValue={area?.params.edition} required/></label>}
     {method?.lines.map(([name,label,polarity])=><label key={name}>{label}<select name={name} defaultValue={area?.params.lines?.[name]} required>
      <option value="">Сонгох</option>{population.current.bridge.filter(b=>b.accounts.length).map(b=><option key={b.line} value={b.line}>{b.line}</option>)}
     </select><small>{polarity==='debit'?'Дебет эерэг дүн.':'Кредит эерэг болгон хөрвүүлнэ.'}</small></label>)}
     {profile.inputs.map(key=><label key={key}>{areaSources[key].label}
      <select name={key} defaultValue={area?.files[key]?.id} required><option value="">Сонгох</option>
       {csv.map(file=><option key={file.id} value={file.id}>{file.name} · v{file.version}</option>)}
      </select><small>{areaSources[key].columns}</small>
     </label>)}
     {profile.method==='payroll'&&(['payrollHistory','payrollVariance'] as const).map(key=><label key={key}>
      {areaSources[key].label} (хоёуланг сонговол харьцуулна)
      <select name={key} defaultValue={area?.files[key]?.id}><option value="">Сонгох</option>
       {csv.map(file=><option key={file.id} value={file.id}>{file.name} · v{file.version}</option>)}
      </select><small>{areaSources[key].columns}</small>
     </label>)}
    </div>
   </DataAction>
  </details>}
  {area&&<>
   {!area.current&&<p className="callout amber">Эх өгөгдөл эсвэл томилгоо өөрчлөгдсөн. Шинэ хувилбарыг ажиллуулна уу.</p>}
   <p><a href={href(area.source)}>Дэвтэр v{area.population}</a> · {area.line} · {area.currency} · {area.through}</p>
   {area.params.edition&&<p>Баталсан дүрмийн хувилбар · {area.params.edition}</p>}
   <div className="row-actions">{Object.entries(area.files).map(([key,file])=><a key={key} href={href(file.id)}>{file.name} v{file.version}</a>)}</div>
   <dl className="register-values">{Object.entries(area.summary).map(([key,value])=><div key={key}>
    <dt>{labels[key]??key}</dt><dd>{display(key,value)}</dd>
   </div>)}</dl>
   <p>{area.cases.length} тохиолдол · {area.cases.filter(c=>c.reviews?.at(-1)?.result&&c.reviews.at(-1)?.result!=='open').length} үнэлсэн</p>
   {!!area.links.length&&<details className="feature-detail"><summary>Тулгасан эх мөр ба хуваарилалт ({area.links.length})</summary>
    <label>Гүйлгээ эсвэл бүртгэл<select value={linked} onChange={e=>setLinked(e.target.value)}>
     <option value="">Сонгох</option>{area.links.map(link=><option key={link.id} value={link.id}>{link.label}</option>)}
    </select></label>
    {sourceMatch&&<SourceRows item={sourceMatch} area={area} href={href}/>}
   </details>}
   {!!area.cases.length&&<label>Шалгах тохиолдол<select value={selected} onChange={e=>setSelected(e.target.value)}>
    <option value="">Сонгох</option>{area.cases.map(c=><option key={c.id} value={c.id}>{c.label} · {c.flags.map(f=>areaFlags[f]).join(', ')}</option>)}
   </select></label>}
   {item&&<div className="bench-item">
    <p>{item.flags.map(flag=>areaFlags[flag]).join(' · ')}</p>
    <SourceRows item={item} area={area} href={href}/>
    {disposition&&<p>{disposition.note} · <a href={href(disposition.evidence)}>Шалгасан нотлох баримт</a></p>}
    {preparer&&area.current&&<DataAction key={item.id+'/'+area.version} run={run} action="area-dispose" extra={{...extra,case:item.id}} button="Тохиолдлын үнэлгээ хадгалах">
     <div className="field-grid">
      <label>Үр дүн<select name="result" defaultValue={disposition?.result??'open'}>
       <option value="open">Нээлттэй</option><option value="explained">Тайлбарласан</option><option value="finding">Илрүүлэлт</option>
      </select></label>
      <label>Илрүүлэлтийн дүн<input type="number" name="amount" min={0} step=".01" defaultValue={(disposition?.amount??0)/100} required/></label>
      <label>Нотлох баримт<select name="evidence" defaultValue={disposition?.evidence} required><option value="">Сонгох</option>
       {eligible.map(e=><option key={e.id} value={e.id}>{e.name} · v{e.version}</option>)}
      </select></label>
      <label>Гүйцэтгэсэн шалгалт ба үндэслэл<textarea name="note" defaultValue={disposition?.note} required/></label>
     </div>
    </DataAction>}
   </div>}
   {area.approval&&<p><b>Хянасан дүгнэлт</b> · {area.approval.conclusion}</p>}
   {area.current&&reviewer&&!area.approval&&<DataAction run={run} action="area-review" extra={extra} button="Горим ба дүгнэлт батлах">
    <label>Хянасан дүгнэлт<textarea name="conclusion" required/></label>
   </DataAction>}
   {!!area.history.length&&<details className="feature-detail"><summary>Өмнөх хувилбарууд</summary>
    {area.history.map(version=><div className="bench-item" key={version.version}>
     <p>v{version.version} · <a href={href(version.source)}>Дэвтэр v{version.population}</a> · {version.approval?.conclusion??'Хянаагүй'}</p>
     <div className="row-actions">{Object.values(version.files).map(file=><a key={file.id} href={href(file.id)}>{file.name} v{file.version}</a>)}</div>
    </div>)}
   </details>}
  </>}
  {findings.map(f=><div className="bench-item" key={f.id}>
   <p>{f.title} · {f.resolution??'Шийдвэр хүлээгдэж байна'}</p>
   {role==='partner'&&paper.status==='reviewed'&&!f.resolution&&<DataAction run={run} action="fieldwork-resolve-finding" extra={{id:f.id}} button="Илрүүлэлтийн шийдвэр хадгалах">
    <label>Шийдвэрийн үндэслэл<input name="reason" required/></label>
   </DataAction>}
  </div>)}
 </details>;
}
