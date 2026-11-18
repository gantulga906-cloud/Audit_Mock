import {actorKey} from './pilot-identity-context.mjs';
import {createHash,randomUUID} from 'node:crypto';
import {csvRows,cents} from './pilot-population.mjs';
import {evidenceCurrent} from './pilot-requests.mjs';
import {PilotError,input} from './pilot-workflow.mjs';
import {requireSeat} from './pilot-staffing.mjs';
import {approvedRows} from './pilot-registers.mjs';
import {recordEvent} from '../src/lib/workspace.ts';
import {validDate} from '../src/lib/feature-workflows.ts';
import {automationChecks} from '../src/lib/pilot-automation-methods.ts';
import {calculateAutomation} from './pilot-automation-checks.mjs';

const fail=(message,status=409)=>{throw new PilotError(status,message);};
const hash=value=>createHash('sha256').update(value).digest('hex');
const parse=(text,label)=>{try{return JSON.parse(text);}catch{fail(label+' · Өгөгдлийн бүтцийг шалгана уу.',400);}};
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const now=()=>new Date().toISOString();
function remember(version,role,operation,detail){
 const basis={definition:version.definition,configuration:version.configuration,inputs:version.inputs,outputs:version.outputs,cases:version.cases};
 (version.events??=[]).push({at:now(),by:actorKey(role),operation,status:version.status,digest:hash(JSON.stringify(basis)),...detail,
  ...(['submit','approve','return'].includes(operation)&&{inputs:structuredClone(version.inputs??[]),cases:structuredClone(version.cases??[]),review:version.review&&{...version.review}})});
}
export const managedEvidence=m=>!!m.pilotEvidenceEnabled;
const state=m=>m.pilotData??={profiles:[],checks:[]};
const last=items=>items.at(-1);
const money=(value,label)=>{const result=cents(String(value??''));if(result===null)fail(label+' · Мөнгөн дүнг шалгана уу.',400);return result;};
const numeric=(value,label)=>{if(value===null||value===undefined||typeof value==='string'&&!value.trim()||!Number.isFinite(Number(value)))fail(label+' · Тодорхой тоон утга шаардлагатай.',400);return Number(value);};
function validateProfile(definition){
 if(!object(definition)||!object(definition.mapping))fail('Импортын профайл ба зураглал шаардлагатай.',400);
 const required=['id','account','entity','date','currency',...(definition.amount==='signed'?['amount']:['debit','credit'])];
 if(required.some(key=>typeof definition.mapping[key]!=='string'||!definition.mapping[key].trim()))fail('Зайлшгүй талбар бүрийн яг эх баганыг зураглана уу.',400);
 definition.mapping=Object.fromEntries(Object.entries(definition.mapping).map(([key,value])=>[key,typeof value==='string'?value.trim():value]));
}
const safe=value=>{if(!Number.isSafeInteger(value))fail('Тооцооллын нарийвчлалын хязгаар давсан.',400);return value;};
const sum=(rows,key)=>rows.reduce((n,r)=>safe(n+r[key]),0);
const entity=m=>m.bench.clients[m.engagement].registration;
const approvedProfile=(m,id)=>last(state(m).profiles.find(p=>p.id===id)?.versions??[]);
export const currentImportProfile=(m,id)=>{const p=approvedProfile(m,id);return p?.status==='approved'?p:undefined;};
export function dataSource(m,files,id){
 const file=m.evidence.find(e=>e.id===id&&evidenceCurrent(m,e)),original=file&&files.read(id);
 if(!file||!original||hash(original.bytes)!==original.sha256)fail('Яг одоогийн хүлээн зөвшөөрсөн эх файл шаардлагатай.');
 return {id,version:file.version,sha256:original.sha256,name:file.name,bytes:original.bytes};
}
const sourceCurrent=(m,ref)=>m.evidence.some(e=>e.id===ref.id&&e.version===ref.version&&evidenceCurrent(m,e));
const populationDigest=rows=>hash(JSON.stringify(rows.map(r=>[r.row,r.id,r.cents,r.state,r.reason,r.issues,r.sourcePayload])));
const basisCurrent=(m,check)=>check.inputs.every(ref=>sourceCurrent(m,ref))&&
 (!check.populationBasis||check.populationBasis.evidence===m.pilotPopulation?.at(-1)?.evidence&&check.populationBasis.rowsDigest===populationDigest(m.pilotPopulation.at(-1).rows))&&
 (check.registers??[]).every(ref=>approvedRows(m,'M06-F05').some(r=>r.id===ref.id&&r.version===ref.version));
