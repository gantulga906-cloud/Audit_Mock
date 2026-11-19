import {randomUUID} from 'node:crypto';
import {actorKey,currentIdentity} from './pilot-identity-context.mjs';
import {PilotError,input} from './pilot-workflow.mjs';
import {approvedRows} from './pilot-registers.mjs';
import {seatFor} from './pilot-staffing.mjs';
import {calculateM35} from './pilot-capacity-method.mjs';
import {contractDigest} from './pilot-method-contracts.mjs';
import {validDate} from '../src/lib/feature-workflows.ts';
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const state=m=>m.pilotCapacity??={schemaVersion:1,revision:0,days:[],allocations:[],scenarios:[],budgets:[],variances:[],history:[]};
const parse=(raw,label)=>{try{return JSON.parse(raw);}catch{fail('Invalid '+label,400);}};
const integer=(value,label,max=1800)=>{if(typeof value!=='string'||!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value))||Number(value)>max)fail('An explicit nonnegative integer '+label+' is required.',400);return Number(value);};
const models=(m,files)=>files.staffingModels(m).filter(x=>x.engagements[0]);
const calendarKey=r=>r.person+'/'+r.date;
const localDate=(instant,zone)=>{const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(instant)).map(p=>[p.type,p.value]));return parts.year+'-'+parts.month+'-'+parts.day;};
const midnight=(instant,zone)=>{const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(instant)).map(p=>[p.type,p.value]));return parts.hour==='00'&&parts.minute==='00'&&parts.second==='00'&&instant%1000===0;};
function calculate(s,scenario=null){try{return calculateM35({kind:'capacity',days:s.days,baseline:s.allocations,scenarios:scenario?[scenario]:[],selectedScenario:scenario?.id??null});}catch(error){fail('Capacity contract: '+error.message,400);}}
function scopeAllocation(m,row,files,visible){
 if(!row||typeof row.id!=='string'||!row.id||!validDate(row.date)||!Number.isInteger(row.minutes)||row.minutes<0||row.minutes>1800||!visible.has(row.engagement))fail('Select an authorized engagement, real date and 0-1800 integer minutes.');
 const model=models(m,files).find(x=>x.engagement===row.engagement);
 const seat=model&&['preparer','reviewer','partner'].map(role=>seatFor(model,role,row.date,row.date,row.person)).find(Boolean);
 if(!seat)fail('The exact person needs a current approved appointment for this allocation date.');
 if(row.work&&!Object.values(model.work).some(w=>w.form===row.work))fail('The selected work item is outside this engagement.');
 return {appointment:seat.id,version:seat.version,engagement:row.engagement,person:row.person,date:row.date};
}
function future(s,row){const day=s.days.find(d=>calendarKey(d)===calendarKey(row));if(!day)fail('Record this exact person/date calendar first, including unknown availability if necessary.');if(row.date<localDate(Date.now(),day.timeZone))fail('Past planned allocations remain historical; change future scope only.');}
function acceptable(result){if(result.rows.some(r=>r.plannedMinutes>0&&r.flag!=='within-capacity'))fail('Resolve each unknown, zero-capacity or overbooked day before committing this plan.');}
export function capacityAction(m,role,action,data,files,visible){
 if(role==='preparer')fail('An appointed staffing manager or partner is required.',403);
 const s=state(m),by=actorKey(role),reason=input(data,'reason'),at=new Date().toISOString();
 if(s.days.length>10000||s.allocations.length>20000||s.scenarios.length>1000)fail('The supported planning profile is full. Archive a separate planning period before adding more records.');
 if(action==='capacity-calendar'){
  const person=input(data,'person',80),date=input(data,'date',10);if(!validDate(date)||!approvedRows(m,'M01-F03').some(p=>p.id===person&&p.values.status==='active'))fail('Choose a current staff person and real date.');
  const day={person,date,timeZone:input(data,'timeZone',80),schedule:parse(input(data,'schedule',10000),'schedule'),unavailable:parse(input(data,'unavailable',10000),'unavailable intervals'),dayMinutes:integer(data.dayMinutes??'1440','actual day length'),authority:input(data,'authority'),by,at};
  if(day.schedule!==null&&(!Array.isArray(day.schedule)||day.schedule.length>50)||!Array.isArray(day.unavailable)||day.unavailable.length>50)fail('Use at most 50 scheduled/unavailable intervals.',400);
  calculate({days:[day],allocations:[]});
  const old=s.days.find(r=>calendarKey(r)===calendarKey(day));
  if(old)s.history.push({operation:'calendar-replaced',value:structuredClone(old),by,at,reason});
  s.days=[...s.days.filter(r=>calendarKey(r)!==calendarKey(day)),day];s.revision++;
 }else if(action==='capacity-allocation'){
  const row={id:randomUUID(),person:input(data,'person',80),engagement:input(data,'engagement',80),date:input(data,'date',10),minutes:integer(data.minutes,'planned minutes'),...(data.work&&{work:input(data,'work',32)}),by,at};
  future(s,row);row.assignmentBasis=scopeAllocation(m,row,files,visible);
  const candidate={...s,allocations:[...s.allocations,row]};acceptable(calculate(candidate));s.allocations.push(row);s.revision++;
 }else if(action==='capacity-scenario-save'){
  const removeIds=parse(input(data,'removeIds',20000),'replaced allocation IDs'),add=parse(input(data,'add',100000),'scenario additions');
  if(!Array.isArray(removeIds)||removeIds.length>100||!Array.isArray(add)||add.length>100)fail('Select at most 100 allocation changes.',400);
  for(const id of removeIds){const row=s.allocations.find(a=>a.id===id);if(!row||!visible.has(row.engagement))fail('A replaced allocation is unavailable.');future(s,row);}
  for(const row of add){const basis=scopeAllocation(m,row,files,visible);future(s,row);row.assignmentBasis=basis;}
  const scenario={id:randomUUID(),name:input(data,'name',200),baseRevision:s.revision,removeIds,add,status:'draft',by,at,reason};
  scenario.workTransfers=files.previewWorkTransfers(role,data.transfers?parse(data.transfers,'selected work transfers'):[],reason);
  scenario.preview=calculate(s,scenario);scenario.digest=contractDigest(scenario);s.scenarios.push(scenario);
 }else if(action==='capacity-scenario-commit'){
  const scenario=s.scenarios.find(x=>x.id===data.id);
  if(!scenario||scenario.status!=='draft'||scenario.baseRevision!==s.revision||data.digest!==scenario.digest)fail('The scenario or calendar/baseline changed. Create and inspect a current alternative.');
  const {digest,...frozen}=scenario;if(contractDigest(frozen)!==digest)fail('The frozen scenario definition changed. Prepare a new alternative.');
  for(const id of scenario.removeIds){const row=s.allocations.find(a=>a.id===id);if(!row||!visible.has(row.engagement))fail('An allocation is no longer authorized.');future(s,row);}
  for(const row of scenario.add){future(s,row);if(contractDigest(scopeAllocation(m,row,files,visible))!==contractDigest(row.assignmentBasis))fail('A staffing appointment changed after preview.');}
  const result=calculate(s,scenario);acceptable(result);
  files.applyWorkTransfers(role,scenario.workTransfers??[],reason);
  s.history.push({operation:'scenario-commit',baselineRevision:s.revision,allocations:structuredClone(s.allocations),scenario:scenario.id,by,at,reason});
  s.allocations=[...s.allocations.filter(a=>!scenario.removeIds.includes(a.id)),...structuredClone(scenario.add)];s.revision++;
  Object.assign(scenario,{status:'committed',committedBy:by,committedAt:at,committedRevision:s.revision});
 }else if(action==='capacity-budget'){
  const engagement=input(data,'engagement',80),person=input(data,'person',80),from=input(data,'from',10),through=input(data,'through',10);
  if(!visible.has(engagement)||!validDate(from)||!validDate(through)||from>through)fail('Select one authorized person/engagement/date budget scope.');
  scopeAllocation(m,{id:'budget',engagement,person,date:from,minutes:0},files,visible);scopeAllocation(m,{id:'budget',engagement,person,date:through,minutes:0},files,visible);
  const matching=s.budgets.filter(b=>b.engagement===engagement&&b.person===person&&b.from===from&&b.through===through);
  s.budgets.push({id:randomUUID(),engagement,person,from,through,version:matching.length+1,minutes:integer(data.minutes,'budget minutes',10000000),authority:input(data,'authority'),by,at,reason});
 }else if(action==='capacity-variance'){
  const budget=s.budgets.find(b=>b.id===data.budget);if(!budget||!visible.has(budget.engagement))fail('Select an authorized budget scope.');
  const model=models(m,files).find(x=>x.engagement===budget.engagement),from=input(data,'from',40),cutoff=input(data,'cutoff',40),zone=input(data,'timeZone',80);
  const stamp=/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?(?:Z|[+-]\d\d:\d\d)$/;
  if(!stamp.test(from)||!stamp.test(cutoff)||!validDate(from.slice(0,10))||!validDate(cutoff.slice(0,10))||!Number.isFinite(Date.parse(from))||!Number.isFinite(Date.parse(cutoff))||Date.parse(from)>=Date.parse(cutoff)||Date.parse(cutoff)>Date.now())fail('Select a real explicit actual-to-date interval, never future time.');
  const first=localDate(Date.parse(from),zone),last=localDate(Date.parse(cutoff)-1,zone);if(first!==budget.from||last>budget.through)fail('Actual and planned comparison dates must use the selected budget scope.');
  if(!midnight(Date.parse(from),zone)||!midnight(Date.parse(cutoff),zone))fail('Daily allocations support complete local-day comparisons; choose local midnight boundaries.');
  for(let day=Date.parse(first+'T00:00:00Z');day<=Date.parse(last+'T00:00:00Z');day+=86400000){const date=new Date(day).toISOString().slice(0,10);if(!s.allocations.some(a=>a.engagement===budget.engagement&&a.person===budget.person&&a.date===date))fail('Daily planned coverage is missing. An explicitly recorded zero allocation is distinct from no plan.');}
  const all=model.pilotEffort??[],replaced=new Set(all.map(e=>e.supersedes)),entries=all.filter(e=>e.person===budget.person&&!replaced.has(e.id)&&Date.parse(e.from)<Date.parse(cutoff)&&Date.parse(e.through)>Date.parse(from));
  if(entries.some(e=>Date.parse(e.from)<Date.parse(from)||Date.parse(e.through)>Date.parse(cutoff)))fail('An actual entry crosses this comparison boundary; choose aligned boundaries or split/correct the actual entry.');
  const original=s.budgets.find(b=>b.engagement===budget.engagement&&b.person===budget.person&&b.from===budget.from&&b.through===budget.through),latest=s.budgets.filter(b=>b.engagement===budget.engagement&&b.person===budget.person&&b.from===budget.from&&b.through===budget.through).at(-1);
  if(latest.id!==budget.id)fail('Select the current approved recorded budget version.');
  const inputValue={kind:'effort',scope:budget.engagement+'/'+budget.person,planScope:budget.engagement+'/'+budget.person,actualThrough:last,planThrough:last,plannedToDate:s.allocations.filter(a=>a.engagement===budget.engagement&&a.person===budget.person&&a.date>=first&&a.date<=last).reduce((n,a)=>n+a.minutes,0),originalBudget:original.minutes,revisedBudget:budget.minutes,coverage:input(data,'coverage',20),remainingEstimate:data.remainingEstimate===''?null:integer(data.remainingEstimate,'remaining-estimate minutes',10000000),entries:entries.map(e=>({id:e.id,minutes:e.minutes}))};
  let output;try{output=calculateM35(inputValue);}catch(error){fail('Effort comparison: '+error.message,400);}
  s.variances.push({id:randomUUID(),engagement:budget.engagement,person:budget.person,budget:budget.id,from,cutoff,timeZone:zone,input:inputValue,entryIds:entries.map(e=>e.id),output,by,at,reason});
 }else fail('Unknown capacity operation.',404);
 s.history.push({operation:action,revision:s.revision,by,at,reason});
}
export function capacityView(m,role,visible){
 if(role==='preparer')return undefined;
 const s=state(m),result=calculate(s);
 const allowedScenario=x=>(x.workTransfers??[]).every(t=>visible.has(t.engagement))&&x.add.every(a=>visible.has(a.engagement))&&x.removeIds.every(id=>s.allocations.some(a=>a.id===id&&visible.has(a.engagement))||s.history.some(h=>h.allocations?.some(a=>a.id===id&&visible.has(a.engagement))));
 return {schemaVersion:1,method:'D02-M35-v1',revision:s.revision,days:s.days,allocations:s.allocations.filter(a=>visible.has(a.engagement)),rows:result.rows,totals:result.totals,
  hiddenCommitments:s.days.map(d=>({person:d.person,date:d.date,minutes:s.allocations.filter(a=>a.person===d.person&&a.date===d.date&&!visible.has(a.engagement)).reduce((n,a)=>n+a.minutes,0)})).filter(x=>x.minutes),
  scenarios:s.scenarios.filter(allowedScenario).map(x=>({...x,stale:x.status==='draft'&&x.baseRevision!==s.revision})),budgets:s.budgets.filter(b=>visible.has(b.engagement)),variances:s.variances.filter(v=>visible.has(v.engagement)),
  boundary:'Minutes and completeness are planning facts; ratios are not audit-quality scores. Hidden engagements are aggregated without client identity. No payroll or fees.'};
}
