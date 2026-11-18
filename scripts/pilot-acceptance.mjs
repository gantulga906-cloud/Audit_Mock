import {actorKey,currentIdentity} from './pilot-identity-context.mjs';
import {createHash} from 'node:crypto';
import {acceptanceChecks} from '../src/lib/pilot-acceptance.ts';
import {validDate} from '../src/lib/feature-workflows.ts';
import {recordEvent,workKey} from '../src/lib/workspace.ts';
import {input,PilotError,invalidateReport} from './pilot-workflow.mjs';
import {approvedRows,acceptanceRegisterGaps} from './pilot-registers.mjs';
import {evidenceCurrent} from './pilot-requests.mjs';

const day=()=>new Date().toISOString().slice(0,10), now=()=>new Date().toISOString();
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const allow=condition=>{if(!condition)fail('Энэ үйлдэлд тусдаа эрхтэй оролцогч шаардлагатай.',403);};
const optional=(data,key,max=4000)=>data?.[key]===undefined||data[key]===''?'':input(data,key,max);
const roles=['preparer','reviewer','partner'];
const scopeOf=m=>({engagement:m.engagement,client:m.pilotIntake?.client,clientVersion:m.pilotIntake?.version,
 confirmation:m.pilotIntake?.confirmation,service:m.pilotIntake?.service,intendedUsers:m.pilotIntake?.intendedUsers,
 period:m.bench.periods[m.engagement],profile:m.bench.clients[m.engagement]});
export const enableAcceptance=m=>m.pilotAcceptance??={profile:1,assessments:[],decisions:[],proposals:[]};
export const isAcceptanceAction=action=>action.startsWith('acceptance-')||action.startsWith('intake-terms-prop')||
 ['intake-terms-review','intake-terms-return','intake-terms-send'].includes(action);
const personFor=(m,role)=>approvedRows(m,'M01-F03').find(row=>row.values.account===role&&row.values.status==='active'&&(!currentIdentity()||row.id===currentIdentity().staff));
const personSnapshot=row=>({id:row.id,version:row.version,name:row.values.name,reference:row.values.reference});
export function acceptanceActor(m,role){
 const person=personFor(m,role);if(!person)fail('Одоогийн нэртэй, данстай мэргэжилтний бүртгэл шаардлагатай.');return personSnapshot(person);
}

export function acceptanceFile(m,files,id) {
 const item=m.evidence.find(row=>row.id===id&&row.engagement===m.engagement&&evidenceCurrent(m,row));
 const file=files.get(id), original=files.read(id);
 if(!item||!file||!original||createHash('sha256').update(original.bytes).digest('hex')!==file.sha256)fail('Одоогийн үнэлсэн, бүтэн эх файлыг сонгоно уу.');
 return {id,version:item.version,sha256:file.sha256};
}
function assessmentBasis(m) {
 const assessment=m.pilotAcceptance?.assessment;
 const relied=new Set([assessment?.ruleEvidence,...Object.values(assessment?.checks??{}).map(c=>c.evidence)].filter(Boolean));
 const records=(m.pilotRecords??[]).filter(row=>['M03-F04','M04-F02','M04-F04','M04-F05','M04-F06'].includes(row.kind));
 const people=new Set(records.map(row=>row.values.person).filter(Boolean));
 return hash({scope:scopeOf(m),proposedScope:m.pilotAcceptance?.proposal?.scope??assessment?.scope??'',assuranceChange:m.pilotAcceptance?.proposal?.assuranceChange??'same',
  reliedEvidence:m.evidence.filter(row=>relied.has(row.id)).map(row=>({id:row.id,version:row.version,current:evidenceCurrent(m,row)})),
  facts:m.pilotContextItems??[],records:records.map(row=>({id:row.id,version:row.version,status:row.status,
  values:row.values,declaration:row.declaration,references:row.references})),
  people:(m.pilotRecords??[]).filter(row=>people.has(row.id)).map(row=>({id:row.id,version:row.version,status:row.status})),
  originals:m.evidence.filter(row=>records.some(record=>record.declaration?.evidence===row.id)).map(row=>({id:row.id,version:row.version,current:evidenceCurrent(m,row)})),
  questionnaires:['1.4.1','1.4.2','1.4.5'].flatMap(form=>{const paper=m.work[workKey(m.engagement,form)];return m.pilotForms?.[form]&&paper?
   [{form,version:paper.version,values:paper.values,template:m.pilotForms[form]}]:[];})});
}
const decisionBasis=(m,authority=m.pilotAcceptance?.decisions.at(-1)?.authorityEvidence)=>hash({assessment:m.pilotAcceptance?.assessment,source:assessmentBasis(m),terms:m.pilotTerms,
 authorityEvidence:m.evidence.filter(row=>row.id===authority).map(row=>({id:row.id,version:row.version,current:evidenceCurrent(m,row)})),
 termsCurrent:m.pilotTerms&&m.evidence.some(row=>row.id===m.pilotTerms.evidence&&evidenceCurrent(m,row)),
 authorityPeople:approvedRows(m,'M01-F03').filter(row=>row.values.account==='partner').map(personSnapshot)});
