import {actorKey} from './pilot-identity-context.mjs';
import {createHash,randomUUID} from 'node:crypto';
import {isCurrentReview,workKey,recordEvent,canEdit} from '../src/lib/workspace.ts';
import {finalisationKinds,finalisationFields,finalisationChoices} from '../src/lib/pilot-finalisation.ts';
import {evidenceCurrent} from './pilot-requests.mjs';
import {approvedRows} from './pilot-registers.mjs';
import {currentManagement,currentEvaluation} from './pilot-completion.mjs';
import {qualityRef} from './pilot-oversight.mjs';
import {approvedPopulation,cents} from './pilot-population.mjs';
import {validDate} from '../src/lib/feature-workflows.ts';
import {PilotError,input} from './pilot-workflow.mjs';
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const hash=value=>createHash('sha256').update(JSON.stringify(value??null)).digest('hex');
const now=()=>new Date().toISOString(),today=()=>now().slice(0,10);
export const managedCompletion=m=>m.pilotFinalisation?.profile===1;
const records=m=>Object.values(m.pilotFinalisation?.records??{}).map(v=>v.at(-1));
const service=row=>['mandate','recommendation','followup'].includes(row.kind);
const versions=(m,id)=>m.pilotFinalisation?.records?.[id];
const restricted=row=>row.kind==='matter'&&['fraud','noncompliance'].includes(row.values.nature);
const fileLive=(m,ref)=>!!ref&&m.evidence.some(e=>e.id===ref.id&&e.version===ref.version&&evidenceCurrent(m,e));
const required=(v,keys)=>{for(const key of keys)if(typeof v[key]!=='string'||!v[key].trim())fail('G05 · Дутуу бодит утга · '+key);};
function attachment(m,files,id){const e=m.evidence.find(e=>e.id===id&&evidenceCurrent(m,e)),original=e&&files.get(id);if(!original)fail('G05 · Одоогийн хүлээн зөвшөөрсөн бодит эх шаардлагатай.');return {id:e.id,version:e.version,name:e.name,sha256:original.sha256};}
function parse(raw,label){let value;try{value=JSON.parse(raw);}catch{fail(label+' · Өгөгдлийн формат буруу.',400);}return value;}
function requirements(row){const values=parse(row.values.requirements??'[]','Тодруулгын мөрүүд');if(!Array.isArray(values)||values.length>200)fail('200 хүртэл сонгосон шаардлага оруулна уу.');return values;}
function registerRef(m,row){const definition=finalisationFields[row.kind]?.find(([, ,type])=>/^M\d/.test(type??''));return definition&&approvedRows(m,definition[2]).find(r=>r.id===row.values[definition[0]]);}
function dependencyIds(row){return ['mandate','recommendation'].flatMap(key=>row.values[key]?[row.values[key]]:[]);}
function basis(m,row){
 const v=row.values,paper=v.paper&&m.work[workKey(m.engagement,v.paper)],e=m.engagements[0],register=registerRef(m,row);
 const fs=['statements','disclosures','representations','communication','otherInformation','legal','going','events'].includes(row.kind);
 return {kind:row.kind,...(paper&&{paper:[paper.form,paper.version,paper.reviewedVersion,paper.status,paper.evidence.map(id=>{const e=m.evidence.find(e=>e.id===id);return [id,e?.version,evidenceCurrent(m,e)];})]}),...(fs&&{statement:e.fsVersion}),...(['representations','communication','otherInformation','events'].includes(row.kind)&&{reportDate:e.reportDate}),...(row.kind==='statements'&&{management:currentManagement(m)?.stamp??null}),...(register&&{register:[register.id,register.version,register.status]}),dependencies:dependencyIds(row).map(id=>{const target=versions(m,id)?.at(-1);return [id,target?.version??null,target?.status??null,target?.review??null];}),evidence:row.evidence&&[row.evidence.id,row.evidence.version,fileLive(m,row.evidence)],extra:row.attachments.map(ref=>[ref.id,ref.version,fileLive(m,ref)])};
}
function current(m,row,seen=new Set()){
 if(!row||row.status!=='approved'||seen.has(row.id)||row.stamp!==hash(basis(m,row)))return false;
 const path=new Set([...seen,row.id]);return dependencyIds(row).every(id=>current(m,versions(m,id)?.at(-1),path));
}
export const finalisationStamp=m=>hash(records(m).filter(r=>!service(r)).map(r=>[r.id,r.version,r.status,r.review,current(m,r)]));
export const finalisationEvidence=m=>Object.values(m.pilotFinalisation?.records??{}).flatMap(v=>v.filter(r=>!service(r)).flatMap(r=>[r.evidence?.id,...r.attachments.map(e=>e.id)])).filter(Boolean);
export const completionAffectsAudit=(m,action,data)=>!action.startsWith('completion-case-')||!['mandate','recommendation','followup'].includes(data.kind??versions(m,data.id)?.at(-1)?.kind);
function validate(m,row){
 const v=row.values,kind=row.kind,period=m.bench.periods[m.engagement],e=m.engagements[0],paper=v.paper&&m.work[workKey(m.engagement,v.paper)];
 const optional={matter:['finding','exposure','currency','period','resolutionEvidence'],otherInformation:['document','readOn','followupDate'],followup:['newDue']};
 required(v,finalisationFields[kind].map(([key])=>key).filter(key=>!optional[kind]?.includes(key)));
 for(const [key,,type] of finalisationFields[kind])if(finalisationChoices[type]&&v[key]&&!finalisationChoices[type].some(([value])=>value===v[key]))fail('G05 · Дэмжигдээгүй сонголт · '+key);
 if(v.paper&&(!paper||paper.stage!==3||!isCurrentReview(paper)))fail('G05 · Бодит хянасан гүйцэтгэлийн яг хувилбар шаардлагатай.');
 if(['legal','going'].includes(kind)&&!row.evidence)fail('G11 · Legal and going-concern work requires its actual accepted source; numerical indicators cannot replace this evidence.');
 const ref=registerRef(m,row);if(['representations','communication'].includes(kind)&&!ref)fail('G05 · Яг одоогийн баталсан эх бүртгэл шаардлагатай.');
 if(kind==='matter'){
  if(!row.evidence)fail('Бодит нөхцөл ба эх нотолгоо шаардлагатай.');
  if(v.outcome==='resolved'&&!row.attachments.some(e=>e.id===v.resolutionEvidence&&fileLive(m,e)))fail('Шийдсэн гэсэн төлөвт бодит ажлын эх шаардлагатай.');
  if(v.nature==='financial'){
   const amount=cents(v.exposure??'');if(amount===null||amount<0||!v.currency||!/^[A-Z]{3}$/.test(v.currency)||v.period!==period.start+'/'+period.end)fail('Мөнгөн үр дагаврын бодит дүн, нэг валют, яг үе шаардлагатай.');
   if(v.classification==='qualitative'&&amount!==0)fail('Чанарын асуудлын өртөлт тэг байна.');
   if(v.classification==='projected'&&!v.finding?.startsWith('PROJECTION-'))fail('Баталсан бодит төсөөллийн эхийг холбоно уу; ангилал нь тооцоолол биш.');
  }
 }
 if(kind==='statements'&&!currentManagement(m))fail('Яг СТ, тодруулга, удирдлагын бодит зөвшөөрлийг тусдаа батална уу.');
 if(kind==='disclosures'){
  const rows=requirements(row),seen=new Set();if(!rows.length)fail('Бодитоор сонгосон тодруулгын шаардлагууд хэрэгтэй.');
  for(const r of rows){if(!r||typeof r!=='object'||Object.values(r).some(v=>typeof v!=='string'||v.length>4000))fail('Тодруулгын мөр буруу.');required(r,['id','applicability','reason']);if(seen.has(r.id)||!['applicable','na','gap'].includes(r.applicability))fail('Тодруулгын шаардлага давхардсан / төлөв буруу.');seen.add(r.id);if(r.applicability==='applicable'){required(r,['anchor','evidence']);if(!row.attachments.some(ref=>ref.id===r.evidence&&fileLive(m,ref)))fail('Хэрэглэх шаардлагад яг тодруулгын байршил ба бодит эх шаардлагатай.');}}
 }
 if(kind==='representations'){
  if(ref.statementVersion!==e.fsVersion)fail('Мэдэгдэл нь яг СТ хувилбарыг хамарна.');
  if(ref.values.result==='received'&&(!ref.values.evidence||ref.values.periodStart!==period.start||ref.values.periodEnd!==period.end||ref.values.signed>e.reportDate))fail('Бодит гарын үсэгтэй агуулга, үе, эрх ба огноог шалгана уу.');
 }
 if(kind==='communication'&&ref.values.deliveryStatus==='delivered'&&(!ref.values.delivery||!ref.values.deliveredAt))fail('Хүргэлтийн бодит эх ба өдөр шаардлагатай.');
 if(kind==='otherInformation'){
  if(v.applicability==='unresolved')fail('Хэрэглэх байдлыг бодитоор шийдвэрлэнэ үү.');
  if(v.applicability==='after'){required(v,['followupDate']);if(!validDate(v.followupDate)||v.followupDate<e.reportDate||v.outcome!=='later'||!row.evidence)fail('Дараа авах бодит тохиролцоо, өдөр, эзэн ба үлдсэн ажил шаардлагатай.');}
  if(v.applicability==='before'||v.document){if(!v.document||!validDate(v.readOn)||v.readOn>today()||!row.attachments.some(r=>r.id===v.document&&fileLive(m,r)))fail('Яг авсан эх ба бодитоор уншсан өдөр шаардлагатай.');}
 }
 if(kind==='events'&&(!validDate(v.through)||v.through<period.end||v.through>today()))fail('Үйл явдлын бодитоор хийсэн хамрах өдөр шаардлагатай.');
 if(kind==='mandate'&&(!row.attachments.length||!validDate(v.from)||!validDate(v.through)||v.from>v.through||!row.evidence))fail('Тусдаа үйлчилгээний бодит тохиролцоо, эрх ба огноо шаардлагатай.');
 if(kind==='recommendation'){
  const mandate=versions(m,v.mandate)?.at(-1);if(mandate?.kind!=='mandate'||!current(m,mandate)||mandate.values.from>today()||mandate.values.through<today()||!validDate(v.due))fail('Үйлчилж буй тохирсон эрх ба хугацаа шаардлагатай.');
 }
 if(kind==='followup'){
  const action=versions(m,v.recommendation)?.at(-1);if(action?.kind!=='recommendation'||!current(m,action))fail('Бодит тохирсон арга хэмжээг холбоно уу.');
  const mandate=versions(m,action.values.mandate)?.at(-1);if(!mandate||!current(m,mandate)||mandate.values.from>today()||mandate.values.through<today())fail('Одоогийн хүчинтэй бодит үйлчилгээний зөвшөөрөл шаардлагатай.');
  if(v.decision==='verified'&&!row.evidence)fail('Удирдлагын явц нь бодит шалгалтын нотолгоо биш.');
  if(v.decision==='extend'&&(!validDate(v.newDue)||v.newDue<=action.values.due))fail('Шинэ тохирсон хугацаа ба үндэс шаардлагатай.');
 }
}
function supported(m,row){
 const v=row.values,ref=registerRef(m,row);
 if(row.kind==='matter'&&(v.outcome==='open'||v.nature!=='financial'&&v.outcome!=='resolved'))return false;
 if(row.kind==='disclosures'&&requirements(row).some(r=>r.applicability==='gap'))return false;
 if(row.kind==='representations'&&ref?.values.result!=='received')return false;
 if(row.kind==='communication'&&ref?.values.deliveryStatus!=='delivered')return false;
 if(row.kind==='otherInformation'&&!((v.applicability==='none')||(v.applicability==='after'&&v.outcome==='later')||(v.document&&v.outcome==='clear')))return false;
 if(row.kind==='events'&&v.through<m.engagements[0].reportDate)return false;
 if(row.kind==='followup'&&v.decision!=='verified')return false;
 return true;
}
function confirmMatter(m,row){
 if(row.values.nature!=='financial')return;
 const v=row.values,amount=cents(v.exposure),fact=id=>m.pilotFindingFacts?.[id]?.at(-1);
 const duplicate=m.findings.find(f=>f.form===v.paper&&(f.sampleId===v.unit||fact(f.id)?.reference===v.unit));
 const existing=(v.finding||row.finding)?m.findings.find(f=>f.id===(v.finding||row.finding)&&f.form===v.paper):undefined;
 if(v.finding&&!existing||duplicate&&!existing)fail('Яг ижил эх асуудлын илрүүлэлтийг холбоно уу; өртөлтийг давхар нэмэхгүй.');
 if(existing&&Math.round(Math.abs(existing.amount)*100)!==amount)fail('Холбосон илрүүлэлтийн бодит дүн өөр байна.');
 const id=existing?.id??row.finding??'MANUAL-'+randomUUID(),prior=fact(id);
 const finding=m.findings.find(f=>f.id===id);if(finding&&Math.round(finding.amount*100)!==amount)fail('Өмнөх залруулгын эх өртөлтийг дарж өөрчлөхгүй.');
 row.finding=id;((m.pilotFindingFacts??={})[id]??=[]).push({version:(prior?.version??0)+1,form:v.paper,paper:m.work[workKey(m.engagement,v.paper)].version,reference:v.unit,classification:v.classification,evidence:row.evidence,criterion:v.criterion,effect:v.effect,matter:row.id,currency:v.currency,period:v.period,condition:v.condition,cause:v.cause,by:row.review.by,at:now()});
 if(!finding)m.findings.push({id,form:v.paper,engagement:m.engagement,title:row.title,amount:amount/100,evidence:row.evidence.id,qualitative:v.effect,status:'identified'});
}
export function finalisationAction(m,role,action,data,files){
 if(action==='completion-enable'){if(role!=='partner')fail('G05 · Партнерын ажлын хүрээний шийдвэр шаардлагатай.',403);m.pilotFinalisation??={profile:1,records:{}};m.pilotFinalisation.enabled={by:actorKey(role),at:now(),reason:input(data,'reason')};recordEvent(m,'G05 · Дуусгалтын хяналт идэвхжүүлэв');return true;}
 if(!managedCompletion(m))fail('G05 · Энэ ажлын дуусгалтын хяналтыг ил тод идэвхжүүлнэ үү.');
 const prior=data.id?versions(m,data.id)?.at(-1):undefined;if(data.id&&!prior)fail('Дуусгалтын бодит бүртгэл олдсонгүй.',404);
 if(action==='completion-case-save'){
  if(!['preparer','reviewer'].includes(role))fail('Бэлтгэх томилгоо шаардлагатай.',403);
  const kind=prior?.kind??data.kind;if(!Object.hasOwn(finalisationKinds,kind))fail('Дуусгалтын төрөл буруу.',400);
  let values=parse(data.values,'Бодит үнэлгээ');if(!values||typeof values!=='object'||Array.isArray(values)||Object.keys(values).length>35||Object.values(values).some(v=>typeof v!=='string'||v.length>64000))fail('Дуусгалтын утгууд буруу.',400);
  if(Object.keys(values).some(key=>!finalisationFields[kind].some(([allowed])=>allowed===key)))fail('Тодорхойлоогүй дуусгалтын талбар.',400);
  if(prior&&prior.by!==actorKey(role))fail('Өөр бэлтгэгчийн бүртгэлийг өөрчлөхгүй.',403);
  if(values.paper){const paper=m.work[workKey(m.engagement,values.paper)];if(!paper||paper.stage!==3||role==='preparer'&&!canEdit(m,paper))fail('Эх ажлын бодит хамрах томилгоо шаардлагатай.',403);}
  const evidence=data.evidence?attachment(m,files,data.evidence):undefined,attachments=[];
  for(const [key,,type] of finalisationFields[kind])if(type==='evidence'&&values[key])attachments.push(attachment(m,files,values[key]));
  if(kind==='disclosures'&&values.requirements){const rows=requirements({values});for(const r of rows)if(r.evidence)attachments.push(attachment(m,files,r.evidence));}
  const linked=registerRef(m,{kind,values});if(linked)for(const key of ['evidence','delivery','response'])if(linked.values[key])attachments.push(attachment(m,files,linked.values[key]));
  const title=input(data,'title',200),nextOwner=input(data,'nextOwner',20),followup=input(data,'followup');if(!['preparer','reviewer','partner'].includes(nextOwner))fail('Бодит дараагийн хариуцагч шаардлагатай.');
  const id=prior?.id??randomUUID(),row={id,kind,version:(prior?.version??0)+1,title,values,evidence,attachments,by:actorKey(role),at:now(),status:'draft',nextOwner,followup,events:[{action,by:actorKey(role),at:now()}],...(prior?.finding&&{finding:prior.finding})};row.stamp=hash(basis(m,row));((m.pilotFinalisation.records)[id]??=[]).push(row);
 }else{
  const row=prior;if(!row||String(row.version)!==data.version||row.stamp!==hash(basis(m,row)))fail('G05 · Яг одоогийн эх ба дуусгалтын хувилбарыг шинэчилнэ үү.');
  if(action==='completion-case-submit'){if(row.by!==actorKey(role)||!['draft','returned'].includes(row.status))fail('Бэлтгэсэн бодит хувилбар шаардлагатай.',403);validate(m,row);row.status='submitted';}
  else if(action==='completion-case-approve'||action==='completion-case-return'){
   if(role==='preparer'||actorKey(role)===row.by||row.status!=='submitted')fail('Хараат бус ахлах / партнерын бодит шийдвэр шаардлагатай.',403);
   if(['mandate','followup'].includes(row.kind)&&role!=='partner')fail('Тусдаа үйлчилгээний эрх / хаалтын партнерын шийдвэр шаардлагатай.',403);
   const disposition=data.disposition??'limited';if(!['supported','limited'].includes(disposition))fail('Бодит шийдвэрийн төлөв шаардлагатай.');
   if(action.endsWith('approve')){validate(m,row);if(disposition==='supported'&&!supported(m,row))fail('Дутуу, зөрүүтэй эсвэл бодитоор хийгээгүй ажлыг цэвэр болгож батлахгүй.');row.status='approved';}else row.status='returned';
   row.review={by:actorKey(role),at:now(),reason:input(data,'reason'),disposition};if(row.status==='approved'&&disposition==='supported'&&row.kind==='matter')confirmMatter(m,row);
  }else fail('G05 · Дуусгалтын үйлдэл олдсонгүй.',404);
  row.events.push({action,by:actorKey(role),at:now(),status:row.status,review:structuredClone(row.review)});
 }
 recordEvent(m,'G05 · '+action,'4.4');return true;
}
export function finalisationGaps(m){
 if(!managedCompletion(m))return [];
 const all=records(m),gaps=[];for(const kind of ['statements','disclosures','representations','communication','otherInformation','legal','going','events'])if(!all.some(r=>r.kind===kind&&current(m,r)))gaps.push('G05 · '+finalisationKinds[kind]+' · одоогийн хараат бус үнэлгээ');
 for(const row of all)if(!current(m,row)&&!['mandate','recommendation','followup'].includes(row.kind))gaps.push('G05 · '+(restricted(row)?'Хязгаарласан асуудал':row.title)+' · бодит шийдвэр / эх хувилбар');
 const limited=all.filter(r=>current(m,r)&&r.review.disposition==='limited');if(limited.length&&!approvedRows(m,'M10-F08').some(r=>r.finalisationBasis===finalisationStamp(m)&&r.values.result==='limited'))gaps.push('G05 · Хязгаарлалтыг яг одоогийн M10-F08 шийдвэрт тусгана уу.');
 if(!m.pilotQuality?.policy)gaps.push('G05 · Формал EQR хэрэглэх эсэхийн бодит шийдвэр');
 return [...new Set(gaps)];
}
export const scopedFinalisationRecords=(m,role,auditOnly=false)=>records(m).filter(r=>(!auditOnly||!service(r))&&(!restricted(r)||role!=='preparer'||r.by===actorKey(role))).map(r=>({...r,current:current(m,r),history:(versions(m,r.id)??[]).slice(0,-1).reverse()}));
export function finalisationView(m,role,auditOnly=false){
 const all=records(m).filter(r=>!auditOnly||!service(r)),shown=scopedFinalisationRecords(m,role,auditOnly),queue=shown.filter(r=>!r.current||r.review?.disposition==='limited').map(r=>({id:r.id,title:r.title,owner:r.nextOwner,reason:r.followup}));
 for(const paper of Object.values(m.work).filter(p=>p.engagement===m.engagement))for(const note of paper.notes.filter(n=>!n.cleared))queue.push({id:note.id,title:paper.form+' · '+(note.anchor??'')+' · '+note.text,owner:note.response?paper.reviewer:paper.owner,reason:note.response?'Хариуг хараат бусаар хаах шийдвэр':'Бодит хариу / засвар хүлээж байна'});
 if(managedCompletion(m)&&!currentEvaluation(m))queue.push({id:'G05-EVALUATION',title:'Одоогийн материаллаг байдал, үлдсэн нөлөө ба чанарын үнэлгээ',owner:'reviewer',reason:'Хараат бус партнерын яг хувилбарын шийдвэр шаардлагатай'});
 if(managedCompletion(m)&&!qualityRef(m))queue.push({id:'G05-QUALITY',title:'Хэрэглэх формал EQR / томилсон эцсийн баталгаа',owner:m.pilotQuality?.policy?.mode==='required'?'quality':'partner',reason:'Хэрэглэх бодит хүрээ ба шийдвэрийг хянана уу'});
 return {context:{period:m.bench.periods[m.engagement].start+'/'+m.bench.periods[m.engagement].end,currency:approvedPopulation(m)?.currency??'',statement:m.engagements[0].fsVersion},enabled:managedCompletion(m),records:shown,queue,gaps:finalisationGaps(m),mandateActive:all.some(r=>r.kind==='mandate'&&current(m,r)&&r.values.from<=today()&&r.values.through>=today())};
}
// Non-cash corrections use the existing correction/finding stores, with explicit effect verification.
export function effectPostingCurrent(m,row){
 const post=row?.postings?.at(-1);if(!post||!row.response||!fileLive(m,row.response.file)||!fileLive(m,row.support))return;
 if(row.mode==='disclosure'){const management=currentManagement(m);return management&&m.engagements[0].fsVersion===post.statement&&management.notes.id===post.notes.id&&fileLive(m,post.evidence)?post:undefined;}
 return approvedPopulation(m)?.version===post.population&&fileLive(m,post.evidence)?post:undefined;
}
export function effectCorrectionAction(m,role,action,data,files){
 const finding=m.findings.find(f=>f.id===data.id),prior=m.pilotCorrections?.[data.id]?.at(-1);if(!finding||!isCurrentReview(m.work[workKey(m.engagement,finding.form)]))fail('Яг хянасан эх илрүүлэлт шаардлагатай.');
 const amount=value=>{const n=cents(value);if(n===null||n<0)fail('Сөрөг бус өртөлтийн бодит дүн шаардлагатай.');return n;};
 if(action==='correction-effect-propose'){
  if(finding.status==='posted_verified')fail('Бодитоор баталгаажсан засварыг шинэ саналд дарж алдахгүй.');
  if(role!=='reviewer')fail('Ахлах бэлтгэгч шаардлагатай.',403);if(!['disclosure','reclassification'].includes(data.mode))fail('Бодит залруулгын төрөл шаардлагатай.');
  const exposure=amount(input(data,'amount',24));if(exposure>Math.round(Math.abs(finding.amount)*100))fail('Илрүүлэлтийн өртөлтөөс илүүг засагдсан гэж тооцохгүй.');
  const row={version:(prior?.version??0)+1,mode:data.mode,amount:exposure,reference:input(data,'reference',150),description:input(data,'description'),support:attachment(m,files,data.evidence),statement:m.engagements[0].fsVersion,by:actorKey(role),at:now(),postings:[]};
  if(row.mode==='reclassification'){
   let effects=parse(data.effects,'Дансны тусдаа нөлөөнүүд');if(!Array.isArray(effects)||effects.length<2||effects.length>40)fail('Хоёроос 40 тусдаа дансны нөлөө оруулна уу.');
   const keys=new Set();row.effects=effects.map(effect=>{required(effect,['account','reference','amount','currency']);const centsValue=cents(effect.amount);if(centsValue===null||centsValue===0||!/^[A-Z]{3}$/.test(effect.currency)||keys.has(effect.account+':'+effect.reference))fail('Тусдаа нөлөөний дүн, валют, түлхүүрийг шалгана уу.');keys.add(effect.account+':'+effect.reference);return {...effect,cents:centsValue};});
   if(new Set(row.effects.map(e=>e.currency)).size!==1||row.effects.reduce((n,e)=>n+e.cents,0)!==0)fail('Энэ дахин ангилалтын профиль нэг валюттай, тэнцсэн тусдаа мөрүүдтэй байна; цэвэр тэг нь засварын нотолгоо биш.');
  }else row.anchor=input(data,'anchor',300);
  ((m.pilotCorrections??={})[finding.id]??=[]).push(row);
 }else{
  if(!prior||!['disclosure','reclassification'].includes(prior.mode)||String(prior.version)!==data.version||!fileLive(m,prior.support))fail('Одоогийн тусдаа нөлөөний залруулга шаардлагатай.');
  if(action==='correction-effect-response'){
   if(role==='preparer')fail('Бодит удирдлагын хариуг бүртгэх эрх шаардлагатай.',403);if(prior.response)fail('Өмнөх хариуг дарж өөрчлөхгүй.');
   const accepted=amount(data.amount);if(!['accepted','partial','declined'].includes(data.result)||data.result==='accepted'&&accepted!==prior.amount||data.result==='partial'&&(accepted<=0||accepted>=prior.amount)||data.result==='declined'&&accepted!==0)fail('Бодит хариу ба зөвшөөрсөн дүн зөрсөн.');prior.response={amount:accepted,result:data.result,file:attachment(m,files,data.evidence),reason:input(data,'reason'),by:actorKey(role),at:now()};
  }else if(action==='correction-effect-verify'){
   if(role!=='partner'||prior.by===actorKey(role))fail('Хараат бус партнерын бодит шалгалт шаардлагатай.',403);if(!prior.response||prior.response.result==='declined'||!fileLive(m,prior.response.file))fail('Бодит тохирсон залруулга шаардлагатай.');
   const post={amount:0,by:actorKey(role),at:now(),reason:input(data,'reason'),evidence:attachment(m,files,data.evidence)};
   if(prior.mode==='disclosure'){
    const management=currentManagement(m);if(!management||post.evidence.id!==management.notes.id||m.engagements[0].fsVersion<=prior.statement)fail('Зассан бодит шинэ СТ / тодруулгын хувилбар, удирдлагын зөвшөөрөл ба яг эх шаардлагатай.');
    post.amount=amount(data.amount);if(post.amount>prior.response.amount)fail('Тохирсон өртөлтөөс илүүг батлахгүй.');Object.assign(post,{statement:m.engagements[0].fsVersion,notes:management.notes,anchor:input(data,'anchor',300),actualWork:input(data,'actualWork')});
   }else{
    const population=approvedPopulation(m);if(!population||post.evidence.id!==population.evidence)fail('Яг одоогийн баталсан журналын эх шаардлагатай.');
    const rows=[];for(const effect of prior.effects){const matches=population.rows.filter(r=>r.state==='accepted'&&r.account===effect.account&&r.reference===effect.reference&&r.currency===effect.currency);if(!matches.length||matches.reduce((n,r)=>n+r.cents,0)!==effect.cents)fail('Дахин ангилалтын тусдаа мөр бүр яг таарах ёстой; цэвэр тэгээр батлахгүй.');rows.push(...matches.map(r=>({id:r.id,row:r.row,cents:r.cents})));}
    for(const [id,vs] of Object.entries(m.pilotCorrections??{}))if(id!==finding.id&&vs.some(v=>v.postings.some(p=>p.population===population.version&&p.rows?.some(r=>rows.some(row=>row.id===r.id)))))fail('Ижил бодит мөрийг өөр залруулгад давхар тооцохгүй.');
    Object.assign(post,{amount:prior.response.amount,population:population.version,source:population.evidence,sha256:population.sha256,rows});
   }
   prior.postings.push(post);
  }else fail('Тусдаа нөлөөний залруулгын үйлдэл олдсонгүй.',404);
 }
 recordEvent(m,'G05 · '+action,finding.form);return true;
}
