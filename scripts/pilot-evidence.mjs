import {createHash} from 'node:crypto';
import {validDate} from '../src/lib/feature-workflows.ts';
import {managedEvidence,dataSource} from './pilot-data-methods.mjs';
import {PilotError,input} from './pilot-workflow.mjs';
import {evidenceCurrent} from './pilot-requests.mjs';
import {approvedRows} from './pilot-registers.mjs';
import {seatFor} from './pilot-staffing.mjs';
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const now=()=>new Date().toISOString();
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

export function evidenceScope(data){
 const scope={entity:input(data,'entity',100),start:input(data,'start',10),end:input(data,'end',10),evidenceType:input(data,'evidenceType',100)};
 if(!validDate(scope.start)||!validDate(scope.end)||scope.start>scope.end)fail('Баримтын бодит байгууллага, үе ба төрлийг шалгана уу.',400);
 return scope;
}
export function receiptMetadata(data){
 const scope=evidenceScope(data),receivedOn=input(data,'receivedOn',10),channel=input(data,'channel',40);
 if(!validDate(receivedOn)||receivedOn>now().slice(0,10)||!['manual','client-upload','direct-response','management-forwarded','inspection'].includes(channel))fail('Ирсэн бодит өдөр ба сувгийг шалгана уу.',400);
 return {scope,receivedOn,channel,supplier:input(data,'supplier',200)};
}
export function partRequirements(m,data,parts){
 if(!managedEvidence(m)&&!data.partRequirements)return;
 let values;try{values=JSON.parse(data.partRequirements??'');}catch{fail('Хүсэлтийн хэсэг бүрийн зорилго ба хүрээг оруулна уу.',400);}
 if(!Array.isArray(values)||values.length!==parts.length)fail('Хэсэг бүр нэг тодорхой шаардлагатай байна.',400);
 return values.map((value,i)=>{
  const scope=evidenceScope(value);if(scope.entity!==m.bench.clients[m.engagement].registration)fail('Хүсэлтийн байгууллага гэрээт ажилтай тохирохгүй.');
  const purpose=input(value,'purpose',1000),role=input(value,'role',20);if(!['current','comparative','post-period'].includes(role))fail('Баримтын үеийн зориулалтыг сонгоно уу.',400);
  const period=m.bench.periods[m.engagement];if(role==='current'&&(scope.start<period.start||scope.end>period.end))fail('Одоогийн баримтын хүрээ тайлант үеэс гадуур байна.');
  return {...scope,purpose,role,...(role!=='current'&&{periodBasis:input(value,'periodBasis',1000)}),positiveRequired:value.positiveRequired===true,title:parts[i]};
 });
}
export const scopeMatches=(scope,requirement)=>!!scope&&scope.entity===requirement.entity&&scope.start===requirement.start&&scope.end===requirement.end&&scope.evidenceType===requirement.evidenceType;
export function partCoverage(m,request,part){
 const requirement=part.requirement,file=m.evidence.find(e=>e.id===part.evidence);
 if(!requirement)return {state:'unassessed',reason:'Зорилго / хүрээний үнэлгээ шаардлагатай'};
 const alternative=part.alternative;
 if(alternative?.status==='approved'&&alternative.by!==alternative.review.by&&alternative.source&&
    m.evidence.some(e=>e.id===alternative.source.id&&e.version===alternative.source.version&&evidenceCurrent(m,e)))return {state:'alternative',reason:alternative.reason};
 if(file?.status==='accepted'&&part.state==='accepted'&&scopeMatches(file.scope,requirement))return {state:'covered',evidence:file.id,version:file.version};
 const rejected=part.state==='rejected'||file?.status==='rejected';return {state:rejected?'rejected-only':'missing',reason:file&&!scopeMatches(file.scope,requirement)?'Баримтын байгууллага / үе / төрөл хүссэн хэрэглээнд тохирохгүй':'Хэрэглэх зорилгын хүлээн зөвшөөрөл дутуу'};
}
export function requestCoverage(m){
 const items=m.requests.filter(r=>r.dispatch==='issued').flatMap(request=>(request.parts??[]).map(part=>({request:request.id,part:part.id,title:part.title,owner:request.owner,due:request.due,requirement:part.requirement,...partCoverage(m,request,part)})));
 return {items,counts:Object.fromEntries(['covered','missing','rejected-only','alternative','unassessed'].map(state=>[state,items.filter(i=>i.state===state).length])),boundary:'Хамралт нь хангалттай, зохистой нотолгооны дүгнэлт биш.'};
}
export function syncRequestCoverage(m,request){
 if(!managedEvidence(m)&&!request.parts.some(p=>p.requirement))return;
 const states=request.parts.map(p=>partCoverage(m,request,p).state);
 request.status=states.every(s=>['covered','alternative'].includes(s))?'complete':states.some(s=>s==='rejected-only')?'changes_requested':request.parts.some(p=>p.evidence)?'partial':'open';
}
export function validPartAcceptance(m,request,part){
 if(!part.requirement)return;
 const file=m.evidence.find(e=>e.id===part.evidence);if(!scopeMatches(file?.scope,part.requirement))fail('Хүссэн байгууллага, үе ба баримтын төрөлд тохирох хэрэглээг тусад нь үнэлнэ үү.');
}
export function evidenceRequestAction(m,role,action,data,files,request,part){
 if(action==='request-scope'){
  if(request.owner!==m.person)fail('Хүсэлтийн эзэн шаардлагатай.',403);const requirements=partRequirements(m,data,request.parts.map(p=>p.title));
  request.scopeHistory??=[];request.scopeHistory.push({at:now(),by:role,requirements:request.parts.map(p=>p.requirement),reason:input(data,'reason')});
  request.parts.forEach((p,i)=>{p.requirement=requirements[i];});
 }else{
  if(!part)fail('Хүсэлтийн хэсэг олдсонгүй.',404);
  if(action==='request-link'){
   if(request.owner!==m.person||!['missing','rejected'].includes(part.state))fail('Эзэмшсэн хүсэлтийн нээлттэй хэсгийг сонгоно уу.');const original=dataSource(m,files,input(data,'evidence',64));
   const file=m.evidence.find(e=>e.id===original.id);if(file.request&&file.request!==request.id)fail('Өөр хүсэлтийн эхийг хуулж холбохгүй. Баталсан тусдаа хэрэглээг бүртгэнэ үү.');
   part.evidence=original.id;part.state='received';(part.uses??=[]).push({evidence:original.id,state:'received',by:m.person,at:now(),reason:input(data,'reason')});
  }else if(action==='request-alternative'){
   if(request.owner!==m.person)fail('Хүсэлтийн эзэн шаардлагатай.',403);if(part.alternative?.status==='submitted')fail('Өмнөх саналыг хянуулна уу.');
   const source=dataSource(m,files,input(data,'evidence',64));if(source.id===part.evidence)fail('Өөр баримтын бодит хувилбарыг сонгоно уу.');
   const file=m.evidence.find(e=>e.id===source.id);if(!part.requirement||file.scope?.entity!==part.requirement.entity||file.scope?.start!==part.requirement.start||file.scope?.end!==part.requirement.end)fail('Өөр нотолгооны байгууллага ба үе хүссэн хэрэглээнд тохирохгүй.');
   if(part.alternative)(part.alternativeHistory??=[]).push(structuredClone(part.alternative));
   part.alternative={status:'submitted',source:{id:source.id,version:source.version,sha256:source.sha256},reason:input(data,'reason'),by:role,at:now()};
  }else if(action==='request-alternative-approve'||action==='request-alternative-return'){
   const alternative=part.alternative;if(role==='preparer'||!alternative||alternative.by===role)fail('Хараат бус хянагч шаардлагатай.',403);if(alternative.status!=='submitted')fail('Хяналтад өгсөн өөр нотолгоог сонгоно уу.');
   if(action==='request-alternative-approve'){if(part.requirement?.positiveRequired)fail('Заавал шаардлагатай эерэг хариуг өөр горимоор автоматаар орлуулахгүй. Хязгаарлалтын тусдаа дүгнэлт шаардлагатай.');if(dataSource(m,files,alternative.source.id).sha256!==alternative.source.sha256)fail('Өөр нотолгооны эх өөрчлөгдсөн.');}
   alternative.status=action==='request-alternative-approve'?'approved':'returned';alternative.review={by:role,at:now(),reason:input(data,'reason')};
  }else fail('Хүсэлтийн үйлдэл олдсонгүй.',404);
 }
 request.history.push(now()+' · '+action+' · '+role);syncRequestCoverage(m,request);
}