export const dataCheckCurrent=(m,check,files)=>{try{return check?.status==='approved'&&basisCurrent(m,check)&&last(state(m).checks.find(r=>r.id===check.id)?.versions??[])===check&&(!files||check.inputs.every(ref=>dataSource(m,files,ref.id).sha256===ref.sha256));}catch{return false;}};
export const approvedDataChecks=m=>state(m).checks.map(p=>last(p.versions)).filter(r=>dataCheckCurrent(m,r));

export function normalizePopulation(m,text,profile,currency){
 const [header,...records]=csvRows(text),columns=header?.cells??[];
 if(!header||!records.length)fail('Толгой ба өгөгдөлтэй CSV файл шаардлагатай.',400);
 if(new Set(columns).size!==columns.length)fail('Эх баганын нэр давхардсан.',400);
 const p=profile.definition,required=['id','account','entity','date','currency',...(p.amount==='signed'?['amount']:['debit','credit'])];
 if(required.some(key=>!p.mapping[key]||!columns.includes(p.mapping[key])))fail('Баталсан зураглалын эх багана дутуу.',400);
 const get=(row,key)=>row[columns.indexOf(p.mapping[key])]??'';
 const amount=text=>p.unit==='minor'?(/^[+-]?\d+$/.test(text)&&Number.isSafeInteger(Number(text))&&Math.abs(Number(text))<=100_000_000_000?Number(text):null):cents(text);
 const period=m.bench.periods[m.engagement];
 const rows=records.map(({line,cells,raw:sourcePayload})=>{
  const raw=get(cells,'date'),match=p.dateFormat==='dmy'?/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw):null;
  const date=p.dateFormat==='dmy'?(match?match[3]+'-'+match[2]+'-'+match[1]:''):raw;
  const debit=p.amount==='debit-credit'?amount(get(cells,'debit')):undefined,credit=p.amount==='debit-credit'?amount(get(cells,'credit')):undefined;
  let value=p.amount==='signed'?amount(get(cells,'amount')):debit!==null&&credit!==null&&debit>=0&&credit>=0?safe(debit-credit):null;
  if(value!==null&&p.sign==='credit-positive')value=-value;
  const id=get(cells,'id'),account=get(cells,'account'),rowEntity=get(cells,'entity'),rowCurrency=get(cells,'currency').toUpperCase(),issues=[];
  if(cells.length!==columns.length)issues.push('columns');if(!id||!account)issues.push('key');if(value===null)issues.push('amount');
  if(rowEntity!==entity(m))issues.push('entity');if(!validDate(date))issues.push('date');else if(date<period.start||date>period.end)issues.push('period');if(rowCurrency!==currency)issues.push('currency');
  return {row:line,id,account,entity:rowEntity,date,currency:rowCurrency,rawAmount:p.amount==='signed'?get(cells,'amount'):get(cells,'debit')+' / '+get(cells,'credit'),cents:value,issues,
   journal:get(cells,'journal')||undefined,entryType:get(cells,'entry_type')||undefined,reference:get(cells,'reference')||undefined,
   sourceCells:[...cells],sourceColumns:columns,sourcePayload,...(p.amount==='debit-credit'&&{debit,credit})};
 });
 return {rows,issues:[],profile:{id:profile.id,version:profile.version,definition:structuredClone(p)}};
}

function table(m,files,id,required,period){
 const original=dataSource(m,files,id);if(!/\.csv$/i.test(original.name)||original.bytes.length>750000)fail('Аргын эх нь 750 KB хүртэл UTF-8 CSV байна.',400);
 let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(original.bytes);}catch{fail('UTF-8 CSV эх шаардлагатай.',400);}
 const [header,...raw]=csvRows(text),columns=header?.cells??[];
 if(!raw.length||new Set(columns).size!==columns.length||required.some(key=>!columns.includes(key)))fail('Аргын зайлшгүй багана, давхардалгүй толгой ба өгөгдлийг шалгана уу · '+required.join(', '),400);
 const rows=raw.map(({line,cells})=>{if(cells.length!==columns.length)fail('Баганын тоо зөрүүтэй · '+line,400);return {...Object.fromEntries(columns.map((key,i)=>[key,cells[i]])),row:line};});
 const issues=[];for(const row of rows){if(row.entity!==entity(m))issues.push({row:row.row,issue:'entity'});if(row.currency&&!/^[A-Z]{3}$/.test(row.currency))issues.push({row:row.row,issue:'currency'});if(period&&row.period!==period)issues.push({row:row.row,issue:'period'});}
 const {bytes,...ref}=original;return {rows,issues,ref};
}
const groups=(rows,key)=>Map.groupBy(rows,r=>r[key]);
const unique=(rows,key,issues)=>{const grouped=groups(rows,key);for(const [id,items] of grouped)if(!id||items.length>1)issues.push({key:id,issue:'duplicate-or-missing-'+key,rows:items.map(r=>r.row)});return grouped;};
const sameCurrency=(rows,currency,issues)=>{for(const r of rows)if(r.currency!==currency)issues.push({row:r.row,issue:'currency'});};
const matchAmounts=(rows,keys)=>rows.map(r=>({...r,...Object.fromEntries(keys.map(key=>[key,money(r[key],key+' мөр '+r.row)]))}));

