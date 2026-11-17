import { randomUUID } from 'node:crypto';
import { recordEvent,isCurrentReview,workKey } from '../src/lib/workspace.ts';
import {createHash} from 'node:crypto';
import {evidenceCurrent} from './pilot-requests.mjs';
import {managedCompletion,scopedFinalisationRecords} from './pilot-finalisation.mjs';
import {consultationView} from './pilot-completion.mjs';
import { input, PilotError, qualityBasis, qualityMaterial } from './pilot-workflow.mjs';

export const oversightRoles=['quality','custodian'];
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const now=()=>new Date().toISOString();
const noteStamp=state=>createHash('sha256').update(JSON.stringify(state.notes)).digest('hex');
const policy=m=>m.pilotQuality?.policy;
const eligible=decision=>decision?.mode==='required'&&(decision.eligibilityStatus??'eligible')==='eligible';
const approval=m=>m.pilotQuality?.approvals.at(-1);
const offers=m=>m.pilotCustody??[];
const currentOffer=m=>offers(m).at(-1);

const policyCurrent=(m,p)=>{if(managedCompletion(m)&&eligible(p)&&(!p.source||['competence','capability','authority','objectivity'].some(key=>p[key]!=='supported')||!['satisfied','not-applicable'].includes(p.coolingOff)))return false;return !p?.source||m.evidence.some(e=>e.id===p.source.id&&e.version===p.source.version&&evidenceCurrent(m,e));};
function formalQualityRef(m) {
  const decision=policy(m);
  if (!decision) return '';
  if (decision.mode==='not-required') return 'not-required:'+decision.version;
  if (!eligible(decision)||!policyCurrent(m,decision)) return '';
  const review=approval(m);
  if(m.pilotQuality.notes.some(n=>!n.cleared)||managedCompletion(m)&&review?.notesStamp!==noteStamp(m.pilotQuality))return '';
  return review?.policy===decision.version&&review.basis===qualityBasis(m)&&
    review.at.slice(0,10)<=m.engagements[0].reportDate?review.basis+':'+review.at:'';
}
const finalPolicy=m=>m.pilotFinalQuality?.policy;
const selectedFinalRecords=m=>scopedFinalisationRecords(m,'quality',true).filter(r=>(finalPolicy(m)?.forms??[]).includes(r.values.paper));
const finalBasis=m=>createHash('sha256').update(JSON.stringify([(finalPolicy(m)?.forms??[]).map(form=>{const p=m.work[workKey(m.engagement,form)];return [form,p?.version,p?.reviewedVersion,p?.status,p?.values,p?.notes,p?.evidence.map(id=>{const e=m.evidence.find(e=>e.id===id);return [id,e?.version,evidenceCurrent(m,e)];})];}),selectedFinalRecords(m).map(r=>[r.id,r.version,r.current,r.review]),consultationView(m).filter(c=>(finalPolicy(m)?.forms??[]).includes(c.form)).map(c=>[c.id,c.version,c.current,c.decision])])).digest('hex');
function finalMaterial(m){
 const forms=new Set(finalPolicy(m)?.forms??[]),papers=[...forms].map(form=>m.work[workKey(m.engagement,form)]).filter(Boolean).map(({form,title,version,status,values,notes,evidence})=>({form,title,version,status,values,notes,evidence})),consultations=consultationView(m).filter(c=>forms.has(c.form)),records=selectedFinalRecords(m);
 const gaps=[...forms].filter(form=>{const p=m.work[workKey(m.engagement,form)];return !p||!isCurrentReview(p)||p.notes.some(n=>!n.cleared)||p.evidence.some(id=>!evidenceCurrent(m,m.evidence.find(e=>e.id===id)));}).map(form=>form+' · Томилсон яг ажлын бэлтгэл / хяналт');
 if(consultations.some(c=>!c.current))gaps.push('Томилсон ажилд хамаарах зөвлөлдөх шийдвэр хүлээгдэж байна');
 if(records.some(r=>!r.current))gaps.push('Томилсон ажилд хамаарах дуусгалтын бодит шийдвэр хүлээгдэж байна');
 const escape=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),html='<h1>Assigned final quality confirmation</h1>'+papers.map(p=>'<h2>'+escape(p.form+' '+p.title)+'</h2><p>'+escape(p.values.execution)+'</p><p>'+escape(p.values.conclusion)+'</p>').join('');
 return {basis:finalBasis(m),client:m.engagements[0].client,reportDate:m.engagements[0].reportDate,papers,consultations,completion:{finalisation:{records}},evidence:[...new Set([...papers.flatMap(p=>p.evidence),...records.flatMap(r=>[r.evidence?.id,...(r.attachments??[]).map(e=>e.id)]).filter(Boolean)])],gaps,artifact:{form:'Assigned final confirmation',html,sha256:createHash('sha256').update(html).digest('hex')}};
}
export function finalQualityRef(m){const p=finalPolicy(m);if(!p)return '';if(p.mode==='not-required')return 'not-required:'+p.version;const last=m.pilotFinalQuality.approvals.at(-1);return eligible(p)&&policyCurrent(m,p)&&last?.policy===p.version&&last.basis===finalBasis(m)&&!m.pilotFinalQuality.notes.some(n=>!n.cleared)&&last.notesStamp===noteStamp(m.pilotFinalQuality)?last.basis+':'+last.at:'';}
export function qualityRef(m){const formal=formalQualityRef(m);if(!m.pilotFinalQuality)return formal;const final=finalQualityRef(m);return formal&&final?formal+':assigned-final:'+final:'';}