export function checkEvidenceRecord(m,row,files){
 const v=row.values;
 if(row.kind==='M08-F08'){
  let source;
  if(v.result==='supported')source=dataSource(m,files,v.evidence);
  else{const file=m.evidence.find(e=>e.id===v.evidence),original=file&&files.read(file.id);if(!original||hash(original.bytes)!==original.sha256)fail('Яг үнэлсэн эх ба хувилбар шаардлагатай.');source={id:file.id,version:file.version,sha256:original.sha256};}
  if(v.readable!=='yes'&&v.result==='supported')fail('Уншаагүй / унших боломжгүй эхийг дэмжсэн хэрэглээ гэж дүгнэхгүй.');
  if(!validDate(v.inspectedOn)||v.inspectedOn>now().slice(0,10))fail('Бодит үзсэн огноог оруулна уу.');
  if(v.result!=='supported'&&!v.followup)fail('Зөрчил, нэмэлт ажил эсвэл хязгаарлалтын хариуцагч ба дараагийн ажлыг тодорхойлно уу.');
  if(!['whole','page','cell','section'].includes(v.anchorKind)||v.anchorKind!=='whole'&&!v.anchor||v.anchorKind==='page'&&!/^[1-9]\d*$/.test(v.anchor??'')||v.anchorKind==='cell'&&!/^.+![A-Z]{1,3}[1-9]\d*$/i.test(v.anchor??''))fail('Бодитоор үзсэн бүтэн эх, хуудас, нүд эсвэл хэсгийн байршлыг тодорхойлно уу.');
  if(v.result!=='supported'&&(!files.member(v.nextOwner)||!seatFor(m,v.nextOwner)))fail('Үлдсэн асуудлын бодит томилгоотой дараагийн хариуцагч шаардлагатай.');
  row.evidenceBasis={id:source.id,version:source.version,sha256:source.sha256,inspectedBy:row.owner,disposition:v.result};
  const file=m.evidence.find(e=>e.id===source.id);
  if(file.request||v.request||v.part){
    const request=m.requests.find(r=>r.id===v.request),part=request?.parts?.find(p=>p.id===v.part);
    if(!request||request.dispatch!=='issued'||!part||part.evidence!==source.id||v.result==='supported'&&partCoverage(m,request,part).state!=='covered')fail('Хүсэлтийн яг зорилго / хэсэгт хэрэглээг холбоно уу.');
    row.evidenceBasis.request={id:request.id,part:part.id,scopeHash:hash(Buffer.from(JSON.stringify(part.requirement??null)))};
  }
 }
 if(row.kind!=='M07-F08'||!managedEvidence(m)&&!v.subject&&v.result!=='refusal')return;
 for(const key of ['subject','subjectDate','currency','expected','recipientBasis','replyRoute','dispatch','positiveRequired','conclusion'])if(!v[key])fail('Баталгаажуулалтын дутуу утга · '+key);
 if(!validDate(v.subjectDate)||!/^[A-Z]{3}$/.test(v.currency))fail('Баталгаажуулах өдөр ба валютыг шалгана уу.');
 const money=text=>{if(!/^[+-]?\d+(\.\d{1,2})?$/.test(text??'')||!Number.isSafeInteger(Math.round(Number(text)*100)))fail('Баталгаажуулалтын мөнгөн дүнг шалгана уу.');return Math.round(Number(text)*100);};const expected=money(v.expected);
 if(v.dispatch!=='prepared'&&(!v.sent||!v.dispatchReference||!v.dispatchEvidence))fail('Бодит гаргалтын өдөр, үр дүн, оролдлогын ишлэл ба эх шаардлагатай.');
 if(v.dispatchEvidence)dataSource(m,files,v.dispatchEvidence);
 if(['pending','limited'].includes(v.conclusion)&&(!files.member(v.nextOwner)||!seatFor(m,v.nextOwner)))fail('Баталгаажуулалтын үлдсэн ажлын бодит хариуцагчийг сонгоно уу.');
 if(v.result==='refusal'&&(!v.refusalReason||!v.implications))fail('Удирдлагын татгалзлын бодит шалтгаан, эрсдэл / тайлагналын нөлөө ба дээд хяналтын замыг хадгална уу.');
 if(v.sent&&v.sent>now().slice(0,10))fail('Ирээдүйн өдөр бодит гаргалт болохгүй.');
 if(v.negativeSole==='yes'){
  if(['lowRisk','homogeneous','lowExceptions','attention'].some(key=>v[key]!=='yes')||!v.negativeConditions||!v.negativeEvidence||!approvedRows(m,'M06-F03').some(r=>r.id===v.control&&r.values.reliance==='supported'))fail('Цорын ганц сөрөг баталгаажуулалтын бүх хамаарах нөхцөл ба бодит хяналтын сорилыг тусад нь дэмжинэ үү.');
  dataSource(m,files,v.negativeEvidence);
 }
 if(['received','difference'].includes(v.result)){
  if(v.dispatch!=='delivered'||!v.responseOrigin||!v.receivedOn||!validDate(v.receivedOn)||v.receivedOn>now().slice(0,10)||v.receivedOn<v.sent||!v.replyCurrency||!v.response)fail('Хүргэлт нь хариу биш. Бодит ирсэн хариу, өдөр, суваг ба эхийг үнэлнэ үү.');
  dataSource(m,files,v.response);if(v.replyCurrency!==v.currency)fail('Хариуны валют харьцуулах боломжгүй.');const difference=money(v.replyAmount)-expected;
  if((v.result==='received'&&difference!==0)||(v.result==='difference'&&difference===0))fail('Бодит дүн ба зөрүүний төлөв тохирохгүй.');
  if(v.responseOrigin!=='direct'&&v.conclusion==='supported'&&(!v.reliabilityEvidence||!v.reliabilityBasis))fail('Удирдлагаар дамжсан / тодорхойгүй эх нь шууд найдвартай хариу болохгүй.');
  if(v.reliabilityEvidence)dataSource(m,files,v.reliabilityEvidence);
 }
 if(['none','refusal','difference'].includes(v.result)&&(!v.resolution||!v.alternativeEvidence))fail('Хариугүй / татгалзсан / зөрүүтэй тохиолдлын бодит нэмэлт ажил ба эх шаардлагатай.');
 if(v.alternativeEvidence)dataSource(m,files,v.alternativeEvidence);
 if(v.positiveRequired==='yes'&&['none','refusal'].includes(v.result)&&v.conclusion==='supported')fail('Шаардлагатай эерэг хариуг өөр ажлаар автоматаар хангалттай гэж үзэхгүй.');
 if(v.conclusion==='supported'&&(v.result==='pending'||['prepared','failed','unknown'].includes(v.dispatch)))fail('Ирсэн, үнэлсэн хариугүй төлөв цэвэр дүгнэлт болохгүй.');
}
export const evidenceRecordStale=(m,row)=>{
 const basis=row.evidenceBasis;if(!basis)return false;
 if(basis.target&&(m.pilotForms?.[basis.target.form]?.digest??null)!==basis.target.digest)return true;
 if(!m.evidence.some(e=>e.id===basis.id&&e.version===basis.version&&(basis.disposition!=='supported'||evidenceCurrent(m,e))))return true;
 if(basis.request){const request=m.requests.find(r=>r.id===basis.request.id),part=request?.parts?.find(p=>p.id===basis.request.part);return !request||request.dispatch!=='issued'||!part||part.evidence!==basis.id||basis.disposition==='supported'&&partCoverage(m,request,part).state!=='covered'||hash(Buffer.from(JSON.stringify(part.requirement??null)))!==basis.request.scopeHash;}
 return false;
};
export function checkUploadSignature(name,bytes){
 const extension=name.split('.').at(-1)?.toLowerCase();const valid=extension==='pdf'?bytes.subarray(0,5).toString()==='%PDF-':extension==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):['jpg','jpeg'].includes(extension)?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:['xlsx','docx'].includes(extension)?bytes.subarray(0,4).equals(Buffer.from([80,75,3,4])):true;
 if(!valid)fail('Файлын төрөл ба бодит агуулгын гарын үсэг тохирохгүй.',400);
}