export function acceptanceCurrent(m) {
 const state=m.pilotAcceptance;if(!state)return true;
 const last=state.decisions.at(-1);
 return !!last&&last.setupAuthorized===true&&['accept','continue'].includes(last.outcome)&&last.validThrough>=day()&&last.basis===decisionBasis(m);
}
export function activeAcceptanceGap(m) {
 return m.pilotAcceptance&&m.engagements[0]?.intake.active&&!acceptanceCurrent(m)?
  'G01 · Хүлээн авах шийдвэрийг одоогийн мэдээлэл, мэдүүлэг ба нөхцөлөөр дахин үнэлнэ үү.':'';
}

function positiveGaps(m,files) {
 const a=m.pilotAcceptance?.assessment,gaps=[];
 if(!a)return ['G01 · Хүлээн авах үнэлгээ шаардлагатай.'];
 if(!m.pilotIntake?.intendedUsers?.trim())gaps.push('G01 · Хүлээгдэж буй тайлан ашиглагчдыг тодруулна уу.');
 if(!a.scope||a.scope!==(m.pilotAcceptance.proposal?.scope??a.scope))gaps.push('G01 · Яг санал болгосон хамрах хүрээг үнэлнэ үү.');
 for(const [key,label] of acceptanceChecks){
  const check=a.checks[key];
  if(!check||!(check.result==='supported'||key==='predecessor'&&check.result==='na')||!check.basis)gaps.push(label+' · Шийдээгүй үнэлгээ');
  else if(check.result==='supported')try{acceptanceFile(m,files,check.evidence);}catch{gaps.push(label+' · Үнэлсэн эх файл');}
 }
 if(!a.requirement||!a.edition)gaps.push('G01 · Шаардлага, хэрэглэсэн хувилбар');
 try{acceptanceFile(m,files,a.ruleEvidence);}catch{gaps.push('G01 · Хэрэглэх шаардлага, хувилбарын эх баримт');}
 if((m.pilotContextItems??[]).some(item=>item.status!=='confirmed'))gaps.push('G01 · Буцаасан мэдээллийг баталгаажуулна уу.');
 for(const role of roles.filter(role=>files.member(role))){
  if(!approvedRows(m,'M04-F04').some(row=>row.values.assignee===role&&row.declaration?.person&&['none','disclosure'].includes(row.declaration?.disposition)))
   gaps.push('G01 · '+role+' нэртэй, үнэлсэн мэдүүлэг / асуудлын шийдвэр');
 }
 for(const row of approvedRows(m,'M04-F04')){
  const declaration=row.declaration;
  if(!declaration?.person||!['none','disclosure'].includes(declaration.disposition))gaps.push('G01 · Мэдүүлгийн тодорхойгүй байдал / хориг');
  if(declaration?.disposition==='disclosure'&&!approvedRows(m,'M04-F05').some(threat=>threat.values.declaration===row.id&&
    threat.values.treatment==='threat'&&threat.values.residual==='acceptable'))gaps.push('G01 · Ил болгосон нөхцөлийн бодит үнэлгээ');
 }
 return [...gaps,...acceptanceRegisterGaps(m)];
}
export function acceptanceActivationGaps(m) {
 return m.pilotAcceptance&&!acceptanceCurrent(m)?['G01 · Тусдаа, одоогийн хүлээн авах / үргэлжлүүлэх шийдвэр шаардлагатай.']:[];
}
function rememberAssessment(state,role,status,reason) {
 const a=state.assessment;a.status=status;
 a.history.push({version:a.version,status,by:actorKey(role),at:now(),reason});
}
const proposalKeys=['scope','framework','templateReference','auditorResponsibilities','managementResponsibilities','deliverable','timetable','fees','treatmentBasis','justification'];
export function acceptanceAction(m,role,action,data,files) {
 if(!m.engagements[0])fail('Гэрээт ажлыг сонгоно уу.');
 if(files.archive.isSealed(m)||m.pilotIssue||m.engagements[0].issued)fail('Гаргасан / түгжсэн ажлын шийдвэрийг баталсан өөрчлөлтийн замаар шийднэ.');
 if(action==='acceptance-enable'){
  allow(role==='partner');if(!m.pilotIntake)fail('Үйлчлүүлэгчийн баталгаажуулалттай хүлээн авах ажлыг сонгоно уу.');
  enableAcceptance(m);recordEvent(m,'G01 · Өмнөх түүхийг хадгалж, тусдаа хүлээн авах горим идэвхжүүлэв');return;
 }
 const state=m.pilotAcceptance;if(!state)fail('G01 горимыг партнер идэвхжүүлнэ.');
 if(action==='acceptance-assess'){
  allow(role!=='partner'&&(!state.assessment||state.assessment.by===actorKey(role)));
  const old=state.assessment;if(old?.status==='submitted')fail('Үнэлгээг засварт буцаана уу.');
  const kind=input(data,'kind',16);if(!['initial','continuance'].includes(kind)||kind==='initial'&&m.pilotIntake?.prior)fail('Анхны / үргэлжилсэн үнэлгээний төрлийг шалгана уу.');
  const checks=Object.fromEntries(acceptanceChecks.map(([key])=>{
   const result=optional(data,'result.'+key,16)||'unknown';if(!['unknown','supported','adverse','na'].includes(result))fail('Үнэлгээний төлөв буруу.',400);
   const due=optional(data,'due.'+key,10),owner=optional(data,'owner.'+key,16);
   if(due&&!validDate(due)||owner&&!roles.includes(owner))fail('Дараагийн ажил, огноог шалгана уу.',400);
   return [key,{result,basis:optional(data,'basis.'+key),evidence:optional(data,'evidence.'+key,64),owner,due,followup:optional(data,'followup.'+key)}];
  }));
  if(old)state.assessments.unshift(structuredClone(old));
  state.assessment={version:(old?.version??0)+1,status:'draft',kind,by:actorKey(role),at:now(),checks,scope:optional(data,'assessmentScope')||state.proposal?.scope||'',
   requirement:optional(data,'requirement'),edition:optional(data,'edition',200),ruleEvidence:optional(data,'ruleEvidence',64),history:[]};
  rememberAssessment(state,role,'draft','Үнэлгээ хадгалав');
 }else if(action==='acceptance-submit'){
  const a=state.assessment;allow(a?.by===actorKey(role));
  if(!['draft','returned'].includes(a.status))fail('Үнэлгээний ноорог шаардлагатай.');
  for(const [key,label] of acceptanceChecks){const c=a.checks[key];if(['unknown','adverse'].includes(c.result)&&(!c.owner||!c.due||!c.followup))fail(label+' · Дараагийн ажил, хариуцагч, огноо');}
  a.byPerson=acceptanceActor(m,role);a.basis=assessmentBasis(m);rememberAssessment(state,role,'submitted','Хараат бус хяналтад илгээв');
 }else if(action==='acceptance-review'||action==='acceptance-return'){
  const a=state.assessment;allow(role!=='preparer'&&a?.by!==actorKey(role));
  if(a?.status!=='submitted'||String(a.version)!==data.version)fail('Яг илгээсэн үнэлгээний хувилбарыг сонгоно уу.');
  const reason=input(data,'reason');
  if(action==='acceptance-return')rememberAssessment(state,role,'returned',reason);
  else{
   const recommendation=input(data,'recommendation',16);if(!['accept','defer','decline'].includes(recommendation))fail('Саналын төрлийг шалгана уу.',400);
   if(a.basis!==assessmentBasis(m))fail('Үнэлгээнд ашигласан мэдээлэл өөрчлөгдсөн. Буцааж дахин үнэлнэ үү.');
   if(recommendation==='accept'){const gaps=positiveGaps(m,files);if(gaps.length)fail(gaps.join(' · '));}
   Object.assign(a,{recommendation,reviewedBy:role,reviewedPerson:acceptanceActor(m,role),reviewedAt:now(),reviewReason:reason});rememberAssessment(state,role,'reviewed',reason);
  }
 }else if(action==='acceptance-decide'){
  allow(role==='partner');const person=personFor(m,role);if(!person)fail('Одоогийн нэртэй, данстай мэргэжилтний бүртгэл шаардлагатай.');
  const outcome=input(data,'outcome',16),positive=['accept','continue'].includes(outcome),a=state.assessment;
  if(!['accept','continue','defer','decline','conditional'].includes(outcome))fail('Шийдвэрийн төрлийг шалгана уу.',400);
  const rationale=input(data,'rationale'),authority=input(data,'authority'),authorityEvidence=input(data,'authorityEvidence',64);
  acceptanceFile(m,files,authorityEvidence);
  const validThrough=input(data,'validThrough',10);if(!validDate(validThrough)||validThrough<day())fail('Шийдвэрийн хүчинтэй хугацааг шалгана уу.',400);
  if(!a)fail('Шийдвэрийн үнэлгээг хадгална уу.');
  if(positive){
   if(a.status!=='reviewed'||a.recommendation!=='accept'||a.basis!==assessmentBasis(m))fail('Яг одоогийн хараат бус хяналттай үнэлгээ шаардлагатай.');
   if((outcome==='continue')!==(a.kind==='continuance'))fail('Үнэлгээ ба шийдвэрийн төрлийг шалгана уу.');
   const gaps=positiveGaps(m,files);if(gaps.length)fail(gaps.join(' · '));
   const terms=m.pilotTerms;
   if(terms?.status!=='approved'||terms.scope!==a.scope||terms.clientVersion!==m.pilotIntake?.version||terms.confirmation!==m.pilotIntake?.confirmation)fail('Яг одоогийн тохиролцсон нөхцөлийг батална уу.');
   if(acceptanceFile(m,files,terms.evidence).sha256!==terms.sha256)fail('Нөхцөлийн эх файл өөрчлөгдсөн.');
  }
  let condition;if(outcome==='conditional'){
   condition={text:input(data,'condition'),owner:input(data,'conditionOwner',16),due:input(data,'conditionDue',10),effect:input(data,'conditionEffect')};
   if(!roles.includes(condition.owner)||!validDate(condition.due))fail('Нөхцөлийн хариуцагч, огноог шалгана уу.',400);
  }
  state.decisions.push({version:state.decisions.length+1,outcome,setupAuthorized:positive,by:actorKey(role),at:now(),person:personSnapshot(person),authority,authorityEvidence,rationale,
   validThrough,assessmentVersion:a.version,termsVersion:m.pilotTerms?.version,basis:decisionBasis(m,authorityEvidence),
   snapshot:structuredClone({assessment:a,scope:scopeOf(m),terms:m.pilotTerms}),...(condition&&{condition})});
 }else if(action==='intake-terms-propose'){
  allow(role!=='partner'&&(!state.proposal||state.proposal.by===actorKey(role)));const old=state.proposal;
  const fields=Object.fromEntries(proposalKeys.map(key=>[key,input(data,key)]));
  const treatment=input(data,'treatment',16),assuranceChange=input(data,'assuranceChange',16);
  if(!['new','revised','unchanged'].includes(treatment)||!['same','lower'].includes(assuranceChange))fail('Нөхцөлийн төрлийг шалгана уу.',400);
  if(fields.framework!==m.bench.clients[m.engagement].framework)fail('Баталгаажуулсан тайлагналын хүрээтэй тохируулна уу.');
  if(old)state.proposals.unshift(structuredClone(old));
  state.proposal={...fields,treatment,assuranceChange,version:(old?.version??0)+1,status:'draft',by:actorKey(role),at:now(),scopeBasis:structuredClone(scopeOf(m))};
 }else if(['intake-terms-review','intake-terms-return'].includes(action)){
  const p=state.proposal;allow(role!=='preparer'&&p?.by!==actorKey(role));
  if(p?.status!=='draft'||String(p.version)!==data.version)fail('Нөхцөлийн яг ноорог хувилбар шаардлагатай.');
  Object.assign(p,{status:action==='intake-terms-return'?'returned':'reviewed',reviewedBy:role,reviewedPerson:acceptanceActor(m,role),reviewedAt:now(),reviewReason:input(data,'reason')});
 }else if(action==='intake-terms-send'){
  allow(role!=='preparer');const p=state.proposal;if(p?.status!=='reviewed'||String(p.version)!==data.version)fail('Хянасан яг хувилбар шаардлагатай.');
  (p.sent??=[]).push({by:actorKey(role),at:now(),reference:input(data,'reference')});
 }else fail('Үйлдэл олдсонгүй.',404);
 if(m.engagements[0].intake.active&&!acceptanceCurrent(m))invalidateReport(m,'G01 · Хүлээн авахад ашигласан мэдээлэл / шийдвэр өөрчлөгдөв');
 recordEvent(m,'G01 · '+action);
}

