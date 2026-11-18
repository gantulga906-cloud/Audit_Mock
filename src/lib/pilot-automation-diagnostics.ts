import type {View} from '../components/pilot-workspace';
export type AutomationDiagnostic={id:string;metrics:Record<string,number|boolean|string>;blockers:string[];boundary:string};
export function nativeAutomationDiagnostics(view:View):AutomationDiagnostic[]{
 const records=view.completion?.finalisation?.records??[],legal=records.filter(r=>r.kind==='legal'),going=records.filter(r=>r.kind==='going');
 const supported=(r:typeof records[number])=>r.current&&r.review?.disposition==='supported';
 const legalOpen=legal.filter(r=>!supported(r)||!r.evidence||!r.values.accounting?.trim()||!r.values.disclosure?.trim());
 const legalUnknown=legal.filter(r=>!/^\d+(?:\.\d{1,2})?$/.test(r.values.exposure??''));
 const goingOpen=going.filter(r=>!supported(r)||!r.evidence||['assessment','conditions','plans','contrary','basis','uncertainty','disclosure','limitation'].some(k=>!r.values[k]?.trim()));
 let missing=0,na=0;const disclosureBlockers:string[]=[];
 for(const row of records.filter(r=>r.kind==='disclosures')){
  let items:{id:string;applicability:string;anchor?:string;evidence?:string;reason?:string}[];
  try{const parsed:unknown=JSON.parse(row.values.requirements??'');if(!Array.isArray(parsed)||parsed.some(r=>!r||typeof r!=='object'))throw Error();items=parsed;}catch{disclosureBlockers.push(row.id+' · malformed requirements');continue;}
  for(const item of items){if(item.applicability==='na'){if(item.reason?.trim())na++;else disclosureBlockers.push(item.id+' · unsupported N/A');}else if(item.applicability==='gap'||item.applicability==='applicable'&&(!item.anchor?.trim()||!item.evidence)){missing++;disclosureBlockers.push(item.id+' · missing exact applicable note/support');}else if(item.applicability!=='applicable')disclosureBlockers.push(item.id+' · unresolved applicability');}
  if(!supported(row))disclosureBlockers.push(row.id+' · exact independent current-version review required');
 }
 const plans=Object.values(view.execution?.plans??{}),unperformed=plans.flatMap(p=>p.items.filter(i=>i.disposition==='perform'&&!p.results.some(r=>r.procedure===i.key)).map(i=>p.form+'/'+i.key));
 const areaBlockers=plans.filter(p=>!p.conclusionCurrent||p.conclusion?.disposition!=='usable').map(p=>p.form+' · '+(p.conclusion?.disposition??'missing conclusion'));
 const riskRows=view.registers.filter(r=>r.kind==='M06-F09'&&r.status==='approved'),responses=(view.planning?.programmes??[]).flatMap(p=>p.responses),orphan=riskRows.filter(r=>r.values.type!=='overall'&&!responses.some(link=>link.risk===r.id&&link.riskVersion===r.version));
 const overall=riskRows.filter(r=>r.values.type==='overall'&&!view.registers.some(x=>x.kind==='M06-F11'&&x.status==='approved'&&!x.stale&&x.values.risk===r.id));
 const notes=(view.papers??[]).flatMap(p=>p.notes.filter(n=>!n.cleared).map(n=>p.form+'/'+n.id)),missingSignoffs=(view.papers??[]).filter(p=>p.status!=='reviewed').map(p=>p.form);
 return [
  {id:'AUTO-049',metrics:{open:legalOpen.length,readyForReview:legal.length-legalOpen.length,unknownExposure:legalUnknown.length,records:legal.length},blockers:legalOpen.map(r=>r.id),boundary:'Known and unknown exposure remain separate; support and auditor accounting/disclosure judgments are not inferred from register presence.'},
  {id:'AUTO-050',metrics:{unresolved:goingOpen.length,ready:going.length>0&&!goingOpen.length,records:going.length},blockers:goingOpen.map(r=>r.id),boundary:'A passed forecast calculation cannot supply missing management evidence, mitigation challenge, auditor conclusion, disclosure or report decisions.'},
  {id:'AUTO-052',metrics:{missingApplicable:missing,justifiedNa:na,ready:records.some(r=>r.kind==='disclosures')&&!disclosureBlockers.length},blockers:disclosureBlockers,boundary:'Exact selected checklist, note/source and current review are tracked; full semantic framework compliance is a separate professional assessment.'},
  {id:'AUTO-053',metrics:{unperformedBlockers:unperformed.length,areas:plans.length,ready:plans.length>0&&!unperformed.length&&!areaBlockers.length},blockers:[...unperformed,...areaBlockers],boundary:'Actual performed results, evidence and exact independent area conclusions remain in the owning execution records.'},
  {id:'AUTO-054',metrics:{orphanSpecificRisks:orphan.length,orphanOverallArrangements:overall.length},blockers:[...orphan,...overall].map(r=>r.id),boundary:'Specific executable responses and overall resource arrangements have different contracts. Existing targeted impact controls remain authoritative.'},
  {id:'AUTO-055',metrics:{unclearedNotes:notes.length,unreviewedVisiblePapers:missingSignoffs.length},blockers:[...notes,...missingSignoffs],boundary:'Counts cover the visible work population. A reply or closed manual task does not clear a review note; this is not an engagement release decision.'},
 ];
}
