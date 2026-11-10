import { randomUUID } from 'node:crypto';
import { recordEvent } from '../src/lib/workspace.ts';
import { input, PilotError, qualityBasis, qualityMaterial } from './pilot-workflow.mjs';

export const oversightRoles=['quality','custodian'];
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const now=()=>new Date().toISOString();
const policy=m=>m.pilotQuality?.policy;
const eligible=decision=>decision?.mode==='required'&&(decision.eligibilityStatus??'eligible')==='eligible';
const approval=m=>m.pilotQuality?.approvals.at(-1);
const offers=m=>m.pilotCustody??[];
const currentOffer=m=>offers(m).at(-1);

export function qualityRef(m) {
  const decision=policy(m);
  if (!decision) return '';
  if (decision.mode==='not-required') return 'not-required:'+decision.version;
  if (!eligible(decision)) return '';
  const review=approval(m);
  return review?.policy===decision.version&&review.basis===qualityBasis(m)&&
    review.at.slice(0,10)<=m.engagements[0].reportDate?review.basis+':'+review.at:'';
}

export function qualityGaps(m) {
  if (!policy(m)) return [];
  if (!qualityRef(m)||m.pilotQuality.notes.some(note=>!note.cleared)) return ['4.6 · Хараат бус чанарын шийдвэр ба яг энэ багцын хяналт шаардлагатай'];
  return [];
}

export function oversightTeamView(m) {
  return {quality:m.pilotQuality&&{...m.pilotQuality,current:eligible(policy(m))&&!!qualityRef(m)},custody:offers(m)};
}

export function oversightTeamAction(m,role,action,data,files) {
  if (role!=='partner'&&!(role==='reviewer'&&action==='quality-response')) fail('Томилсон багийн эрх шаардлагатай.',403);
  if (action==='quality-policy') {
    if (!m.engagements[0]?.intake.active||files.archive.isSealed(m)) fail('Нээлттэй гэрээт ажил шаардлагатай.');
    const mode=data.mode, reference=input(data,'reference'), basis=input(data,'basis');
    if (!['required','not-required','unresolved'].includes(mode)) fail('Чанарын шаардлагын шийдвэр буруу.',400);
    const eligibilityStatus=mode==='required'?(data.eligibilityStatus??'unresolved'):'';
    if (mode==='required'&&!['eligible','ineligible','unresolved'].includes(eligibilityStatus)) fail('Хянагчийн шалгуурын шийдвэр буруу.',400);
    const reviewer=mode==='required'?input(data,'reviewer',150):'';
    const eligibility=mode==='required'?input(data,'eligibility'):'';
    if (eligibilityStatus==='eligible'&&!files.oversightConfigured('quality')) fail('Хараат бус чанарын нэвтрэх эрх шаардлагатай.');
    if (m.pilotQuality?.notes.some(note=>!note.cleared)&&mode!=='required') fail('Нээлттэй хараат бус чанарын тэмдэглэлийг эхлээд шийдвэрлэнэ үү.');
    const state=m.pilotQuality??={policies:[],approvals:[],notes:[]}, prior=state.policy;
    const decision={mode,reference,basis,reviewer,eligibility,eligibilityStatus};
    if (prior&&Object.entries(decision).every(([key,value])=>prior[key]===value)) return;
    const row={...decision,version:(prior?.version??0)+1,by:role,at:now()};
    state.policies.push(row);state.policy=row;
  } else if (action==='quality-response') {
    if (files.archive.isSealed(m)) fail('Архив түгжээтэй.');
    const note=m.pilotQuality?.notes.find(item=>item.id===data.id&&!item.cleared);
    if (!note) fail('Чанарын нээлттэй тэмдэглэл шаардлагатай.');
    (note.responses??=[]).push({text:input(data,'reason'),by:role,at:now(),basis:qualityBasis(m)});
  } else if (action==='archive-offer-custody') {
    if (!files.archive.isSealed(m)||!files.oversightConfigured('custodian')) fail('Түгжээтэй архив ба хараат бус хадгалалтын нэвтрэх эрх шаардлагатай.');
    const id=input(data,'package',36), record=files.archive.inspectCustody(m,id,true);
    if (currentOffer(m)?.id===id) return;
    (m.pilotCustody??=[]).push({id,digest:record.digest,recipient:input(data,'recipient',150),offeredAt:now(),by:role});
  } else fail('Хяналтын үйлдэл олдсонгүй.',404);
  recordEvent(m,action,action.startsWith('quality-')?'4.6':undefined);
}

export function createOversightStore(store,filesFor) {
  function allowed(role,m) {
    return role==='quality'?eligible(policy(m))&&!filesFor(m.engagement).archive.isSealed(m):!!currentOffer(m);
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
      const material=qualityMaterial(m), evidence=material.evidence.map(id=>({id,...files.get(id)})).filter(f=>f.sha256);
      return {role,assignments,selected:id,quality:oversightTeamView(m).quality,material:{...material,evidence}};
    }
    const offer=currentOffer(m), record=files.archive.inspectCustody(m,offer.id);
    return {role,assignments,selected:id,custody:offer,manifest:{fileCount:record.bundle.evidence.length,
      files:record.bundle.evidence.map(({name,sha256,size})=>({name,sha256,size})),report:record.bundle.issue.reportSha256}};
  }
  function action(role,id,data) {
    const context=contextFor(role,id), m=context.model, files=filesFor(id);
    if (role==='quality') {
      const basis=qualityBasis(m), state=m.pilotQuality;
      if (data.basis!==basis) fail('Хянасан багц өөрчлөгдсөн. Одоогийн хувилбарыг нээнэ үү.');
      if (data.action==='return') {
        state.notes.push({id:randomUUID(),text:input(data,'reason'),basis,by:role,at:now()});
      } else if (data.action==='approve') {
        const material=qualityMaterial(m);
        if (material.gaps.length||now().slice(0,10)>m.engagements[0].reportDate) fail('Багцын шаардлага эсвэл тайлангийн өдөр хангагдаагүй.');
        if (state.notes.some(note=>!note.cleared&&note.responses?.at(-1)?.basis!==basis)) fail('Одоогийн багцад холбосон хариу шаардлагатай.');
        if (qualityRef(m)&&!qualityGaps(m).length) return view(role,id);
        const review={basis,policy:state.policy.version,artifact:material.artifact.sha256,by:role,at:now(),reason:input(data,'reason')};
        for (const note of state.notes.filter(n=>!n.cleared)) note.cleared={at:review.at,by:role,basis};
        state.approvals.push(review);
      } else fail('Чанарын үйлдэл олдсонгүй.',404);
    } else {
      const offer=currentOffer(m), record=files.archive.inspectCustody(m,offer.id);
      if (data.action!=='accept'||data.package!==offer.id||data.digest!==offer.digest||record.digest!==offer.digest||!offer.downloadedAt) {
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
      const material=qualityMaterial(m);
      if (item==='report') return {name:'quality-draft.html',bytes:Buffer.from(material.artifact.html)};
      if (!material.evidence.includes(item)) fail('Хяналтын эх файл олдсонгүй.',404);
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
