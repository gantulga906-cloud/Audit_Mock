import {createHash,randomUUID} from 'node:crypto';
import {validDate} from '../src/lib/feature-workflows.ts';
import {input,fileInput,PilotError} from './pilot-workflow.mjs';
import {approvedRows} from './pilot-registers.mjs';
import {inspectWorkbook,workbookMappingPreview} from './pilot-workbook.mjs';
const hash=v=>createHash('sha256').update(typeof v==='string'||v instanceof Uint8Array?v:JSON.stringify(v)).digest('hex');
const now=()=>new Date().toISOString(),today=()=>now().slice(0,10);
const fail=(s,status=409)=>{throw new PilotError(status,s);};
export const managedMethodology=l=>l?.controls?.profile===1;
export const methodologyActions=['methodology-enable','methodology-publisher','methodology-source-upload','methodology-source-assess','template-import','template-retire'];
export const approvedMethodologyPeople=m=>approvedRows(m,'M01-F03').map(r=>({id:r.id,name:r.values.name,account:r.values.account}));
const author=(l,role,id)=>(l.grants[id]??[]).includes(role)||role==='reviewer'&&/^F-[A-Z0-9]{8}$/.test(id)&&!l.releases[id];
export function methodologyOriginal(l,id,files){
 const ref=l.sources?.find(s=>s.id===id&&s.status==='accepted'),actual=ref&&files.read(id);
 if(!ref||!actual?.bytes||actual.sha256!==ref.sha256||hash(actual.bytes)!==ref.sha256)fail('Яг хянасан арга зүйн эхийн байт ба хувилбар шаардлагатай.');return ref;
}
export function publisherAuthority(l,role,m,files){
 const grant=l.publishers?.[role];if(!grant||grant.revoked)fail('Нийтлэх тусдаа эрх шаардлагатай.',403);
 const person=approvedRows(m,'M01-F03').find(r=>r.id===grant.person&&r.values.account===role);
 if(!person||person.version!==grant.personVersion||!approvedRows(m,'M01-F06').some(r=>r.values.person===person.id&&r.values.capacity===role&&r.values.from<=today()&&r.values.to>=today()))fail('Нийтлэх эрхтэй бодит хүний одоогийн томилгоо шаардлагатай.',403);
 methodologyOriginal(l,grant.source,files);return grant;
}
export function validateMethodology(value){
 if(!value||!['optional','assessment-required'].includes(value.impact)||!validDate(value.effectiveFrom)||value.effectiveTo&&(!validDate(value.effectiveTo)||value.effectiveTo<value.effectiveFrom)||!['reportDate','periodEnd','today'].includes(value.dateBasis)||['edition','framework','sector','service','basis'].some(k=>typeof value[k]!=='string'||!value[k].trim()||value[k].length>1000))fail('Бодит эхийн хэвлэл, хэрэглэх хүрээ, эхлэх огноо ба сонгосон огнооны үндсийг бүртгэнэ.');
 return Object.fromEntries(['effectiveFrom','effectiveTo','dateBasis','edition','framework','sector','service','basis','source','impact'].filter(k=>value[k]!==undefined).map(k=>[k,value[k]]));
}
export function releaseDisposition(l,id,r,m){
 if(!managedMethodology(l))return {available:true,status:'approved'};
 const retired=(l.retirements??[]).find(x=>x.form===id&&x.digest===r.digest);if(retired)return {available:false,status:'retired',retired};
 if(!r.methodology)return {available:false,status:'legacy-unassessed'};
 const c=r.methodology,e=m?.engagements?.[0],client=m?.bench?.clients[e?.id],period=m?.bench?.periods[e?.id];
 const at=c.dateBasis==='today'?today():c.dateBasis==='reportDate'?e?.reportDate:period?.end;
 if(!at)return {available:false,status:'context-required'};
 if(at<c.effectiveFrom)return {available:false,status:'not-effective'};if(c.effectiveTo&&at>c.effectiveTo)return {available:false,status:'expired'};
 for(const [k,v] of [['framework',client?.framework],['sector',client?.industry??e?.industry],['service',m?.pilotIntake?.service]])if(c[k]!=='*'&&(!v||c[k].trim().toLowerCase()!==v.trim().toLowerCase()))return {available:false,status:'outside-scope'};
 return {available:true,status:'approved',effectiveAt:at};
}
export function releaseChanges(before,after){
 const changes=[];for(const f of after.fields){const old=before?.fields.find(x=>x.key===f.key);if(!old||JSON.stringify(old)!==JSON.stringify(f))changes.push({key:f.key,label:f.label,change:old?'changed':'added',source:f.source});}
 for(const f of before?.fields??[])if(!after.fields.some(x=>x.key===f.key))changes.push({key:f.key,label:f.label,change:'removed',source:f.source});
 for(const key of ['title','clauses','purpose','methodology'])if(JSON.stringify(before?.[key])!==JSON.stringify(after[key]))changes.push({key,label:key,change:before?'changed':'added'});
 return changes;
}
export const draftIdentity=d=>hash({body:d.body,by:d.by,submitted:d.submitted,parent:d.parent??null,note:d.note});
export function releaseReview(l,id,files){
 const d=l.drafts[id];if(!d)fail('Ноорог олдсонгүй.',404);const prior=l.releases[id]?.at(-1),body=prior?files.template(prior.digest):null;
 const source=d.body.methodology?.source;if(source)methodologyOriginal(l,source,files);
 const result={form:id,draftDigest:draftIdentity(d),contentSha256:hash(d.body),parent:prior?{number:prior.number,digest:prior.digest}:null,methodology:d.body.methodology,changes:releaseChanges(body,d.body),provenance:d.body.provenance??null};return {...result,digest:hash(result)};
}
export function importPreview(l,role,fields,files,sourceTemplate,validateCandidate){
 if(!managedMethodology(l))fail('Арга зүйн хяналтын горимыг сонгоно.');
 let mapping;try{mapping=JSON.parse(fields.mapping);}catch{fail('Импортын зураглал JSON бүтэцтэй байна.',400);}
 if(!author(l,role,mapping.form))fail('Энэ маягтыг зохиох тусдаа эрх шаардлагатай.',403);
 const source=methodologyOriginal(l,fields.source,files),book=inspectWorkbook(files.read(source.id).bytes),preview=workbookMappingPreview(book,mapping,sourceTemplate(mapping.form));
 if(validateCandidate){try{validateCandidate(mapping.form,preview.body,sourceTemplate(mapping.form));}catch(error){preview.diagnostics.push({id:'schema',detail:error.message});preview.ready=false;}}
 return {...preview,source:{id:source.id,name:source.name,sha256:source.sha256,edition:source.edition},digest:hash([preview.digest,preview.diagnostics,source.id,source.sha256,l.drafts[mapping.form]?draftIdentity(l.drafts[mapping.form]):null])};
}
export function methodologyAction(l,role,action,fields,files,m,callbacks){
 if(action==='methodology-enable'){
  if(role!=='partner')fail('Партнерын шийдвэр шаардлагатай.',403);if(!managedMethodology(l))l.controls={profile:1,by:role,at:now(),reason:input(fields,'reason')};return true;
 }
 if(!methodologyActions.includes(action))return false;if(!managedMethodology(l))fail('Арга зүйн хяналтын горим шаардлагатай.');
 if(action==='methodology-source-upload'){
  if(!['reviewer','partner'].includes(role))fail('Арга зүйн эх бүртгэх эрх шаардлагатай.',403);const {name,bytes}=fileInput(fields),id=randomUUID();files.add(id,name,bytes);
  (l.sources??=[]).push({id,name,sha256:hash(bytes),version:1,status:'received',by:role,at:now(),source:input(fields,'source'),edition:input(fields,'edition',200)});return true;
 }
 if(action==='methodology-source-assess'){
  const s=l.sources?.find(s=>s.id===fields.id&&s.status==='received');if(!s||!['reviewer','partner'].includes(role)||s.by===role)fail('Арга зүйн эхийг тусдаа хүн үнэлнэ.',403);
  if(!['accepted','rejected'].includes(fields.result))fail('Үнэлгээний үр дүн шаардлагатай.');const raw=files.read(s.id);if(!raw||hash(raw.bytes)!==s.sha256)fail('Эхийн байт зөрсөн.');s.status=fields.result;s.assessment={by:role,at:now(),reason:input(fields,'reason')};return true;
 }
 if(action==='methodology-publisher'){
  if(role!=='partner'||!['reviewer','partner'].includes(fields.actor))fail('Нийтлэх тусдаа эрхийн шийдвэр шаардлагатай.',403);
  const note=input(fields,'reason');l.publishers??={};if(fields.access==='revoke'){const old=l.publishers[fields.actor];if(!old)fail('Өмнөх эрх олдсонгүй.');old.revoked={by:role,at:now(),reason:note};return true;}
  if(fields.access!=='grant')fail('Эрхийн үйлдэл буруу байна.',400);
  const source=methodologyOriginal(l,fields.source,files),person=approvedRows(m,'M01-F03').find(r=>r.id===fields.person&&r.values.account===fields.actor);if(!person)fail('Баталсан бодит хүнийг данстай нь холбоно.');
  const grant={actor:fields.actor,person:person.id,personVersion:person.version,source:source.id,sourceSha256:source.sha256,by:role,at:now(),reason:note};
  (l.publisherHistory??=[]).push(structuredClone(grant));l.publishers[fields.actor]=grant;publisherAuthority(l,fields.actor,m,files);return true;
 }
 if(action==='template-retire'){
  const authority=publisherAuthority(l,role,m,files),r=l.releases[fields.form]?.find(r=>String(r.number)===fields.version);if(!r||r.digest!==fields.digest)fail('Яг нийтэлсэн хувилбарыг холбоно.');
  if((l.retirements??[]).some(x=>x.form===fields.form&&x.digest===r.digest))fail('Энэ хувилбар ашиглалтаас гарсан.');
  (l.retirements??=[]).push({form:fields.form,number:r.number,digest:r.digest,by:role,at:now(),reason:input(fields,'reason'),authority:structuredClone(authority)});return true;
 }
 if(action==='template-import'){
  const preview=importPreview(l,role,fields,files,callbacks.sourceTemplate,callbacks.validateDraft);if(!preview.ready||fields.previewDigest!==preview.digest||fields.importAck!=='reviewed')fail('Яг одоогийн зураглал, зөрчил ба хязгаарыг урьдчилан хянана.');
  const id=preview.body.id,old=l.drafts[id];if(old?.submitted||old&&old.by!==role)fail('Илгээсэн эсвэл өөр зохиогчийн нооргийг солихгүй.');
  const body=callbacks.validateDraft(id,preview.body,callbacks.sourceTemplate(id));
  l.grants[id]??=[role];l.drafts[id]={body,by:role,submitted:false,note:input(fields,'reason'),parent:l.releases[id]?.at(-1)?.digest??null,import:{digest:preview.digest,source:preview.source,mapping:preview.body.provenance.mapping,warnings:preview.warnings,at:now()}};return true;
 }
 return false;
}
export function methodologyNotices(m){
 const l=m.pilotFormLibrary;if(!managedMethodology(l))return [];
 return Object.entries(m.pilotForms??{}).flatMap(([form,pin])=>{const versions=l.releases[form]??[],target=versions.filter(r=>releaseDisposition(l,form,r,m).available).at(-1)??versions.at(-1),retired=(l.retirements??[]).find(r=>r.form===form&&r.digest===pin.digest);if((!target||target.digest===pin.digest)&&!retired)return [];
  const decision=m.pilotFormDecisions?.findLast(d=>d.form===form&&d.target===target?.digest&&d.from===pin.digest);return [{form,from:pin,target:target?{number:target.number,digest:target.digest,note:target.note,changes:target.changes,disposition:releaseDisposition(l,form,target,m)}:null,retired,requiresAssessment:target?.methodology?.impact==='assessment-required'&&releaseDisposition(l,form,target,m).available,decision}];});
}
export function methodologyDecision(m,role,fields){
 if(role==='preparer')fail('Ахлах хянагч / партнерын шийдвэр шаардлагатай.',403);
 const notice=methodologyNotices(m).find(n=>n.form===fields.form&&n.target?.digest===fields.target&&n.from.digest===fields.from);if(!notice)fail('Одоогийн өөрчлөлтийн мэдэгдлийг дахин нээнэ.');
 if(fields.requiredChange!=='no'||fields.decision!=='defer')fail('Заавал өөрчлөх горимыг энэ шийдвэрээр хойшлуулахгүй. Баталсан өөрчлөлтийн ажлыг тусдаа хэрэгжүүлнэ.');
 (m.pilotFormDecisions??=[]).push({form:fields.form,from:fields.from,target:fields.target,decision:'defer',requiredChange:'no',reason:input(fields,'reason'),by:role,at:now()});
}