export function qualityGaps(m) {
  const gaps=[];
  if(policy(m)&&(!formalQualityRef(m)||m.pilotQuality.notes.some(note=>!note.cleared)))gaps.push('4.6 · Формал EQR шийдвэр ба яг энэ багцын хяналт шаардлагатай');
  if(finalPolicy(m)&&(!finalQualityRef(m)||m.pilotFinalQuality.notes.some(n=>!n.cleared)))gaps.push('Томилсон R4 · Яг сонгосон ажлын эцсийн баталгаа шаардлагатай');
  return gaps;
}

export function oversightTeamView(m) {
  return {quality:m.pilotQuality&&{...m.pilotQuality,current:eligible(policy(m))&&!!formalQualityRef(m)},finalQuality:m.pilotFinalQuality&&{...m.pilotFinalQuality,current:eligible(finalPolicy(m))&&!!finalQualityRef(m)},custody:offers(m)};
}

export function oversightTeamAction(m,role,action,data,files) {
  const assigned=action.startsWith('quality-final-'),command=assigned?action.replace('quality-final-','quality-'):action,key=assigned?'pilotFinalQuality':'pilotQuality';
  if (role!=='partner'&&!(role==='reviewer'&&command==='quality-response')) fail('Томилсон багийн эрх шаардлагатай.',403);
  if (command==='quality-policy') {
    if (!m.engagements[0]?.intake.active||files.archive.isSealed(m)) fail('Нээлттэй гэрээт ажил шаардлагатай.');
    const mode=data.mode, reference=input(data,'reference'), basis=input(data,'basis');
    if (!['required','not-required','unresolved'].includes(mode)) fail('Чанарын шаардлагын шийдвэр буруу.',400);
    const eligibilityStatus=mode==='required'?(data.eligibilityStatus??'unresolved'):'';
    if (mode==='required'&&!['eligible','ineligible','unresolved'].includes(eligibilityStatus)) fail('Хянагчийн шалгуурын шийдвэр буруу.',400);
    const reviewer=mode==='required'?input(data,'reviewer',150):'';
    const eligibility=mode==='required'?input(data,'eligibility'):'';
    if (eligibilityStatus==='eligible'&&!files.oversightConfigured('quality')) fail('Хараат бус чанарын нэвтрэх эрх шаардлагатай.');
    if (m[key]?.notes.some(note=>!note.cleared)&&mode!=='required') fail('Нээлттэй хараат бус чанарын тэмдэглэлийг эхлээд шийдвэрлэнэ үү.');
    const state=m[key]??={policies:[],approvals:[],notes:[]}, prior=state.policy;
    const decision={mode,reference,basis,reviewer,eligibility,eligibilityStatus};
    if(assigned){let forms;try{forms=JSON.parse(data.forms);}catch{fail('Томилсон ажлын яг хүрээг сонгоно уу.');}if(!Array.isArray(forms)||!forms.length||forms.length>100||new Set(forms).size!==forms.length||forms.some(form=>!m.work[workKey(m.engagement,form)]))fail('Томилсон бодит ажлууд шаардлагатай.');decision.forms=forms;}
    if(managedCompletion(m)&&mode==='required'){
      for(const field of ['competence','capability','authority','objectivity'])if(data[field]!=='supported'&&eligibilityStatus==='eligible')fail('Шалгуур бүрийг тусдаа бодит эхээр үнэлнэ үү · '+field);else decision[field]=data[field]??'unresolved';
      if(eligibilityStatus==='eligible'&&!['satisfied','not-applicable'].includes(data.coolingOff))fail('Хэрэглэгдэх өмнөх оролцоо / cooling-off үнэлгээ шаардлагатай.');decision.coolingOff=data.coolingOff??'unresolved';
      const e=m.evidence.find(e=>e.id===data.eligibilityEvidence&&evidenceCurrent(m,e)),original=e&&files.get(e.id);if(!original&&eligibilityStatus==='eligible')fail('Бодит эрх, хараат бус байдал ба шалгуурын эх шаардлагатай.');if(e&&original)decision.source={id:e.id,version:e.version,sha256:original.sha256};
    }
    if (prior&&Object.entries(decision).every(([key,value])=>JSON.stringify(prior[key])===JSON.stringify(value))) return;
    const row={...decision,version:(prior?.version??0)+1,by:role,at:now()};
    state.policies.push(row);state.policy=row;
  } else if (command==='quality-response') {
    if (files.archive.isSealed(m)) fail('Архив түгжээтэй.');
    const note=m[key]?.notes.find(item=>item.id===data.id&&!item.cleared);
    if (!note) fail('Чанарын нээлттэй тэмдэглэл шаардлагатай.');
    (note.responses??=[]).push({text:input(data,'reason'),by:role,at:now(),basis:assigned?finalBasis(m):qualityBasis(m)});
  } else if (action==='archive-offer-custody') {
    if (!files.archive.isSealed(m)||!files.oversightConfigured('custodian')) fail('Түгжээтэй архив ба хараат бус хадгалалтын нэвтрэх эрх шаардлагатай.');
    const id=input(data,'package',36), record=files.archive.inspectCustody(m,id,true);
    const prior=currentOffer(m);
    if (prior?.id===id&&!prior.returned) return;
    const resolution=prior?.returned?input(data,'resolution'):'';
    (m.pilotCustody??=[]).push({id,digest:record.digest,recipient:input(data,'recipient',150),offeredAt:now(),by:role,...(resolution&&{resolution,previousOffer:prior.offeredAt})});
  } else fail('Хяналтын үйлдэл олдсонгүй.',404);
  recordEvent(m,action,action.startsWith('quality-')?'4.6':undefined);
}

