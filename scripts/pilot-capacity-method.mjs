// Runtime port of D02-M35-v1. Owning commands supply scoped, versioned records.
// Research expected fixtures remain separate; no practitioner approval is inferred.
'use strict';
const fail=code=>{throw new Error(code);};
const int=(v,code='INVALID_MINUTES')=>{if(!Number.isSafeInteger(v)||v<0)fail(code);return v;};
const id=v=>{if(typeof v!=='string'||!v.trim())fail('INVALID_ID');return v;};
const day=v=>{if(typeof v!=='string'||!/^\d{4}-\d\d-\d\d$/.test(v)||!Number.isFinite(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)fail('INVALID_DATE');return v;};
const key=x=>id(x.person)+'|'+day(x.date);
function unique(rows){const seen=new Set();for(const x of rows){id(x.id);if(seen.has(x.id))fail('DUPLICATE_ID');seen.add(x.id);}return seen;}
function intervals(rows,limit){if(!Array.isArray(rows))fail('INVALID_INTERVAL');return rows.map(r=>{if(!Array.isArray(r)||r.length!==2)fail('INVALID_INTERVAL');const [a,b]=r;if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<0||b<=a||b>limit)fail('INVALID_INTERVAL');return [a,b];});}
function union(rows){const sorted=rows.map(r=>[...r]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),out=[];for(const r of sorted){const last=out.at(-1);if(last&&r[0]<=last[1])last[1]=Math.max(last[1],r[1]);else out.push(r);}return out;}
function availability(d){
  try{new Intl.DateTimeFormat('en',{timeZone:id(d.timeZone)});}catch{fail('INVALID_TIMEZONE');}
  const limit=d.dayMinutes??1440;int(limit);if(limit<1||limit>1800)fail('INVALID_DAY_LENGTH');
  const absent=union(intervals(d.unavailable??[],limit));
  if(d.schedule===null)return null;
  const scheduled=union(intervals(d.schedule,limit));let available=0;
  for(const [a,b] of scheduled){available+=b-a;for(const [c,e] of absent)available-=Math.max(0,Math.min(b,e)-Math.max(a,c));}
  return available;
}
function capacity(input){
  if(!Array.isArray(input.days)||!Array.isArray(input.baseline)||!Array.isArray(input.scenarios))fail('INVALID_INPUT');
  const keys=new Set();for(const d of input.days){const k=key(d);if(keys.has(k))fail('DUPLICATE_DAY');keys.add(k);}
  const baselineIds=unique(input.baseline);unique(input.scenarios);
  const validateAllocation=a=>{key(a);id(a.engagement);int(a.minutes);if(!keys.has(key(a)))fail('MISSING_DAY');};
  input.baseline.forEach(validateAllocation);
  for(const s of input.scenarios){if(!Array.isArray(s.removeIds)||!Array.isArray(s.add))fail('INVALID_SCENARIO');if(new Set(s.removeIds).size!==s.removeIds.length)fail('DUPLICATE_REMOVAL');for(const x of s.removeIds)if(!baselineIds.has(x))fail('UNKNOWN_REMOVAL');unique(s.add);s.add.forEach(validateAllocation);const retained=new Set(input.baseline.filter(a=>!s.removeIds.includes(a.id)).map(a=>a.id));for(const a of s.add)if(retained.has(a.id))fail('DUPLICATE_ID');}
  const s=input.selectedScenario===null?null:input.scenarios.find(s=>s.id===input.selectedScenario);if(input.selectedScenario!==null&&!s)fail('UNKNOWN_SCENARIO');
  const live=s?[...input.baseline.filter(a=>!s.removeIds.includes(a.id)),...s.add]:input.baseline;
  const rows=input.days.map(d=>{
    const availableMinutes=availability(d),plannedMinutes=live.filter(a=>key(a)===key(d)).reduce((n,a)=>n+a.minutes,0);
    const unknown=availableMinutes===null,headroomMinutes=unknown?null:availableMinutes-plannedMinutes;
    return {person:d.person,date:d.date,availableMinutes,plannedMinutes,headroomMinutes,overbookedMinutes:unknown?null:Math.max(0,-headroomMinutes),loadPercent:availableMinutes>0?100*plannedMinutes/availableMinutes:null,flag:unknown?'unknown-capacity':availableMinutes===0&&plannedMinutes>0?'zero-capacity':plannedMinutes>availableMinutes?'overbooked':'within-capacity'};
  }).sort((a,b)=>key(a).localeCompare(key(b)));
  const totals=[...new Set(rows.map(r=>r.person))].sort().map(person=>{const r=rows.filter(r=>r.person===person),known=r.every(x=>x.availableMinutes!==null),a=known?r.reduce((n,x)=>n+x.availableMinutes,0):null,p=r.reduce((n,x)=>n+x.plannedMinutes,0);return {person,availableMinutes:a,plannedMinutes:p,headroomMinutes:known?a-p:null,overbookedMinutes:known?r.reduce((n,x)=>n+x.overbookedMinutes,0):null,loadPercent:a>0?100*p/a:null};});
  return {rows,totals};
}
function effort(input){
  id(input.scope);if(input.scope!==input.planScope)fail('SCOPE_MISMATCH');day(input.actualThrough);day(input.planThrough);if(input.actualThrough!==input.planThrough)fail('CUTOFF_MISMATCH');
  for(const k of ['plannedToDate','originalBudget','revisedBudget'])int(input[k]);if(input.remainingEstimate!==null)int(input.remainingEstimate);
  if(!['complete','partial','unsubmitted'].includes(input.coverage)||!Array.isArray(input.entries))fail('INVALID_COVERAGE');
  const ids=unique(input.entries),superseded=new Set();for(const e of input.entries){int(e.minutes);if(e.supersedes){if(!ids.has(e.supersedes)||e.supersedes===e.id)fail('INVALID_SUPERSESSION');if(superseded.has(e.supersedes))fail('BRANCHED_SUPERSESSION');superseded.add(e.supersedes);}}
  // Detect correction cycles rather than returning an invented zero total.
  for(const e of input.entries){let x=e,seen=new Set();while(x.supersedes){if(seen.has(x.id))fail('CYCLIC_SUPERSESSION');seen.add(x.id);x=input.entries.find(r=>r.id===x.supersedes);}}
  if(input.coverage==='unsubmitted'&&input.entries.length)fail('INVALID_COVERAGE');
  const recordedMinutes=input.entries.filter(e=>!superseded.has(e.id)).reduce((n,e)=>n+e.minutes,0),known=input.coverage!=='unsubmitted';
  const varianceMinutes=known?recordedMinutes-input.plannedToDate:null,forecastMinutes=known&&input.remainingEstimate!==null?recordedMinutes+input.remainingEstimate:null;
  return {recordedMinutes,actualMinutes:input.coverage==='complete'?recordedMinutes:null,provisional:input.coverage!=='complete',varianceMinutes,variancePercent:known&&input.plannedToDate>0?100*varianceMinutes/input.plannedToDate:null,budgetDeltaMinutes:input.revisedBudget-input.originalBudget,budgetDeltaPercent:input.originalBudget>0?100*(input.revisedBudget-input.originalBudget)/input.originalBudget:null,forecastMinutes,forecastVarianceMinutes:forecastMinutes===null?null:forecastMinutes-input.revisedBudget};
}
function timestamps(input){
  if(!Array.isArray(input.entries))fail('INVALID_INPUT');unique(input.entries);
  const replaced=new Set();for(const e of input.entries)if(e.supersedes){const old=input.entries.find(x=>x.id===e.supersedes);if(!old||old.person!==e.person||old.engagement!==e.engagement||replaced.has(old.id))fail('INVALID_SUPERSESSION');replaced.add(old.id);}
  for(const e of input.entries){let x=e,seen=new Set();while(x.supersedes){if(seen.has(x.id))fail('CYCLIC_SUPERSESSION');seen.add(x.id);x=input.entries.find(r=>r.id===x.supersedes);}}
  const timestamp=v=>{if(typeof v!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?(?:Z|[+-]\d\d:\d\d)$/.test(v)||!Number.isFinite(Date.parse(v)))fail('INVALID_TIMESTAMP');day(v.slice(0,10));return Date.parse(v);};
  const cutoff=timestamp(input.cutoff),live=input.entries.filter(e=>!replaced.has(e.id));let minutes=0;
  for(let i=0;i<live.length;i++){const e=live[i];id(e.person);id(e.engagement);const a=timestamp(e.from),b=timestamp(e.through),m=(b-a)/60000;if(!Number.isSafeInteger(m)||m<=0||b>cutoff)fail('INVALID_TIME_ENTRY');minutes+=m;for(let j=0;j<i;j++){const other=live[j];if(e.person===other.person&&a<Date.parse(other.through)&&Date.parse(other.from)<b)fail('OVERLAPPING_ACTUALS');}}
  return {currentEntries:live.length,totalMinutes:minutes};
}
function calculate(input){if(input.kind==='capacity')return capacity(input);if(input.kind==='effort')return effort(input);if(input.kind==='timestamps')return timestamps(input);fail('INVALID_KIND');}
export {calculate as calculateM35};
