import {actorKey} from './pilot-identity-context.mjs';
import {createHash,randomUUID} from 'node:crypto';
import {canEdit,changeWork,recordEvent,snapshot,workKey} from '../src/lib/workspace.ts';
import {executionFields,executionKinds} from '../src/lib/pilot-execution.ts';
import {validDate} from '../src/lib/feature-workflows.ts';
import {effectiveForm} from './pilot-forms.mjs';
import {approvedRows,programmeDecision,formContract} from './pilot-registers.mjs';
import {evidenceCurrent} from './pilot-requests.mjs';
import {approvedPopulation,cents} from './pilot-population.mjs';
import {accounts, accountFor,input,PilotError} from './pilot-workflow.mjs';
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const now=()=>new Date().toISOString(),today=()=>now().slice(0,10);
const plans=(m,form)=>m.pilotExecution?.[form]??[],latest=(m,form)=>plans(m,form).at(-1);
const required=(object,keys)=>{for(const key of keys)if(typeof object[key]!=='string'||!object[key].trim())fail('G04 · Дутуу бодит утга · '+key);};
const live=(m,ref)=>!!ref&&m.evidence.some(e=>e.id===ref.id&&e.version===ref.version&&evidenceCurrent(m,e));
const source=(m,files,id)=>{const e=m.evidence.find(e=>e.id===id&&evidenceCurrent(m,e)),original=e&&files.get(id);if(!original)fail('Бодитоор шалгасан одоогийн эх шаардлагатай.');return {id:e.id,version:e.version,sha256:original.sha256};};
const sourceProcedures=(m,form,files)=>effectiveForm(m,form,files)?.body.fields.filter(f=>f.type==='procedure'&&!f.when).map(f=>({key:f.key,label:f.label}))??[];
function basis(m,form,files){
 const paper=m.work[workKey(m.engagement,form)],decision=programmeDecision(m,form),template=m.pilotForms?.[form];
 if(!paper||paper.stage!==3||!template||m.extendedPilot&&formContract(form)?.family==='programme'&&decision?.values.decision!=='adopt')return;
 return {form,template:template.digest,decision:decision&&[decision.id,decision.version],owner:paper.owner,reviewer:paper.reviewer,period:m.bench.periods[m.engagement]};
}
const current=(m,plan,files)=>!!plan&&!!basis(m,plan.form,files)&&hash(basis(m,plan.form,files))===plan.stamp;
const resultBasis=(m,plan,files)=>hash([plan.stamp,plan.version,plan.items,plan.results.map(r=>[r.id,r.version,r.result,r.values,r.evidence,live(m,r.evidence),r.extraEvidence,r.extraEvidence?.every(e=>live(m,e)),r.conclusion]),plan.results.filter(r=>r.kind==='subsequent').length?m.engagements[0].reportDate:null,plan.results.some(r=>['estimate','going','component'].includes(r.kind))?m.engagements[0].fsVersion:null]);
const conclusionCurrent=(m,plan,files)=>!!plan.conclusion&&current(m,plan,files)&&plan.conclusion.stamp===resultBasis(m,plan,files);
export function executionView(m,files){return {enabled:!!m.pilotFieldworkEnabled,plans:Object.fromEntries(Object.entries(m.pilotExecution??{}).map(([form,entries])=>{const plan=entries.at(-1);return [form,{...plan,current:current(m,plan,files),conclusionCurrent:conclusionCurrent(m,plan,files),history:entries.slice(0,-1).reverse()}];})),procedures:Object.fromEntries(Object.values(m.work).filter(p=>p.engagement===m.engagement&&p.stage===3).map(p=>[p.form,sourceProcedures(m,p.form,files)]))};}
export function executionGap(m,form,files){const plan=latest(m,form);if(!plan&&m.pilotFieldworkEnabled&&programmeDecision(m,form)?.values.decision==='adopt')return form+' · Баталсан хөтөлбөрийн бодит гүйцэтгэлийг бүртгэнэ үү.';if(plan&&(!current(m,plan,files)||plan.status!=='approved'||!conclusionCurrent(m,plan,files)||plan.conclusion.disposition==='additional'))return form+' · Горимын бодит гүйцэтгэл, хязгаарлалт ба хараат бус дүгнэлтийг хянана уу.';}
export function syncExecution(m,files){for(const form of Object.keys(m.pilotExecution??{})){const paper=m.work[workKey(m.engagement,form)];if(!paper||!['submitted','reviewed'].includes(paper.status)||!executionGap(m,form,files))continue;snapshot(paper,m.person,'Гүйцэтгэлийн өмнөх дүгнэлтийг хадгалав');paper.version++;paper.status='changed';delete paper.submittedVersion;delete paper.completedAt;recordEvent(m,form+' · Гүйцэтгэлийн эх ба дүгнэлт өөрчлөгдөв',form);}}
export const executionEvidence=m=>Object.values(m.pilotExecution??{}).flatMap(entries=>entries.flatMap(p=>p.results.flatMap(r=>[r.evidence?.id,...(r.extraEvidence??[]).map(e=>e.id),...(r.history??[]).flatMap(h=>[h.evidence?.id,...(h.extraEvidence??[]).map(e=>e.id)])]))).filter(Boolean);
// A real failed operating instance invalidates reliance; it never changes design/implementation into a pass.
export const executionControlFailed=(m,id)=>Object.values(m.pilotExecution??{}).some(entries=>entries.at(-1).results.some(r=>r.kind==='control'&&r.values.control===id&&r.result!=='supported'));
export const executionPosition=m=>hash([Object.entries(m.pilotExecution??{}).map(([form,entries])=>[form,entries.at(-1).version,entries.at(-1).conclusion]),Object.entries(m.pilotSamples??{}).map(([form,entries])=>[form,entries.at(-1).version,entries.at(-1).resultReview])]);
function validateResult(m,plan,item,data,values){
 required(values,executionFields[item.kind].map(([key])=>key).filter(key=>key!=='corroboration'));
 const amount=key=>{const n=cents(values[key]);if(n===null)fail('G04 · Дүнгийн формат буруу · '+key);return n;};
 if(['detail'].includes(item.kind)){
  if(!/^[A-Z]{3}$/.test(values.currency))fail('Нэг валютын код шаардлагатай.');
  const difference=amount('recorded')-amount('audited');if(data.result==='supported'&&difference!==0)fail('Бодит зөрүүтэй сорилыг зөрчилгүй болгож болохгүй.');values.signedDifference=String(difference/100);
  if(data.sampleVersion){const design=m.pilotSamples?.[plan.form]?.at(-1),unit=design?.selected?.find(u=>u.id===values.unit);if(!unit||String(design.version)!==data.sampleVersion||unit.cents!==amount('recorded'))fail('Яг сонгосон эх нэгж ба бүртгэлийн дүн шаардлагатай.');}
 }
 if(item.kind==='control'){
  const control=m.pilotRecords.find(r=>r.id===values.control&&r.kind==='M06-F03');if(!control||!validDate(values.date)||values.date>today())fail('Бодит хяналт ба гүйцэтгэсэн өдөр шаардлагатай.');
  values.controlVersion=String(control.version);
 }
 if(item.kind==='analytical'){
  const delta=Math.abs(amount('actual')-cents(item.expectation));values.expected=item.expectation;values.difference=String(delta/100);
  if(delta>cents(item.threshold)&&(!values.investigation.trim()||!values.corroboration||values.corroboration===data.evidence||!m.evidence.some(e=>e.id===values.corroboration&&evidenceCurrent(m,e))))fail('Босго давсан зөрүүний тусдаа бодит батлах эх ба ажил шаардлагатай.');
 }
 if(item.kind==='inventory'&&(!validDate(values.date)||values.date>today()))fail('Бодит тооллогын өдөр шаардлагатай.');
 if(item.kind==='subsequent'&&(!validDate(values.through)||values.through<m.bench.periods[m.engagement].end||values.through>today()))fail('Бодитоор шалгасан хамрах эцсийн өдөр шаардлагатай.');
 if(item.kind==='component'&&!approvedRows(m,'M06-F05').some(r=>r.id===values.contributor&&r.values.type==='component'&&r.values.result==='sufficient'))fail('Бодит группийн хүрээ ба одоогийн бүрэлдэхүүний ажлын үнэлгээ шаардлагатай.');
}
export function executionAction(m,role,action,data,files){
 if(action==='fieldwork-enable'){if(role!=='partner')fail('Партнерын одоогийн ажлын хүрээний шийдвэр шаардлагатай.',403);m.pilotFieldworkEnabled={by:actorKey(role),at:now(),reason:input(data,'reason')};recordEvent(m,'G04 · Горимын бодит гүйцэтгэлийн хяналт идэвхжүүлэв');return true;}
 const form=input(data,'form',32),paper=m.work[workKey(m.engagement,form)],base=basis(m,form,files),plan=latest(m,form);
 if(!base)fail('Одоогийн хэрэгжүүлсэн хөтөлбөр / гүйцэтгэлийн ажил шаардлагатай.');
 const owner=canEdit(m,paper)&&paper.status!=='submitted',reviewer=role!=='preparer'&&paper.reviewer===accountFor(m,role)&&paper.owner!==accountFor(m,role);
 if(action==='fieldwork-plan-save'){
  if(!owner)fail('Томилсон бэлтгэгч шаардлагатай.',403);
  const reason=input(data,'reason'),procedures=sourceProcedures(m,form,files);let items;try{items=JSON.parse(data.items);}catch{fail('Горимын мөрүүдийн формат буруу.',400);}
  if(!Array.isArray(items)||!items.length||items.length>200)fail('1–200 бодит горим оруулна уу.');
  const seen=new Set();items=items.map(item=>{
   if(!item||typeof item!=='object'||Array.isArray(item)||Object.values(item).some(v=>typeof v!=='string'||v.length>8000))fail('Горимын утгууд буруу.');
   required(item,['key','label','kind','disposition','reason']);if(seen.has(item.key)||!Object.hasOwn(executionKinds,item.kind)||!['perform','na'].includes(item.disposition))fail('Горим давхардсан эсвэл арга буруу.');seen.add(item.key);
   if(!procedures.some(p=>p.key===item.key)&&!/^ADD-[A-Za-z0-9_-]{1,60}$/.test(item.key))fail('Эхийн бодит горим эсвэл ADD- нэмэлт түлхүүр шаардлагатай.');
   if(item.kind==='analytical'&&item.disposition==='perform'){required(item,['expectation','precision','threshold','reliability','suitability','expectationBasis']);if(cents(item.expectation)===null||cents(item.precision)===null||cents(item.threshold)===null||cents(item.precision)<0||cents(item.threshold)<0)fail('Бодит хүлээлт, нарийвчлал ба босго шаардлагатай.');}
   return {...item};
  });
  if(procedures.some(p=>!seen.has(p.key)))fail('Эхийн горим бүрийг хэрэглэх эсвэл үндэслэлтэй хамаарахгүй гэж ил тод тэмдэглэнэ үү.');
  const responseKeys=new Set(programmeDecision(m,form)?.programmeBasis?.responses?.map(r=>r.procedure)??[]);if([...responseKeys].some(key=>!items.some(i=>i.key===key&&i.disposition==='perform')))fail('Баталсан эрсдэлийн хариу горимыг төлөвлөлтийн шинэ шийдвэргүйгээр хасахгүй.');
  const version=(plan?.version??0)+1;((m.pilotExecution??={})[form]??=[]).push({form,version,stamp:hash(base),basis:base,status:'draft',reason,items,results:[],by:actorKey(role),at:now(),events:[{action,by:actorKey(role),at:now()}]});
 }else{
  if(!plan||String(plan.version)!==data.version||!current(m,plan,files))fail('Одоогийн гүйцэтгэлийн яг хувилбарыг сонгоно уу.');
  if(action==='fieldwork-plan-submit'){
   if(!owner||plan.by!==actorKey(role)||!['draft','returned'].includes(plan.status))fail('Бэлтгэсэн хувилбар шаардлагатай.',403);plan.status='submitted';
  }else if(action==='fieldwork-plan-approve'||action==='fieldwork-plan-return'){
   if(!reviewer||plan.by===actorKey(role)||plan.status!=='submitted')fail('Хараат бус томилсон хянагч шаардлагатай.',403);plan.review={by:actorKey(role),at:now(),reason:input(data,'reason')};plan.status=action.endsWith('approve')?'approved':'returned';
  }else if(action==='fieldwork-perform'){
   if(!owner||plan.status!=='approved')fail('Баталсан горимын томилсон бэлтгэгч шаардлагатай.',403);
   const item=plan.items.find(i=>i.key===data.procedure&&i.disposition==='perform');if(!item)fail('Хэрэглэхээр баталсан бодит горим шаардлагатай.');
   if(!['supported','exception','unavailable','limited'].includes(data.result))fail('Гүйцэтгэлийн бодит үр дүн шаардлагатай.');
   let values;try{values=JSON.parse(data.values);}catch{fail('Бодит сорилын өгөгдөл буруу.',400);}
   if(!values||typeof values!=='object'||Array.isArray(values)||Object.keys(values).length>30||Object.values(values).some(v=>typeof v!=='string'||v.length>8000))fail('Сорилын утгууд буруу.');
   if(data.result!=='unavailable')validateResult(m,plan,item,data,values);
   if(['estimate','going','component'].includes(item.kind))values.statementVersion=String(m.engagements[0].fsVersion);
   const evidence=data.evidence?source(m,files,data.evidence):undefined;if(data.result!=='unavailable'&&!evidence)fail('Бодит эх нотолгоо шаардлагатай.');
   const previous=plan.results.find(r=>r.id===data.id);if(data.id&&!previous)fail('Өмнөх сорилыг зөв сонгоно уу.');if(previous&&previous.procedure!==item.key)fail('Өмнөх горимын холбоосыг солихгүй.');
   const row={id:previous?.id??randomUUID(),version:(previous?.version??0)+1,procedure:item.key,kind:item.kind,result:data.result,detail:input(data,'detail'),conclusion:input(data,'conclusion'),values,evidence,extraEvidence:values.corroboration?[source(m,files,values.corroboration)]:[],by:actorKey(role),at:now(),...(data.result!=='supported'&&{nextOwner:input(data,'nextOwner',20),followup:input(data,'followup')})};
   if(row.extraEvidence.some(ref=>ref.sha256===evidence?.sha256))fail('Ижил эхийн хуулбарыг тусдаа батлах нотолгоо гэж тооцохгүй.');
   if(row.nextOwner&&!['preparer','reviewer','partner'].includes(row.nextOwner))fail('Дараагийн бодит хариуцагч шаардлагатай.');
   const difference=cents(values.signedDifference??'0');
   if(row.kind==='detail'&&row.result==='exception'&&difference){
    const findingId='MANUAL-'+hash([m.engagement,form,item.key,values.unit]).slice(0,32);const finding=m.findings.find(f=>f.id===findingId);
    if(finding&&(finding.resolution||finding.status!=='identified'))fail('Өмнөх илрүүлэлтийн шийдвэрийг хадгална.');
    const duplicate=data.findingId?m.findings.find(f=>f.id===data.findingId&&f.form===form):data.sampleVersion?m.findings.find(f=>f.id.startsWith('SAMPLE-')&&f.form===form&&f.sampleId===values.unit&&f.sampleBasis?.source===approvedPopulation(m)?.evidence):undefined;
    if(data.findingId&&!duplicate||duplicate&&Math.round(duplicate.amount*100)!==Math.abs(difference))fail('Яг ижил асуудал ба дүнгийн эх илрүүлэлтийг холбоно уу.');
    if(duplicate)row.finding=duplicate.id;else{row.finding=findingId;const next={id:findingId,engagement:m.engagement,form,title:values.unit+' · '+row.detail,amount:Math.abs(difference)/100,signedDifference:difference/100,status:'identified',evidence:evidence.id,qualitative:values.cause};if(finding)Object.assign(finding,next);else m.findings.push(next);}
   }else if(previous?.finding)fail('Сорилын үр дүнг өөрчилж өмнөх илрүүлэлтийг арилгахгүй.');
   if(previous){row.history=[...(previous.history??[]),{...previous,history:undefined}];Object.assign(previous,row);}else plan.results.push(row);
   delete plan.conclusion;changeWork(m,paper.id,{...paper.values,['pilot.execution.'+plan.version+'.'+row.id]:JSON.stringify(row)},[...new Set([...paper.evidence,...(evidence?[evidence.id]:[])])]);
  }else if(action==='fieldwork-review'){
   if(!reviewer||plan.status!=='approved')fail('Хараат бус томилсон хянагч шаардлагатай.',403);
   if(plan.items.some(i=>i.disposition==='perform'&&!plan.results.some(r=>r.procedure===i.key)))fail('Хэрэглэх горим бүрийн бодит ажил / гүйцэтгээгүй нөхцөлийг бүртгэнэ үү.');
   if(!['usable','limited','additional'].includes(data.disposition))fail('Бодит дүгнэлтийн төлөв шаардлагатай.');
   if(data.disposition==='usable'&&plan.results.some(r=>r.result!=='supported'||!live(m,r.evidence)||r.extraEvidence?.some(e=>!live(m,e))))fail('Дутуу, зөрүүтэй эсвэл хуучирсан ажлыг цэвэр болгож батлахгүй.');
   if(data.disposition==='usable'&&plan.results.some(r=>r.kind==='subsequent'&&r.values.through<m.engagements[0].reportDate))fail('Тайлангийн өдөр хүртэл бодитоор хийсэн шинэ ажил шаардлагатай.');
   if(data.disposition==='usable'&&plan.results.some(r=>['estimate','going','component'].includes(r.kind)&&r.values.statementVersion!==String(m.engagements[0].fsVersion)))fail('Яг санхүүгийн мэдээллийн шинэ хувилбараар бодит үнэлгээг шинэчилнэ үү.');
   const review={stamp:resultBasis(m,plan,files),disposition:data.disposition,reason:input(data,'reason'),by:actorKey(role),at:now(),...(data.disposition!=='usable'&&{nextOwner:input(data,'nextOwner',20),followup:input(data,'followup')})};if(review.nextOwner&&!['preparer','reviewer','partner'].includes(review.nextOwner))fail('Дараагийн хариуцагч шаардлагатай.');
   plan.conclusion=review;(plan.conclusionHistory??=[]).push(review);
  }else fail('Гүйцэтгэлийн үйлдэл олдсонгүй.',404);
  plan.events.push({action,by:actorKey(role),at:now(),reason:data.reason??'',status:plan.status,review:structuredClone(plan.review)});
 }
 recordEvent(m,form+' · '+action,form);return true;
}