function calculate(m,files,method,primary,secondary,c){
 const issues=[],outputs=[],inputs=[],registers=[];let cases=[],populationBasis;
 for(const key of ['mapping','totals','references','repeated','crosswalk','adjustments','relationships','ratios'])if(c[key]!==undefined&&(!Array.isArray(c[key])||c[key].length>200||c[key].some(row=>!object(row))))fail('Аргын мөрийн бүтэц ба 200 хүртэлх хязгаарыг шалгана уу · '+key,400);
 const read=(id,required,period)=>{const t=table(m,files,id,required,period);issues.push(...t.issues);inputs.push(t.ref);return t.rows;};
 const currency=String(c.currency??'');if(!/^[A-Z]{3}$/.test(currency))fail('Тооцооллын нэг валютыг тодорхой сонгоно уу.',400);
 if(automationChecks[method]){
  const definition=automationChecks[method],policySource=dataSource(m,files,c.policy);
  if(!/\.json$/i.test(policySource.name)||policySource.bytes.length>80000)fail('An accepted bounded UTF-8 JSON method policy is required.');
  let policy;try{policy=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(policySource.bytes));}catch{fail('The exact method policy must contain valid UTF-8 JSON.');}
  if(!object(c.sources)||Object.keys(c.sources).length!==definition.inputs.length||definition.inputs.some(i=>typeof c.sources[i.key]!=='string')||c.sources[definition.inputs[0].key]!==primary)fail('Select every explicit source role for the supported method.');
  const tables=Object.fromEntries(definition.inputs.map(i=>[i.key,read(c.sources[i.key],['entity','currency',...i.columns.split(',')])]));
  const result=calculateAutomation(method,{entity:entity(m),currency,...m.bench.periods[m.engagement]},tables,policy),{bytes,...policyRef}=policySource;
  return {...result,inputs:[...new Map([...inputs,policyRef].map(ref=>[ref.id,ref])).values()]};
 }
 const primaryRows=required=>read(primary,['entity','currency',...required]);
 if(method==='AUTO-003'){
  const revision=m.pilotPopulation?.at(-1);if(!revision||revision.evidence!==primary)fail('Одоогийн эх олонлогийн яг эхийг сонгоно уу.');
  populationBasis={version:revision.version,evidence:revision.evidence,rowsDigest:populationDigest(revision.rows)};
  const control=dataSource(m,files,secondary);if(control.sha256===revision.sha256)fail('Импортын өөрийн дүн хараат бус эх болохгүй.');const {bytes,...ref}=control;inputs.push(ref);
  const original=dataSource(m,files,primary);inputs.push({...original,bytes:undefined});
  if(!Number.isInteger(c.sourceCount)||c.sourceCount<0)fail('Баталгаажуулсан эхийн мөрийн тоог оруулна уу.',400);
  const total=money(c.sourceTotal,'Эхийн дүн'),rows=revision.rows,known=rows.filter(r=>r.cents!==null&&r.currency===currency),amount=known.reduce((n,r)=>safe(n+r.cents),0);
  if(!rows.length||revision.issues.length)issues.push({issue:'failed-or-empty-import',details:revision.issues});
  const countResidual=c.sourceCount-rows.length,amountResidual=total-amount;
  if(countResidual||amountResidual||known.length!==rows.length)issues.push({issue:'unexplained-source-bridge',countResidual,amountResidual,invalidOrOtherCurrency:rows.length-known.length});
  const keys=c.businessKey;if(!Array.isArray(keys)||!keys.length||new Set(keys).size!==keys.length||keys.some(k=>!['id','account','journal','reference'].includes(k)))fail('Бизнес түлхүүрийн талбарыг тодорхой оруулна уу.',400);
  const keyed=Map.groupBy(rows,r=>JSON.stringify(keys.map(k=>r[k]??'')));for(const [key,items] of keyed)if(items.length>1||keys.some(k=>!items[0][k]))issues.push({issue:'business-key',key,rows:items.map(r=>r.row)});
  const exact=Map.groupBy(rows,r=>r.sourcePayload??JSON.stringify(r.sourceCells??[r.id,r.account,r.rawAmount,r.entity,r.date,r.currency]));for(const items of exact.values())if(items.length>1)issues.push({issue:'exact-payload-duplicate',rows:items.map(r=>r.row)});
  outputs.push({sourceCount:c.sourceCount,read:rows.length,...revision.counts,sourceTotal:total,bridgedTotal:amount,countResidual,amountResidual,currency,countsAreDisjoint:revision.counts.accepted+revision.counts.quarantined+revision.counts.excluded===rows.length,populationVersion:revision.version});
 }else if(method==='AUTO-004'){
  const family=c.family;if(!['account','customer','supplier','employee','item','currency'].includes(family))fail('Мастер мэдээллийн төрлийг сонгоно уу.',400);
  const transactions=primaryRows(['id',family,'date','amount']),masters=read(secondary,['id','entity','currency']);sameCurrency(transactions,currency,issues);sameCurrency(masters,currency,issues);
  const period=m.bench.periods[m.engagement];for(const row of transactions)if(!validDate(row.date)||row.date<period.start||row.date>period.end)issues.push({row:row.row,issue:'transaction-period'});
  for(const transaction of transactions){if(!validDate(transaction.date))fail('Гүйлгээний огноо буруу.',400);const candidates=masters.filter(r=>r.id===transaction[family]&&(!r.validFrom||r.validFrom<=transaction.date)&&(!r.validTo||r.validTo>=transaction.date));for(const r of masters)if(r.validFrom&&!validDate(r.validFrom)||r.validTo&&!validDate(r.validTo)||r.validFrom&&r.validTo&&r.validFrom>r.validTo)fail('Мастерын хүчинтэй хугацаа буруу.',400);outputs.push({id:transaction.id,row:transaction.row,key:transaction[family],matches:candidates.length,state:candidates.length===1?'matched':candidates.length?'ambiguous':'unmatched',gross:Math.abs(money(transaction.amount,'Гүйлгээ'))});}
  issues.push(...outputs.filter(r=>r.state!=='matched').map(r=>({issue:r.state,...r})));
 }else if(method==='AUTO-005'){
  if(!['account','account-detail'].includes(c.grain)||!['complete','selected'].includes(c.ledgerScope))fail('TB мөрийн нэгж ба журналын бүрэн / сонгосон хамрах хүрээг сонгоно уу.',400);
  const tolerance=money(c.tolerance,'Хүлцэл');if(tolerance<0)fail('Хүлцэл сөрөг биш байна.',400);
  const tb=matchAmounts(read(primary,['account','opening','debit','credit','closing','entity','currency','period'],m.bench.periods[m.engagement].end),['opening','debit','credit','closing']);sameCurrency(tb,currency,issues);
  unique(tb,c.grain==='account'?'account':'id',issues);
  const ledger=matchAmounts(read(secondary,['id','account','date','entity','currency','debit','credit']),['debit','credit']);sameCurrency(ledger,currency,issues);unique(ledger,'id',issues);
  const period=m.bench.periods[m.engagement];for(const row of ledger)if(!validDate(row.date)||row.date<period.start||row.date>period.end)issues.push({row:row.row,issue:'ledger-period'});
  for(const row of [...tb,...ledger])if(row.debit<0||row.credit<0)issues.push({row:row.row,issue:'negative-debit-credit'});
  const byAccount=groups(tb,'account'),postings=groups(ledger,'account');
  for(const account of new Set([...byAccount.keys(),...postings.keys()])){const balances=byAccount.get(account)??[],lines=postings.get(account)??[],opening=sum(balances,'opening'),debit=sum(balances,'debit'),credit=sum(balances,'credit'),closing=sum(balances,'closing'),rollforward=closing-safe(opening+debit-credit),debitResidual=debit-sum(lines,'debit'),creditResidual=credit-sum(lines,'credit');const result={account,opening,debit,credit,closing,rollforward,debitResidual,creditResidual,expectedClosing:safe(opening+debit-credit),sourceDifference:safe(-rollforward)};outputs.push(result);if(!balances.length||!lines.length||[rollforward,debitResidual,creditResidual].some(n=>Math.abs(n)>tolerance))issues.push({issue:'tb-ledger-residual',...result});}
  const balance=sum(ledger,'debit')-sum(ledger,'credit');outputs.push({ledgerScope:c.ledgerScope,grossDebit:sum(ledger,'debit'),grossCredit:sum(ledger,'credit'),wholeLedgerBalance:c.ledgerScope==='complete'?balance:null});if(c.ledgerScope==='complete'&&Math.abs(balance)>tolerance)issues.push({issue:'unbalanced-complete-ledger',balance});
 }else if(method==='AUTO-006'){
  const tb=matchAmounts(read(primary,['account','closing','entity','currency','period'],m.bench.periods[m.engagement].end),['closing']),statements=matchAmounts(read(secondary,['line','amount','entity','currency','unit','period'],m.bench.periods[m.engagement].end),['amount']);sameCurrency(tb,currency,issues);sameCurrency(statements,currency,issues);unique(statements,'line',issues);
  if(!Array.isArray(c.mapping))fail('Баталсан дансны зураглалыг оруулна уу.',400);const mapping=groups(c.mapping,'account'),totals=new Map();
  for(const [account,rows] of groups(tb,'account')){const links=mapping.get(account);if(links?.length!==1||![1,-1].includes(links[0]?.sign)){issues.push({issue:'unmapped-or-multiple-destination',account});continue;}const link=links[0];totals.set(link.line,safe((totals.get(link.line)??0)+sum(rows,'closing')*link.sign));}
  const tolerance=money(c.tolerance,'Хүлцэл');if(tolerance<0)fail('Хүлцэл сөрөг биш байна.',400);
  for(const line of new Set([...totals.keys(),...statements.map(r=>r.line)])){const row=statements.find(r=>r.line===line),unit=Number(row?.unit);if(![1,1000,1000000].includes(unit)){issues.push({issue:'missing-or-invalid-display-unit',line});continue;}const computed=totals.get(line),residual=computed===undefined?null:safe(computed-safe(row.amount*unit));outputs.push({line,computed,reported:row.amount,unit,residual,currency});if(residual===null||Math.abs(residual)>safe(tolerance*unit))issues.push({issue:'statement-mapping-residual',line,residual});}
 }else if(method==='AUTO-007'){
  const nodes=matchAmounts(primaryRows(['id','amount','unit','period']),['amount']),indexed=unique(nodes,'id',issues);sameCurrency(nodes,currency,issues);for(const n of nodes)if(![1,1000,1000000].includes(Number(n.unit))||!validDate(n.period))fail('Тайлангийн нэгж ба үеийг шалгана уу.',400);
  const value=id=>indexed.get(id)?.length===1?indexed.get(id)[0]:undefined,normal=n=>safe(n.amount*Number(n.unit));const tolerance=money(c.tolerance,'Хүлцэл');if(tolerance<0)fail('Хүлцэл сөрөг биш байна.',400);
  if(!Array.isArray(c.totals)||!Array.isArray(c.references)||!Array.isArray(c.repeated))fail('Тайлангийн нийлбэр, ишлэл ба давтагдсан дүнгийн тодорхой бүтцийг оруулна уу.',400);
  if(!c.totals.length&&!c.references.length&&!c.repeated.length)fail('Тайлангийн бодит хяналтын бүтэц хоосон байна.',400);
  if(c.totals.some(t=>typeof t.id!=='string'||!Array.isArray(t.operands)||!t.operands.length||t.operands.length>200||t.operands.some(o=>!object(o)||typeof o.id!=='string'||![1,-1].includes(o.sign))))fail('Нийлбэрийн бодит оролт ба тэмдгийг шалгана уу.',400);
  if(new Set(c.totals.map(t=>t.id)).size!==c.totals.length)fail('Нэг нийлбэрийн тодорхойлолт давхардсан.',400);
  const formulaIds=new Set(c.totals.map(x=>x.id)),memo=new Map();const cycle=(id,path=new Set())=>{if(path.has(id))return true;if(memo.has(id))return memo.get(id);const result=(c.totals.find(t=>t.id===id)?.operands??[]).some(o=>formulaIds.has(o.id)&&cycle(o.id,new Set([...path,id])));memo.set(id,result);return result;};
  for(const total of c.totals){const node=value(total.id);if(!node||!Array.isArray(total.operands)||!total.operands.length||cycle(total.id)){issues.push({issue:'invalid-total-or-cyclic-reference',id:total.id});continue;}let computed=0,valid=true;for(const operand of total.operands){const n=value(operand.id);if(!n||![1,-1].includes(operand.sign)||n.currency!==node.currency||n.period!==node.period){valid=false;break;}computed=safe(computed+normal(n)*operand.sign);}const residual=valid?safe(normal(node)-computed):null;outputs.push({type:'total',id:total.id,residual,expectedTotal:valid?computed:null,sourceDifference:residual===null?null:safe(-residual)});if(residual===null||Math.abs(residual)>tolerance)issues.push({issue:'cast',id:total.id,residual});}
  for(const reference of c.references)if(!value(reference.from)||!value(reference.to))issues.push({issue:'unresolved-reference',...reference});
  for(const repeat of c.repeated){const from=value(repeat.from),to=value(repeat.to);if(!from||!to||![1,-1].includes(repeat.sign)||from.currency!==to.currency||from.period!==to.period){issues.push({issue:'incomparable-repeat',...repeat});continue;}const residual=safe(normal(from)-normal(to)*repeat.sign);outputs.push({type:'repeat',...repeat,residual});if(Math.abs(residual)>tolerance)issues.push({issue:'repeated-value',...repeat,residual});}
 }else if(method==='AUTO-008'){
  if(!validDate(c.priorPeriod??'')||c.currentPeriod!==m.bench.periods[m.engagement].start||c.priorPeriod>=c.currentPeriod||typeof c.priorBasis!=='string'||!c.priorBasis.trim())fail('Өмнөх аудитлагдсан эхийн өдөр, одоогийн эхний өдөр ба шалгасан үндсийг тодорхой оруулна уу.',400);
  const opening=matchAmounts(read(primary,['account','opening','entity','currency','period'],c.currentPeriod),['opening']),prior=matchAmounts(read(secondary,['account','closing','entity','currency','period'],c.priorPeriod),['closing']);sameCurrency(opening,currency,issues);sameCurrency(prior,currency,issues);unique(opening,'account',issues);unique(prior,'account',issues);
  if(!Array.isArray(c.crosswalk)||!Array.isArray(c.adjustments))fail('Дансны шилжүүлэг ба баталсан нээлтийн залруулгыг тодорхой оруулна уу.',400);
  if(new Set(c.crosswalk.map(r=>r.current)).size!==c.crosswalk.length||new Set(c.crosswalk.map(r=>r.prior)).size!==c.crosswalk.length)issues.push({issue:'ambiguous-opening-crosswalk'});
  for(const row of c.crosswalk)if(!opening.some(r=>r.account===row.current)||!prior.some(r=>r.account===row.prior))issues.push({issue:'unmatched-crosswalk',...row});
  for(const row of c.adjustments)if(!opening.some(r=>r.account===row.account))issues.push({issue:'unmatched-opening-adjustment',account:row.account});
  const used=new Set(),adjustments=new Map();for(const adjustment of c.adjustments){const approval=approvedRows(m,'M06-F05').find(r=>r.id===adjustment.record&&r.values.type==='opening'&&r.values.result==='sufficient');if(!approval)fail('Нээлтийн залруулга бүрийн баталсан аудитын үнэлгээг холбоно уу.');registers.push({id:approval.id,version:approval.version});const ref=dataSource(m,files,approval.values.evidence);inputs.push({...ref,bytes:undefined});adjustments.set(adjustment.account,safe((adjustments.get(adjustment.account)??0)+money(adjustment.amount,'Нээлтийн залруулга')));}
  for(const row of opening){const links=c.crosswalk.filter(x=>x.current===row.account);const old=links.length?links.length===1&&prior.find(x=>x.account===links[0].prior):prior.find(x=>x.account===row.account);if(!old||used.has(old.account)){issues.push({issue:'unmatched-or-ambiguous-opening',account:row.account});continue;}used.add(old.account);const adjustment=adjustments.get(row.account)??0,residual=safe(row.opening-old.closing-adjustment);outputs.push({account:row.account,priorAccount:old.account,opening:row.opening,prior:old.closing,adjustment,residual});if(residual)issues.push({issue:'opening-residual',account:row.account,residual});}
  for(const row of prior)if(!used.has(row.account))issues.push({issue:'unmatched-prior-account',account:row.account});
 }else if(method==='AUTO-010'){
  const current=matchAmounts(primaryRows(['key','amount','unit','period']),['amount']),previous=matchAmounts(read(secondary,['key','amount','entity','currency','unit','period']),['amount']);sameCurrency(current,currency,issues);sameCurrency(previous,currency,issues);unique(current,'key',issues);unique(previous,'key',issues);
  if(!Array.isArray(c.relationships)||!Array.isArray(c.ratios)||!validDate(c.currentPeriod)||!validDate(c.priorPeriod)||c.priorPeriod>=c.currentPeriod)fail('Харьцуулах үе, хөдөлгөөн ба харьцааны баталсан шалгуурыг оруулна уу.',400);
  if(!c.relationships.length&&!c.ratios.length)fail('Бодит шинжилгээний харилцааг сонгоно уу.',400);
  const amount=(rows,key,period)=>{const matches=rows.filter(r=>r.key===key),r=matches.length===1&&matches[0];return r&&r.period===period&&[1,1000,1000000].includes(Number(r.unit))?safe(r.amount*Number(r.unit)):null;};
  for(const relation of c.relationships){const actual=amount(current,relation.key,c.currentPeriod),prior=amount(previous,relation.key,c.priorPeriod),threshold=money(relation.absolute,'Үнэмлэхүй босго'),percentage=numeric(relation.percentage,'Хувийн босго');if(typeof relation.key!=='string'||!relation.key.trim()||threshold<0||percentage<0||!['or','and'].includes(relation.predicate))fail('Хөдөлгөөний эерэг босго ба нөхцөлийг тодорхойлно уу.',400);const delta=actual===null||prior===null?null:safe(actual-prior),pct=prior===null||prior===0||delta===null?null:delta/Math.abs(prior)*100;const flagged=delta===null||pct===null|| (relation.predicate==='or'?Math.abs(delta)>threshold||Math.abs(pct)>percentage:Math.abs(delta)>threshold&&Math.abs(pct)>percentage);outputs.push({id:relation.key,actual,prior,delta,percentage:pct,percentageState:prior===0?'undefined-zero-denominator':pct===null?'unavailable':'calculated',flagged});}
  for(const ratio of c.ratios){const numerator=amount(current,ratio.numerator,c.currentPeriod),denominator=amount(current,ratio.denominator,c.currentPeriod),expected=numeric(ratio.expected,'Харьцааны хүлээгдсэн утга'),tolerance=numeric(ratio.tolerance,'Харьцааны босго');if(typeof ratio.name!=='string'||!ratio.name.trim()||tolerance<0)fail('Харьцааны хүлээгдэж буй дүн ба босгыг шалгана уу.',400);const value=numerator===null||!denominator?null:numerator/denominator;outputs.push({id:'ratio:'+ratio.name,value,expected,flagged:value===null||Math.abs(value-expected)>tolerance});}
  if(new Set(outputs.map(r=>r.id)).size!==outputs.length)fail('Шинжилгээний мөр / харьцааны нэр давхардсан.',400);
  cases=outputs.filter(r=>r.flagged).map(r=>({id:r.id,result:'incomplete'}));
 }else fail('Дэмжсэн аргыг сонгоно уу.',400);
 return {inputs:[...new Map(inputs.map(ref=>[ref.id,ref])).values()],issues,outputs,cases,...(populationBasis&&{populationBasis}),registers};
}