export function agreedTermsFields(m,data,files) {
 const p=m.pilotAcceptance?.proposal;if(!m.pilotAcceptance)return {};
 if(p?.status!=='reviewed'||String(p.version)!==data.proposalVersion||hash(p.scopeBasis)!==hash(scopeOf(m)))fail('Одоогийн мэдээллээр хянасан нөхцөлийн яг хувилбар шаардлагатай.');
 if(data.client!==m.pilotIntake.client||data.start!==p.scopeBasis.period.start||data.end!==p.scopeBasis.period.end)fail('Нөхцөлийн үйлчлүүлэгч ба тайлант үе тохирохгүй.');
 const contact=(m.pilotIntake.signatories??m.bench.clients[m.engagement].contacts).find(row=>row.id===data.signatoryContact&&row.signer&&
  (!row.effective||row.effective<=data.signedOn)&&(!row.ended||row.ended>data.signedOn));
 if(!contact)fail('Тухайн өдөр эрхтэй гарын үсэг зурагчийг сонгоно уу.');
 const authority=acceptanceFile(m,files,input(data,'signatoryEvidence',64));
 return {...Object.fromEntries(proposalKeys.map(key=>[key,p[key]])),proposalVersion:p.version,proposalSnapshot:structuredClone(p),
  signatory:contact.name,signatoryContact:contact.id,signatoryCapacity:contact.role,signatorySnapshot:structuredClone(contact),signatoryAuthority:authority,
  agreementVerification:input(data,'agreementVerification'),agreementMethod:'manual-written-agreement'};
}
export function acceptanceView(m,files) {
 const state=m.pilotAcceptance;if(!state)return undefined;
 return {...state,framework:m.bench.clients[m.engagement].framework,current:acceptanceCurrent(m),gaps:acceptanceActivationGaps(m),people:approvedRows(m,'M01-F03').map(row=>({id:row.id,
  name:row.values.name,reference:row.values.reference,account:row.values.account,status:row.values.status}))};
}

export function acceptanceEvidence(m){
 const state=m.pilotAcceptance;if(!state)return [];
 const assessments=[state.assessment,...state.assessments,...state.decisions.map(row=>row.snapshot?.assessment)].filter(Boolean);
 return [...new Set([...assessments.flatMap(a=>[a.ruleEvidence,...Object.values(a.checks).map(c=>c.evidence)]),
  ...state.decisions.map(row=>row.authorityEvidence),m.pilotTerms?.signatoryAuthority?.id,
  ...(m.pilotTermsHistory??[]).map(row=>row.signatoryAuthority?.id)].filter(Boolean))];
}
