import {createHash} from 'node:crypto';
import {areaCards,areaJudgments} from '../src/lib/pilot-area-cards.ts';
import {canEdit,canReadWork,inScope,recordEvent,snapshot,workKey} from '../src/lib/workspace.ts';
import {approvedPopulation,cents} from './pilot-population.mjs';
import {programmeDecision} from './pilot-registers.mjs';
import {effectiveForm} from './pilot-forms.mjs';
import {evidenceCurrent} from './pilot-requests.mjs';
import {areaView} from './pilot-area.mjs';
import {actorKey} from './pilot-identity-context.mjs';
import {input,PilotError} from './pilot-workflow.mjs';
const hash=x=>createHash('sha256').update(typeof x==='string'||x instanceof Uint8Array?x:JSON.stringify(x)).digest('hex');
const now=()=>new Date().toISOString(),last=(m,form)=>m.pilotAreaCards?.[form]?.at(-1);
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const parse=(data,key)=>{try{return JSON.parse(input(data,key,200000));}catch(e){if(e instanceof PilotError)throw e;fail('Invalid structured area work: '+key,400);}};
function source(m,files,id){
 const e=m.evidence.find(e=>e.id===id&&e.engagement===m.engagement&&evidenceCurrent(m,e)),raw=e&&files.read(id),period=m.bench.periods[m.engagement],entity=m.bench.clients[m.engagement].registration.replace(/\s/g,'').toLowerCase();
 if(!e||!raw||hash(raw.bytes)!==raw.sha256)fail('A current independently accepted original with matching bytes is required.');
 if(e.scope&&(e.scope.entity.replace(/\s/g,'').toLowerCase()!==entity||e.scope.start>period.start||e.scope.end<period.end))fail('The selected original does not cover this entity and reporting period.');
 return {id:e.id,version:e.version,sha256:raw.sha256};
}
function basis(m,form){
 const p=m.work[workKey(m.engagement,form)],decision=programmeDecision(m,form),population=approvedPopulation(m),execution=m.pilotExecution?.[form]?.at(-1);
 return hash({period:m.bench.periods[m.engagement],entity:m.bench.clients[m.engagement].registration,template:m.pilotForms?.[form],decision:decision&&[decision.id,decision.version,decision.programmeBasis],owner:p.owner,reviewer:p.reviewer,population:population&&[population.version,population.sha256],execution:execution&&[execution.version,execution.stamp,execution.conclusion]});
}
function isCurrent(m,p,files){
 try{return p.basis===basis(m,p.definition.form)&&p.sources.every(s=>JSON.stringify(s)===JSON.stringify(files?source(m,files,s.id):m.evidence.some(e=>e.id===s.id&&e.version===s.version&&evidenceCurrent(m,e))?s:null))&&(p.mode!=='calculated'||p.runStamp===areaView(m)[p.definition.form]?.stamp&&areaView(m)[p.definition.form]?.current);}catch{return false;}
}
export function areaCardGap(m,form,files){const p=last(m,form);if(p&&(!isCurrent(m,p,files)||p.status!=='reviewed'||p.review?.result==='additional-work'))return form+' · G10 actual source work, matters and independent current-version review are required.';}
export function areaCardReleaseGaps(m){const all=m.findings.filter(f=>f.g10Origin),e=m.engagements[0],evaluation=m.pilotEvaluations?.at(-1);if(!all.length)return [];const current=!!evaluation?.approval&&evaluation.inputs?.statement===e.fsVersion&&evaluation.inputs?.materiality===m.work[workKey(m.engagement,'1.3')]?.version&&all.every(f=>evaluation.inputs.rows?.some(r=>r.id===f.id&&r.g10Version===f.g10Origin.versions.at(-1)?.digest&&r.quantification===f.g10Origin.quantification));return current?[]:['G10 · G05 final assessment of the exact current measured and unquantified matters requires independent approval.'];}
export function areaCardView(m,files){return Object.fromEntries(Object.entries(m.pilotAreaCards??{}).filter(([f])=>canReadWork(m,m.work[workKey(m.engagement,f)])).map(([f,entries])=>{const p=entries.at(-1);return [f,{...p,current:isCurrent(m,p,files),history:entries.slice(0,-1).reverse()}];}));}
export function areaCardEvidence(m){return Object.values(m.pilotAreaCards??{}).flatMap(entries=>entries.flatMap(p=>p.sources.map(s=>s.id)));}
function invalidate(m,form){const w=m.work[workKey(m.engagement,form)];if(['reviewed','submitted'].includes(w.status)){snapshot(w,m.person,'G10 · Preserve prior actual area work and review');w.version++;w.status='changed';delete w.submittedVersion;delete w.completedAt;}if(w.status==='not_started')w.status='in_progress';recordEvent(m,form+' · G10 actual area work changed',form);}
export function syncAreaCards(m,files){for(const f of Object.keys(m.pilotAreaCards??{}))if(areaCardGap(m,f,files)&&['reviewed','submitted'].includes(m.work[workKey(m.engagement,f)].status))invalidate(m,f);}
function findings(m,p){
 for(const matter of p.matters){const stable='G10-'+hash([m.engagement,p.definition.form,matter.key]).slice(0,32),id=matter.existingFinding||stable,existing=m.findings.find(f=>f.id===id),amount=matter.kind==='monetary'?Math.abs(cents(matter.difference))/100:0;
  if(matter.existingFinding&&(!existing||existing.engagement!==m.engagement||existing.form!==p.definition.form||existing.amount!==amount))fail('The explicitly linked finding must belong to this exact area and engagement.');
  if(existing&&(existing.status!=='identified'||existing.resolution)&&(!existing.g10Origin||existing.amount!==amount||existing.evidence!==matter.evidence))fail('Preserve the existing G05 decision. Its changed effect needs an explicit G05 amendment before this handoff.');
  if(!existing)m.findings.push({id,engagement:m.engagement,form:p.definition.form,title:matter.title,amount,status:'identified',evidence:matter.evidence,qualitative:(matter.kind==='monetary'?'Signed difference '+matter.difference:'Unquantified '+matter.kind)+' · '+matter.reason,g10Origin:{key:matter.key,kind:matter.kind,quantification:matter.kind==='monetary'?'measured':'unknown',signedDifference:matter.difference,owner:matter.owner,versions:[]}});
  const f=m.findings.find(f=>f.id===id);if(f.g10Origin){f.g10Origin.versions.push({packet:p.version,digest:p.contentDigest,by:p.by,at:now(),matter:structuredClone(matter)});if(f.status==='identified'&&!f.resolution){Object.assign(f,{amount,evidence:matter.evidence,title:matter.title,qualitative:(matter.kind==='monetary'?'Signed difference '+matter.difference:'Unquantified '+matter.kind)+' · '+matter.reason});Object.assign(f.g10Origin,{kind:matter.kind,quantification:matter.kind==='monetary'?'measured':'unknown',signedDifference:matter.difference,owner:matter.owner});}}
 }
}
export function areaCardAction(m,role,action,data,files,forms){
 const form=input(data,'form',32),runtimeDefinition=areaCards.find(d=>d.form===form),w=m.work[workKey(m.engagement,form)];
 if(!runtimeDefinition||!w||!forms.includes(form)||!canReadWork(m,w)||files.archive.isSealed(m))fail('The exact adopted readable fieldwork area is required.',403);
 const p=last(m,form),definition=p?.definition??runtimeDefinition,owner=canEdit(m,w)&&w.status!=='submitted',actor=actorKey(role);
 if(action==='area-card-save'){
  if(!owner)fail('The assigned actual preparer must record the work.',403);
  if(String(p?.version??0)!==data.version)fail('Compare the exact current area-work version before saving.');
  if(p?.status==='submitted')fail('Submitted area work must be returned before editing.');
  const effective=effectiveForm(m,form,files);if(!effective||m.extendedPilot&&programmeDecision(m,form)?.values.decision!=='adopt')fail('An approved adopted source programme and pinned template are required.');
  const procedures=parse(data,'procedures'),inputs=parse(data,'inputs'),judgments=parse(data,'judgments'),matters=parse(data,'matters'),mode=input(data,'mode',20),method=input(data,'method',200),edition=input(data,'edition',200),methodEvidence=input(data,'methodEvidence',80),methodWork=input(data,'methodWork',12000);
  const available=new Set(effective.body.fields.filter(f=>f.type==='procedure').map(f=>f.key));
  if(!['manual','calculated'].includes(mode)||!Array.isArray(procedures)||!procedures.length||new Set(procedures).size!==procedures.length||procedures.some(k=>!available.has(k)))fail('Select actual source procedure keys and an explicit manual/calculated method.');
  if(!Array.isArray(inputs)||inputs.some(i=>!i||typeof i!=='object'||Array.isArray(i))||inputs.length!==definition.inputs.length||new Set(inputs.map(i=>i.key)).size!==inputs.length||definition.inputs.some(i=>!inputs.some(v=>v.key===i.key)))fail('Retain every actual input requirement and its source/work locator.');
  for(const i of inputs){if(!i||typeof i!=='object')fail('Invalid input row.');input(i,'evidence',80);input(i,'locator',2000);input(i,'work',12000);}
  if(!Array.isArray(judgments)||judgments.some(j=>!j||typeof j!=='object'||Array.isArray(j))||judgments.length!==areaJudgments(definition).length||new Set(judgments.map(j=>j.key)).size!==judgments.length||areaJudgments(definition).some(q=>!judgments.some(j=>j.key===q.key)))fail('Record the area-specific preparer work, reviewer challenge, method boundary and contradictory evidence.');
  for(const j of judgments){if(!j||typeof j!=='object')fail('Invalid judgment row.');if(!['supported','exception','unavailable','not-applicable'].includes(j.result))fail('Unknown judgments are not successful work.');input(j,'work',12000);input(j,'reason',12000);input(j,'evidence',80);}
  if(!Array.isArray(matters)||matters.some(c=>!c||typeof c!=='object'||Array.isArray(c))||matters.length>100||new Set(matters.map(c=>c.key)).size!==matters.length)fail('Use stable distinct matter keys.');
  for(const c of matters){if(!c||typeof c!=='object'||!inScope(m,c.owner,m.engagement))fail('A current actual engagement owner is required for each matter.');for(const key of ['key','title','evidence','reason','owner'])input(c,key,key==='reason'?12000:200);if(!['monetary','qualitative','limitation'].includes(c.kind)||c.kind==='monetary'&&cents(c.difference)===null||c.kind!=='monetary'&&c.difference!=='unknown')fail('Keep measured signed differences separate from unquantified matters.');}
  if(judgments.some(j=>j.result==='exception')&&!matters.length||judgments.some(j=>j.result==='unavailable')&&!matters.some(c=>c.kind==='limitation'))fail('Actual exceptions and missing-evidence limitations need explicit G05 matters and next owners.');
  const run=mode==='calculated'?areaView(m)[form]:undefined;if(mode==='calculated'&&(!run?.current||!run.approval||run.params.edition&&run.params.edition!==edition))fail('The exact calculation, edition and its case dispositions must be independently reviewed first.');
  const population=approvedPopulation(m),sources=[...new Set([methodEvidence,...inputs.map(i=>i.evidence),...judgments.map(j=>j.evidence),...matters.map(c=>c.evidence),...(run?Object.values(run.files).map(f=>f.id):[]),...(population?[population.evidence,population.controls?.evidence?.id].filter(Boolean):[])])].map(id=>source(m,files,id));
  const content={mode,method,edition,methodEvidence,methodWork,procedures,inputs,judgments,matters,sources,basis:basis(m,form),...(run&&{runStamp:run.stamp})},contentDigest=hash(content);if(contentDigest===p?.contentDigest)return false;
  const next={...content,version:(p?.version??0)+1,status:'draft',by:actor,at:now(),definition:structuredClone(p?.definition??definition),contentDigest};
  (((m.pilotAreaCards??={})[form])??=[]).push(next);invalidate(m,form);w.values['g10.card']=JSON.stringify(next);w.evidence=[...new Set([...w.evidence,...sources.map(s=>s.id)])];return true;
 }
 if(!p||String(p.version)!==data.version||!isCurrent(m,p,files))fail('Use the exact current source, method, assignment and work version.');
 if(action==='area-card-submit'){
  if(!owner||!['draft','returned'].includes(p.status))fail('The actual assigned preparer submits its current draft.',403);findings(m,p);p.status='submitted';p.submission={by:actor,at:now(),digest:p.contentDigest};
 }else if(action==='area-card-return'||action==='area-card-review'){
  if(w.reviewer!==m.person||w.owner===m.person||p.by===actor||p.status!=='submitted')fail('A different actual assigned reviewer must assess this exact submission.',403);
  const reason=input(data,'reason',12000);if(action==='area-card-return'){p.status='returned';p.returned={by:actor,at:now(),reason};}
  else{const result=input(data,'result',40);if(!['usable','usable-with-matters','additional-work'].includes(result)||result==='usable'&&p.matters.length)fail('The conclusion must retain actual matters and additional work.');p.status='reviewed';p.review={by:actor,at:now(),result,reason,digest:p.contentDigest};}
 }else fail('Unknown area-work action.',400);
 invalidate(m,form);w.values['g10.card']=JSON.stringify(p);return true;
}