export function dataAction(m,role,action,data,files){
 if(files.archive.isSealed(m)||!m.engagements[0]?.intake.active)fail('Нээлттэй, идэвхтэй гэрээт ажил шаардлагатай.');
 if(action==='evidence-enable'){if(role!=='partner')fail('Партнерын эрх шаардлагатай.',403);m.pilotEvidenceEnabled=true;recordEvent(m,'G03 · '+input(data,'reason'));return;}
 requireSeat(m,files,role);const model=state(m),profile=action.startsWith('data-profile-'),collection=profile?model.profiles:model.checks;
 let item=data.id&&collection.find(r=>r.id===data.id),version=item&&last(item.versions),operation=action.replace(profile?'data-profile-':'data-check-',''),eventDetail;
 if(operation==='save'||operation==='run'){
  if(role==='partner')fail('Бэлтгэгч / ахлахын томилгоо шаардлагатай.',403);
  if(version&&(version.by!==actorKey(role)||version.status==='submitted'))fail('Өөрийн буцаасан / ноорог хувилбарыг сонгоно уу.');
  let content;
  if(profile){const definition=parse(input(data,'definition',10000),'Импортын профайл');validateProfile(definition);if(!object(definition)||!object(definition.mapping)||!['signed','debit-credit'].includes(definition.amount)||!['major','minor'].includes(definition.unit)||!['debit-positive','credit-positive'].includes(definition.sign)||!['iso','dmy'].includes(definition.dateFormat)||Object.entries(definition.mapping).some(([k,v])=>!['id','account','amount','debit','credit','entity','date','currency','journal','entry_type','reference'].includes(k)||typeof v!=='string'||!v.trim()))fail('Профайлын багана, нэгж, тэмдэг ба огнооны тодорхой дүрэм шаардлагатай.',400);content={name:input(data,'name',200),definition};}
  else {const method=input(data,'method',12),configuration=parse(input(data,'configuration',100000),'Аргын параметр');if(version&&version.method!==method)fail('Өөр арга сонгох бол тусдаа тооцоолол үүсгэнэ үү.');if(!object(configuration))fail('Аргын параметр объект байна.',400);content={method,configuration,...calculate(m,files,method,input(data,'primary',64),data.secondary,configuration),use:input(data,'use',500)};}
  const executionDigest=!profile&&automationChecks[content.method]?hash(JSON.stringify(content)):undefined;
  if(executionDigest&&executionDigest===version?.executionDigest)return false;
  if(!item){item={id:randomUUID(),versions:[]};collection.push(item);}version={id:item.id,version:(version?.version??0)+1,status:'draft',by:actorKey(role),at:now(),...content,...(executionDigest&&{executionDigest})};item.versions.push(version);
 }else{
  if(!version||String(version.version)!==data.version)fail('Яг одоогийн хувилбарыг сонгоно уу.');
  if(operation==='explain'){
   if(profile||version.by!==actorKey(role)||!['draft','returned'].includes(version.status))fail('Өөрийн ноорог дүгнэлтийг засна уу.');const target=version.cases.find(c=>c.id===data.case);if(!target)fail('Шинжилгээний тохиолдол олдсонгүй.');eventDetail={case:data.case,previous:structuredClone(target)};const ref=dataSource(m,files,input(data,'evidence',64));if(data.finding&&!m.findings.some(f=>f.id===data.finding&&f.engagement===m.engagement))fail('Link an actual finding in this exact engagement; an indicator is not automatically a misstatement.');Object.assign(target,{result:input(data,'result',16),reason:input(data,'reason'),evidence:{id:ref.id,version:ref.version,sha256:ref.sha256},by:actorKey(role),at:now(),...(data.finding&&{finding:data.finding})});eventDetail.value=structuredClone(target);if(!['resolved','incomplete'].includes(target.result))fail('Дүгнэлтийн төлөв буруу.',400);if(!version.inputs.some(i=>i.id===ref.id))version.inputs.push({...ref,bytes:undefined});
  }else if(operation==='submit'){
   if(version.by!==actorKey(role)||!['draft','returned'].includes(version.status))fail('Өөрийн ноорог / буцаасан хувилбарыг илгээнэ үү.');if(!profile&&(!basisCurrent(m,version)||version.inputs.some(ref=>dataSource(m,files,ref.id).sha256!==ref.sha256)))fail('Эх хувилбар өөрчлөгдсөн. Дахин тооцоолно уу.');version.status='submitted';
  }else if(operation==='approve'||operation==='return'){
   if(role==='preparer'||version.by===actorKey(role))fail('Хараат бус хянагч шаардлагатай.',403);if(version.status!=='submitted')fail('Илгээсэн хувилбарыг сонгоно уу.');const reason=input(data,'reason');
   if(operation==='approve'&&!profile){if(!basisCurrent(m,version))fail('Эх, мөрийн төлөв эсвэл нээлтийн баталсан суурь өөрчлөгдсөн.');for(const ref of version.inputs)if(dataSource(m,files,ref.id).sha256!==ref.sha256)fail('Эхийн агуулга өөрчлөгдсөн.');const disposition=input(data,'disposition',16);if(!['usable','limited'].includes(disposition)||disposition==='usable'&&(version.issues.length||version.cases.some(c=>c.result!=='resolved')))fail('Шийдэгдээгүй зөрүүтэй тооцоолол цэвэр хэрэглээний зөвшөөрөл болохгүй.');version.disposition=disposition;}
   version.status=operation==='approve'?'approved':'returned';version.review={by:actorKey(role),at:now(),reason};
  }else fail('Өгөгдлийн үйлдэл олдсонгүй.',404);
 }
 remember(version,role,operation,eventDetail);recordEvent(m,'G03 · '+action+' · '+item.id+' v'+version.version);
}
export function dataView(m,files){const data=m.pilotData??{profiles:[],checks:[]};return {managed:managedEvidence(m),...(m.engagement&&{context:{entity:entity(m),...m.bench.periods[m.engagement]}}),profiles:data.profiles.map(p=>({...p,current:last(p.versions)})),checks:data.checks.map(p=>({...p,current:{...last(p.versions),current:!!dataCheckCurrent(m,last(p.versions),files),usable:dataCheckCurrent(m,last(p.versions),files)&&last(p.versions).disposition==='usable'}}))};}
