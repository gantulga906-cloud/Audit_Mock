import {actorKey} from './pilot-identity-context.mjs';
import {createHash} from 'node:crypto';
import {approvedRows,opinionForm,registerRows} from './pilot-registers.mjs';
import {PilotError,input} from './pilot-workflow.mjs';
import {evidenceCurrent} from './pilot-requests.mjs';
import {managedCompletion} from './pilot-finalisation.mjs';
import {currentEvaluation} from './pilot-completion.mjs';
import {recordEvent} from '../src/lib/workspace.ts';

const digest=v=>createHash('sha256').update(typeof v==='string'||ArrayBuffer.isView(v)?v:JSON.stringify(v)).digest('hex');
const today=()=>new Date().toISOString().slice(0,10);
const fail=(message,status=409)=>{throw new PilotError(status,message);};
export const managedReporting=m=>m.pilotReporting?.profile===1;
export const reportSectionTypes=['kam','going','emphasis','other','otherInformation','regulatory'];
const rows=(m,k)=>registerRows(m).filter(r=>r.kind===k);
const contactValue=c=>({id:c.id,name:c.name,email:c.email,capacity:c.capacity??c.role??'',body:c.body??'',effective:c.effective??'',source:c.source??''});
const contacts=(m,ids,actual)=>ids.map(id=>(actual??m.bench.clients[m.engagement].contacts).find(c=>c.id===id)).filter(Boolean).map(contactValue);
const recipientIds=v=>[...new Set((v.recipients??'').split(/\r?\n/).filter(Boolean))];
const evidenceKeys={ 'M10-F09':['decisionEvidence'],'M10-F10':['authorityEvidence','issuerEvidence'],'M10-F11':['sectionEvidence']};
const reportingKinds=['M10-F09','M10-F10','M10-F11'];
const evaluationPosition=m=>{const row=currentEvaluation(m);return row?[row.version,row.stamp,row.approval.by,row.approval.at]:null;};
export function reportingEnable(m,role,data){
 if(role!=='partner')fail('Тайлагналын горимыг эрх бүхий партнер сонгоно.',403);
 if(!m.engagements[0]?.intake.active||!managedCompletion(m)||m.pilotIssue)fail('Гаргаагүй, G05 дуусгалтын горимтой идэвхтэй ажил шаардлагатай.');
 if(managedReporting(m))return;
 m.pilotReporting={profile:1,by:actorKey(role),at:new Date().toISOString(),reason:input(data,'reason')};
 recordEvent(m,'G06 · Яг тайлангийн шийдвэр, эх ба хүлээн авагчийн хяналтыг сонгов');
}
export function opinionContradictions(v,sufficiency){
 const problems=[];
 if(!['sufficient','limited'].includes(v.evidenceAdequacy)||!['none','nonmaterial','material'].includes(v.knownEffect)||!['none','nonmaterial','material'].includes(v.evidenceEffect)||!['no','yes','na'].includes(v.misstatementPervasive)||!['no','yes','na'].includes(v.limitationPervasive))return ['Нотолгоо, мэдэгдсэн нөлөө ба өргөн тархалтын хүний шийдвэр тодорхойгүй.'];
 if(v.evidenceAdequacy==='sufficient'&&v.evidenceEffect!=='none'||v.evidenceAdequacy==='limited'&&v.evidenceEffect==='none')problems.push('Нотолгооны хүрэлцээ ба бодит хязгаарлалтын шийдвэр зөрсөн.');
 if(sufficiency&&sufficiency.values.result!==(v.evidenceAdequacy==='sufficient'?'sufficient':'limited'))problems.push('M10-F08-ын яг шийдвэртэй нотолгооны хүрэлцээ зөрсөн.');
 if(v.knownEffect==='material'&&v.evidenceEffect==='material')problems.push('Давхар материаллаг суурийн тусгай аргачлал / мэргэжлийн шийдвэрийн зам хараахан дэмжигдээгүй.');
 if(v.knownEffect==='material'&&!['no','yes'].includes(v.misstatementPervasive)||v.knownEffect!=='material'&&v.misstatementPervasive!=='na'||v.evidenceEffect==='material'&&!['no','yes'].includes(v.limitationPervasive)||v.evidenceEffect!=='material'&&v.limitationPervasive!=='na')problems.push('Материаллаг нөлөө бүрийн өргөн тархалтын үнэлгээг тусдаа бүртгэнэ.');
 const valid=v.knownEffect==='material'?(v.misstatementPervasive==='yes'?'adverse':'qualified'):v.evidenceEffect==='material'?(v.limitationPervasive==='yes'?'disclaimer':'qualified'):'unmodified';
 if(v.opinion!==valid)problems.push('Сонгосон санал нь хүний бүртгэсэн суурь / материаллаг байдал / өргөн тархалтын хослолтой зөрсөн. Програм санал сонгохгүй.');
 const basis=v.knownEffect==='material'?'misstatement':v.evidenceEffect==='material'?'evidence':'none';
 if(v.basisType!==basis)problems.push('Саналын өөрчлөлтийн суурь нь бүртгэсэн нөлөөтэй зөрсөн.');
 return problems;
}
export function reportingRecordStale(m,row){
 if(!managedReporting(m)||!reportingKinds.includes(row.kind))return false;
 const basis=row.reportingBasis;
 if(!basis||basis.fs!==m.engagements[0].fsVersion||basis.reportDate!==m.engagements[0].reportDate)return true;
 if(row.kind==='M10-F09'&&JSON.stringify(basis.evaluation)!==JSON.stringify(evaluationPosition(m)))return true;
 if(basis.evidence.some(ref=>!m.evidence.some(e=>e.id===ref.id&&e.version===ref.version&&evidenceCurrent(m,e))))return true;
 return row.kind==='M10-F10'&&JSON.stringify(contacts(m,recipientIds(row.values)))!==JSON.stringify(basis.recipients);
}
function original(m,files,id){
 const e=m.evidence.find(e=>e.id===id),file=files.read(id);
 if(!e||!evidenceCurrent(m,e)||!file||digest(file.bytes)!==file.sha256)fail('Тайлангийн хянасан бодит эх, хүрээ ба хэш шаардлагатай.');
 return {id,version:e.version,sha256:file.sha256};
}
export function checkReportingRecord(m,row,files){
 if(!managedReporting(m)||!reportingKinds.includes(row.kind))return;
 const v=row.values,need=keys=>{for(const key of keys)if(!v[key])fail('G06 · Бодит шийдвэр / эх дутуу · '+key);};
 if(row.kind==='M10-F09'){
  need(['evidenceAdequacy','knownEffect','evidenceEffect','misstatementPervasive','limitationPervasive','contraryDisposition','decisionEvidence']);
  const problems=opinionContradictions(v,approvedRows(m,'M10-F08').find(r=>r.id===v.sufficiency));if(problems.length)fail(problems.join(' · '));
  if(v.knownEffect==='material'){const finding=currentEvaluation(m)?.inputs.rows.find(r=>r.id===v.decisionFinding);if(!finding||finding.outstanding<=0&&finding.classification!=='qualitative')fail('Материаллаг мэдэгдсэн нөлөөг одоогийн бодит залруулаагүй илрүүлэлт / чанарын нөлөөнд холбоно.');}
 }
 if(row.kind==='M10-F10'){
  need(['framework','jurisdiction','templateTitle','templateResolution','opinionText','basisText','managementResponsibilities','auditorResponsibilities','issuerPerson','issuerEvidence','issueDate','recipients','recipientScope']);
  if(v.issueDate<v.reportDate)fail('Бодит гаргалтын төлөвлөсөн өдөр тайлангийн өдрөөс өмнө байж болохгүй.');
  if(v.reportDate>today())fail('Ирээдүйн тайлангийн өдрийг бодит гүйцэтгэсэн өдөр гэж батлахгүй.');
  const person=approvedRows(m,'M01-F03').find(r=>r.id===v.issuerPerson);
  if(person?.values.account!=='partner'||!approvedRows(m,'M01-F06').some(r=>r.values.person===person.id&&r.values.capacity==='partner'&&r.values.from<=v.issueDate&&r.values.to>=v.issueDate))fail('Яг хүн, партнерын одоогийн томилгоо ба гаргах эрх шаардлагатай.');
  const ids=recipientIds(v),selected=contacts(m,ids,files.reportingContacts?.(m));
  if(!ids.length||ids.length!==selected.length||selected.some(c=>!c.name||!c.email)||new Set(selected.map(c=>c.email.toLowerCase())).size!==selected.length)fail('Одоогийн бодит хүлээн авагчдыг давхардалгүй сонгоно.');
  if(JSON.stringify(selected)!==JSON.stringify(contacts(m,ids)))fail('Үйлчлүүлэгчийн шинэ холбоо барих хүрээг эхлээд гэрээт ажилд баталгаажуулна.');
 }
 if(row.kind==='M10-F11'){
  need(['applicability','sectionEvidence']);
  if(!['include','omit'].includes(v.applicability))fail('Нэмэлт хэсэг бүрийн оруулах / хасах бодит шийдвэр шаардлагатай.');
  if(v.applicability==='include'&&!v.wording)fail('Оруулах хэсгийн яг үг хэллэг шаардлагатай.');
  if(rows(m,row.kind).some(r=>r.id!==row.id&&r.values.opinion===v.opinion&&r.values.type===v.type))fail('Энэ саналын хэсэг бүр нэг хувилбартай байна. Өмнөх бүртгэлээ шинэчилнэ.');
  const opinion=approvedRows(m,'M10-F09').find(r=>r.id===v.opinion);
  if(opinion?.values.opinion==='disclaimer'&&['kam','otherInformation'].includes(v.type)&&v.applicability==='include'&&(v.requiredByLaw!=='yes'||!v.legalBasis))fail('Татгалзсан саналын энэ хэсэгт тусгай хуулийн шаардлагын бодит үндэс шаардлагатай.');
 }
 const basis={...(row.kind==='M10-F09'&&{evaluation:evaluationPosition(m)}),fs:m.engagements[0].fsVersion,reportDate:m.engagements[0].reportDate,evidence:evidenceKeys[row.kind].map(key=>original(m,files,v[key])),...(row.kind==='M10-F10'&&{recipients:contacts(m,recipientIds(v))})};
 if(row.reportingBasis&&['submitted','approved'].includes(row.status)&&JSON.stringify(row.reportingBasis)!==JSON.stringify(basis))fail('Илгээсэн тайлангийн эх өөрчлөгдсөн. Буцааж шинэ хувилбараар хянана.');
 row.reportingBasis=basis;row.statementVersion=m.engagements[0].fsVersion;
}
export function reportingGaps(m){
 if(!managedReporting(m))return [];
 const opinion=approvedRows(m,'M10-F09')[0],prep=approvedRows(m,'M10-F10')[0],gaps=[];
 if(!opinion)gaps.push('G06 · Одоогийн нотолгоо / нөлөө / саналын шийдвэр шаардлагатай');
 if(!prep||prep.values.opinion!==opinion?.id)gaps.push('G06 · Яг үг хэллэг, эрх, СТ ба хүлээн авагчтай баталсан эх шаардлагатай');
 const sections=approvedRows(m,'M10-F11').filter(r=>r.values.opinion===opinion?.id);
 for(const type of reportSectionTypes)if(sections.filter(r=>r.values.type===type).length!==1)gaps.push('G06 · Нэмэлт хэсгийн оруулах / хасах одоогийн шийдвэр · '+type);
 if(prep&&opinion&&prep.values.template!==opinionForm(opinion.values.opinion))gaps.push('G06 · Санал ба эх загвар зөрсөн');
 if(prep&&sections.some(r=>r.values.type==='regulatory'&&r.values.applicability==='include')!==(prep.values.duties==='applicable'))gaps.push('G06 · Нэмэлт тайлагнах үүрэг ба баталсан хэсэг зөрсөн');
 return gaps;
}
export function reportingIOGaps(m,files){
 if(!managedReporting(m)||!files)return [];
 const gaps=[],prep=approvedRows(m,'M10-F10')[0],saved=files.authorization()?.authorization;
 if(saved?.at===m.engagements[0].authorized?.at&&saved?.artifact&&(digest(saved.artifact.html)!==saved.artifact.sha256||saved.artifact.sha256!==m.pilotReportDigest))gaps.push('G06 · Хадгалсан яг зөвшөөрсөн тайлангийн байт / хэш зөрсөн');
 for(const row of reportingKinds.flatMap(k=>approvedRows(m,k)))for(const ref of row.reportingBasis?.evidence??[]){const file=files.read(ref.id);if(!file||file.sha256!==ref.sha256||digest(file.bytes)!==ref.sha256)gaps.push('G06 · Баталсан эхийн байт / хэш зөрсөн · '+ref.id);}
 if(prep&&JSON.stringify(contacts(m,recipientIds(prep.values),files.reportingContacts?.(m)))!==JSON.stringify(prep.reportingBasis.recipients))gaps.push('G06 · Баталсан хүлээн авагчийн бодит хүрээ өөрчлөгдсөн');
 const management=m.pilotManagement?.at?.(-1)??m.pilotManagement;
 // Completion owns currentness. This check additionally protects the actual original bytes.
 for(const key of ['file','notes','authorization']){const ref=management?.[key];if(ref?.id){const file=files.read(ref.id);if(!file||digest(file.bytes)!==ref.sha256)gaps.push('G06 · Бүтэн СТ / тодруулга / зөвшөөрлийн эхийн хэш зөрсөн');}}
 return [...new Set(gaps)];
}
export function reportRecipient(m,files,id){
 const prep=approvedRows(m,'M10-F10')[0],pinned=prep?.reportingBasis?.recipients?.find(c=>c.id===id),actual=contacts(m,[id],files.reportingContacts?.(m))[0];
 if(!pinned||JSON.stringify(pinned)!==JSON.stringify(actual))fail('Зөвхөн яг баталсан одоогийн хүлээн авагчид хүргэнэ.');
 return pinned;
}
export function reportingIssueGuard(m,files){
 if(!managedReporting(m))return;
 const problems=[...reportingGaps(m),...reportingIOGaps(m,files)];if(problems.length)fail(problems.join(' · '));
 const prep=approvedRows(m,'M10-F10')[0];if(prep.values.issueDate!==today())fail('Бодит гаргалтын өдөр нь хянасан төлөвлөсөн өдөртэй таарах ёстой.');
}
export function reportingView(m,files){
 const enabled=managedReporting(m);if(!enabled)return {enabled:false};
 const opinion=approvedRows(m,'M10-F09')[0],prep=approvedRows(m,'M10-F10')[0],sections=approvedRows(m,'M10-F11').filter(r=>r.values.opinion===opinion?.id),gaps=[...reportingGaps(m),...reportingIOGaps(m,files)];
 return {enabled,profile:m.pilotReporting,opinion,preparation:prep,sections,gaps,recipients:prep?.reportingBasis?.recipients??[],issues:m.pilotIssues??[],boundary:'Approved structured decisions and exact local bytes; no automatic opinion, legal wording approval, regulated signature or external dispatch.'};
}