export function createOversightStore(store,filesFor) {
  function allowed(role,m) {
    return role==='quality'?((eligible(policy(m))&&policyCurrent(m,policy(m)))||(eligible(finalPolicy(m))&&policyCurrent(m,finalPolicy(m))))&&!filesFor(m.engagement).archive.isSealed(m):!!currentOffer(m);
  }
  function contextFor(role,id) {
    if (!/^E-[a-f0-9-]{36}$/.test(id??'')) fail('Томилсон ажил олдсонгүй.',404);
    const context=store.load('partner',id);
    if (!allowed(role,context.model)) fail('Томилсон ажил олдсонгүй.',404);
    context.model.person=role;
    return context;
  }
  function view(role,id) {
    const assignments=store.portfolio('partner').filter(item=>allowed(role,store.load('partner',item.id).model))
      .map(({id,client})=>({id,client}));
    if (!id) return {role,assignments};
    const context=contextFor(role,id), m=context.model, files=filesFor(id);
    if (role==='quality') {
      const formal=eligible(policy(m))&&policyCurrent(m,policy(m)),material=formal?qualityMaterial(m):finalMaterial(m),evidence=material.evidence.map(id=>({id,...files.get(id)})).filter(f=>f.sha256),final=eligible(finalPolicy(m))&&policyCurrent(m,finalPolicy(m))?finalMaterial(m):undefined;
      return {role,assignments,selected:id,quality:oversightTeamView(m).quality,finalQuality:oversightTeamView(m).finalQuality,managed:managedCompletion(m),formalAvailable:formal,material:{...material,evidence},...(final&&{finalMaterial:{...final,evidence:final.evidence.map(id=>({id,...files.get(id)})).filter(f=>f.sha256)}})};
    }
    const offer=currentOffer(m);
    let record;
    try{record=files.archive.inspectCustody(m,offer.id);}catch(error){return {role,assignments,selected:id,custody:offer,manifestError:error.message};}
    return {role,assignments,selected:id,custody:offer,manifest:{fileCount:record.bundle.evidence.length,
      files:record.bundle.evidence.map(({name,sha256,size})=>({name,sha256,size})),report:record.bundle.issue.reportSha256}};
  }
  function action(role,id,data) {
    const context=contextFor(role,id), m=context.model, files=filesFor(id);
    if (role==='quality') {
      const assigned=data.reviewKind==='confirmation',basis=assigned?finalBasis(m):qualityBasis(m),state=assigned?m.pilotFinalQuality:m.pilotQuality;
      if(!state||!eligible(state.policy)||!policyCurrent(m,state.policy))fail('Одоогийн эрхтэй тусдаа хяналтын томилгоо шаардлагатай.',403);
      if (data.basis!==basis) fail('Хянасан багц өөрчлөгдсөн. Одоогийн хувилбарыг нээнэ үү.');
      if (data.action==='return') {
        state.notes.push({id:randomUUID(),text:input(data,'reason'),basis,by:role,at:now()});
      } else if(data.action==='clear'){
        const note=state.notes.find(n=>n.id===data.id&&!n.cleared),response=note?.responses?.at(-1);if(!note||!response||response.basis!==basis||String(note.responses.length)!==data.responseVersion)fail('Яг одоогийн хариу ба багц шаардлагатай.');note.cleared={at:now(),by:role,basis,reason:input(data,'reason'),responseVersion:note.responses.length};
      } else if (data.action==='approve') {
        const material=assigned?finalMaterial(m):qualityMaterial(m);
        if (material.gaps.length||now().slice(0,10)>m.engagements[0].reportDate) fail('Багцын шаардлага эсвэл тайлангийн өдөр хангагдаагүй.');
        if (state.notes.some(note=>!note.cleared&&note.responses?.at(-1)?.basis!==basis)) fail('Одоогийн багцад холбосон хариу шаардлагатай.');
        if(managedCompletion(m)&&state.notes.some(n=>!n.cleared))fail('Хариу нь тэмдэглэл хаасан шийдвэр биш; тусдаа хаана уу.');
        if ((assigned?finalQualityRef(m):formalQualityRef(m))&&!state.notes.some(n=>!n.cleared)) return view(role,id);
        const review={basis,policy:state.policy.version,artifact:material.artifact.sha256,by:role,at:now(),reason:input(data,'reason')};
        if(managedCompletion(m)){review.workPerformed=input(data,'workPerformed');review.judgments=input(data,'judgments');review.conclusion=input(data,'conclusion');review.notice=input(data,'notice');}
        for (const note of state.notes.filter(n=>!n.cleared)) note.cleared={at:review.at,by:role,basis};
        review.notesStamp=noteStamp(state);
        state.approvals.push(review);
      } else fail('Чанарын үйлдэл олдсонгүй.',404);
    } else {
      const offer=currentOffer(m);
      if(data.action==='return'){
        if(offer.accepted||offer.returned||data.package!==offer.id||data.digest!==offer.digest||!['partner','reviewer'].includes(data.owner))fail('Одоогийн хүлээн аваагүй багц ба засвар хариуцах баг шаардлагатай.');
        offer.returned={by:role,at:now(),reason:input(data,'reason'),owner:data.owner};
        recordEvent(m,'Хадгалалтын багцыг зөрчилтэй буцаав · '+data.owner);store.save(context,'oversight',{});return view(role,id);
      }
      const record=files.archive.inspectCustody(m,offer.id);
      if (data.action!=='accept'||offer.returned||data.package!==offer.id||data.digest!==offer.digest||record.digest!==offer.digest||!offer.downloadedAt) {
        fail('Яг энэ багцыг татаж бүрэн байдлыг баталгаажуулна уу.');
      }
      if (offer.accepted) return view(role,id);
      offer.accepted={by:role,at:now(),reason:input(data,'reason'),digest:record.digest};
    }
    recordEvent(m,role+' · '+data.action);
    store.save(context,'oversight',{});
    return view(role,id);
  }
  function download(role,id,item) {
    const context=contextFor(role,id), m=context.model, files=filesFor(id);
    if (role==='quality') {
      const material=eligible(policy(m))&&policyCurrent(m,policy(m))?qualityMaterial(m):finalMaterial(m);
      if (item==='report') return {name:'quality-draft.html',bytes:Buffer.from(material.artifact.html)};
      if (!material.evidence.includes(item)&&!(eligible(finalPolicy(m))&&policyCurrent(m,finalPolicy(m))&&finalMaterial(m).evidence.includes(item))) fail('Хяналтын эх файл олдсонгүй.',404);
      const file=files.read(item);
      if (!file) fail('Хяналтын эх файл олдсонгүй.',404);
      return {name:files.get(item).name,bytes:file.bytes};
    }
    const offer=currentOffer(m), record=files.archive.inspectCustody(m,offer.id);
    if (item!==offer.id||record.digest!==offer.digest) fail('Томилсон архив олдсонгүй.',404);
    offer.downloadedAt??=now();
    store.save(context,'oversight',{});
    return {name:'audit-custody-'+offer.id+'.json',bytes:Buffer.from(record.payload)};
  }
  return {view,action,download};
}
