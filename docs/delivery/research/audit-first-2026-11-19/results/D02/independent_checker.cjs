// Separate numerical formulation: enumerate minute sets instead of interval-union arithmetic.
// Does not import reference_calculator or derive expected values from it.
'use strict';
function capacity(i){
  let allocations=structuredClone(i.baseline);
  if(i.selectedScenario!==null){const s=i.scenarios.find(s=>s.id===i.selectedScenario);allocations=allocations.filter(a=>!s.removeIds.includes(a.id)).concat(s.add);}
  const rows=i.days.map(d=>{
    let a=null;
    if(d.schedule!==null){const available=new Set();for(const [first,last] of d.schedule)for(let m=first;m<last;m++)available.add(m);for(const [first,last] of d.unavailable)for(let m=first;m<last;m++)available.delete(m);a=available.size;}
    let p=0;for(const x of allocations)if(x.person===d.person&&x.date===d.date)p+=x.minutes;
    return {person:d.person,date:d.date,availableMinutes:a,plannedMinutes:p,headroomMinutes:a===null?null:a-p,overbookedMinutes:a===null?null:p>a?p-a:0,loadPercent:a===null||a===0?null:p/a*100,flag:a===null?'unknown-capacity':a===0&&p>0?'zero-capacity':p>a?'overbooked':'within-capacity'};
  }).sort((a,b)=>(a.person+'|'+a.date).localeCompare(b.person+'|'+b.date));
  const totals=[...new Set(rows.map(r=>r.person))].sort().map(person=>{const days=rows.filter(r=>r.person===person);let a=0,p=0,o=0;for(const d of days){p+=d.plannedMinutes;if(a!==null){if(d.availableMinutes===null){a=null;o=null;}else{a+=d.availableMinutes;o+=d.overbookedMinutes;}}}return {person,availableMinutes:a,plannedMinutes:p,headroomMinutes:a===null?null:a-p,overbookedMinutes:o,loadPercent:a===null||a===0?null:p/a*100};});
  return {rows,totals};
}
function effort(i){
  const current=new Map(i.entries.map(e=>[e.id,e.minutes]));for(const e of i.entries)if(e.supersedes)current.delete(e.supersedes);
  let recordedMinutes=0;for(const minutes of current.values())recordedMinutes+=minutes;
  const known=i.coverage!=='unsubmitted',v=known?recordedMinutes-i.plannedToDate:null,b=i.revisedBudget-i.originalBudget,forecast=known&&i.remainingEstimate!==null?recordedMinutes+i.remainingEstimate:null;
  return {recordedMinutes,actualMinutes:i.coverage==='complete'?recordedMinutes:null,provisional:i.coverage!=='complete',varianceMinutes:v,variancePercent:known&&i.plannedToDate!==0?v/i.plannedToDate*100:null,budgetDeltaMinutes:b,budgetDeltaPercent:i.originalBudget!==0?b/i.originalBudget*100:null,forecastMinutes:forecast,forecastVarianceMinutes:forecast===null?null:forecast-i.revisedBudget};
}
function timestamps(i){const ends=new Set(i.entries.filter(e=>e.supersedes).map(e=>e.supersedes));let currentEntries=0,totalMinutes=0;for(const e of i.entries)if(!ends.has(e.id)){currentEntries++;totalMinutes+=(new Date(e.through).getTime()-new Date(e.from).getTime())/60000;}return {currentEntries,totalMinutes};}
module.exports={check:i=>i.kind==='capacity'?capacity(i):i.kind==='effort'?effort(i):timestamps(i)};
