import { createHash, randomUUID } from 'node:crypto';
import { validDate } from '../src/lib/feature-workflows.ts';
import { isCurrentReview, recordEvent, snapshot, workKey } from '../src/lib/workspace.ts';
import { approvedPopulation, cents } from './pilot-population.mjs';
import { evidenceCurrent } from './pilot-requests.mjs';
import { input, PilotError, validMateriality } from './pilot-workflow.mjs';

const fail=(message,status=409)=>{throw new PilotError(status,message);};
const now=()=>new Date().toISOString();
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const latestCorrection=(m,id)=>m.pilotCorrections?.[id]?.at(-1);
const evaluation=m=>m.pilotEvaluations?.at(-1);
const management=m=>m.pilotManagement?.at(-1);
const activeEvaluation=m=>!!(m.pilotFindingFacts||m.pilotCorrections||m.pilotEvaluations);
const actualAmount=finding=>Math.round(Math.abs(finding.amount)*100);
const findingFact=(m,id)=>m.pilotFindingFacts?.[id]?.at(-1);
const consultations=m=>Object.values(m.pilotConsultations??{}).map(versions=>versions.at(-1));

function acceptedFile(m,files,id) {
  const evidence=m.evidence.find(e=>e.id===id&&evidenceCurrent(m,e));
  const original=evidence&&files.get(evidence.id);
  if (!original) fail('Хүлээн зөвшөөрсөн эх файл шаардлагатай.');
  return {id:evidence.id,name:evidence.name,version:evidence.version,sha256:original.sha256};
}

function liveFile(m,file) {
  return !!file&&m.evidence.some(e=>e.id===file.id&&e.version===file.version&&evidenceCurrent(m,e));
}

function consultationBasisCurrent(m,row) {
  const paper=m.work[workKey(m.engagement,row.form)];
  return isCurrentReview(paper)&&paper.version===row.paper&&(!row.advice||liveFile(m,row.advice));
}

const consultationCurrent=(m,row)=>row.decision?.result==='resolved'&&consultationBasisCurrent(m,row);

function effectivePosting(m,revision) {
  const post=revision?.postings?.at(-1), current=approvedPopulation(m);
  return post&&current?.version===post.population&&liveFile(m,revision.response?.file)?post:undefined;
}

function correctionAmount(m,finding) {
  const revision=latestCorrection(m,finding.id);
  const verified=effectivePosting(m,revision)?.amount??(!revision&&finding.status==='posted_verified'?actualAmount(finding):0);
  return Math.max(0,actualAmount(finding)-verified);
}

function syncCorrectionStatus(m) {
  for (const finding of m.findings) {
    const revision=latestCorrection(m,finding.id);
    if (!revision) continue;
    const posting=effectivePosting(m,revision);
    finding.status=posting&&posting.amount===actualAmount(finding)?'posted_verified':
      revision.response&&revision.response.amount>0?'agreed':'identified';
  }
}

function evaluationInputs(m) {
  const mat=m.work[workKey(m.engagement,'1.3')], limits=mat&&validMateriality(m), engagement=m.engagements[0];
  if (!isCurrentReview(mat)||!limits||!engagement?.statements) return undefined;
  const rows=m.findings.map(f=>{
    const revision=latestCorrection(m,f.id), posting=effectivePosting(m,revision), fact=findingFact(m,f.id);
    return {id:f.id,form:f.form,title:f.title,original:actualAmount(f),outstanding:correctionAmount(m,f),
      qualitative:f.qualitative,resolution:f.resolution??'',classification:fact?.classification,origin:fact?.version,
      version:revision?.version,management:revision?.response?.result,
      accepted:revision?.response?.amount??0,posting:posting&&[posting.population,posting.amount,posting.by,posting.at]};
  });
  const gross=rows.reduce((sum,r)=>sum+r.outstanding,0);
  return {statement:engagement.fsVersion,materiality:mat.version,limits,gross,rows};
}

export function currentEvaluation(m) {
  const row=evaluation(m), inputs=row?.approval&&evaluationInputs(m);
  return row?.approval&&inputs&&row.stamp===digest(inputs)?row:undefined;
}

export function currentManagement(m) {
  const row=management(m), e=m.engagements[0];
  return row?.approval&&e?.statements&&row.statement===e.fsVersion&&row.date<=e.reportDate&&
    [row.file,row.notes,row.authorization].every(file=>liveFile(m,file))?row:undefined;
}

export function consultationView(m) {
  return consultations(m).map(row=>({...row,current:consultationCurrent(m,row),
    basisCurrent:consultationBasisCurrent(m,row),history:m.pilotConsultations[row.id].slice(0,-1).reverse()}));
}

export function completionView(m,includeConsultations=true) {
  const row=evaluation(m), attachment=management(m);
  return {
    enabled:activeEvaluation(m),inputs:activeEvaluation(m)?evaluationInputs(m):undefined,
    findings:m.findings.map(f=>({...f,outstanding:correctionAmount(m,f),correction:latestCorrection(m,f.id),
      postingCurrent:!!effectivePosting(m,latestCorrection(m,f.id)),fact:findingFact(m,f.id),history:(m.pilotCorrections?.[f.id]??[]).slice(0,-1).reverse()})),
    evaluation:row&&{...row,current:!!currentEvaluation(m)},
    evaluationHistory:(m.pilotEvaluations??[]).slice(0,-1).reverse(),
    management:attachment&&{...attachment,current:!!currentManagement(m)},
    managementHistory:(m.pilotManagement??[]).slice(0,-1).reverse(),
    consultations:includeConsultations?consultationView(m):[],
  };
}

export function completionGaps(m) {
  const gaps=[];
  if (activeEvaluation(m)&&!currentEvaluation(m)) gaps.push('4.4 · Материаллаг байдал ба залруулаагүй нөлөөний одоогийн хяналт');
  if (m.pilotManagement&&!currentManagement(m)) gaps.push('4.4 · СТ, тодруулга, удирдлагын баталсан яг хувилбар шаардлагатай');
  if (m.pilotCorrections&&Object.values(m.pilotCorrections).some(rows=>!rows.at(-1).response||!liveFile(m,rows.at(-1).response.file))) {
    gaps.push('Залруулгын саналд удирдлагын баримтжуулсан хариу шаардлагатай');
  }
  if (m.pilotFindingFacts&&Object.values(m.pilotFindingFacts).some(versions=>{
    const fact=versions.at(-1), paper=m.work[workKey(m.engagement,fact.form)];
    return !isCurrentReview(paper)||paper.version!==fact.paper||!liveFile(m,fact.evidence);
  })) gaps.push('Илрүүлэлтийн эх ажлын шинэ хувилбар ба нотолгоог дахин үнэлнэ үү');
  if (consultations(m).some(row=>!consultationCurrent(m,row))) gaps.push('4.4 · Зөвлөлдөх асуудлыг одоогийн эх баримтаар шийдвэрлэнэ үү');
  return gaps;
}

export function completionRef(m) {
  const reference=[currentEvaluation(m)?.stamp,currentManagement(m)?.stamp].map(x=>x??'');
  const reviews=consultations(m);
  if (reviews.length) reference.push(digest(reviews.map(row=>[row.id,row.version,row.decision,consultationCurrent(m,row)])));
  return reference.join(':');
}

export function syncCompletion(m) {
  syncCorrectionStatus(m);
  const w=m.work[workKey(m.engagement,'4.4')];
  if (!w||!['reviewed','submitted'].includes(w.status)||!(activeEvaluation(m)||m.pilotManagement||m.pilotConsultations)||
      w.values['pilot.completion']===completionRef(m)&&!completionGaps(m).length) return;
  snapshot(w,m.person,'Дуусгалтын өмнөх хяналтыг хадгалав');
  w.version++;
  w.status='changed';
  w.submittedVersion=undefined;
  w.completedAt=undefined;
  recordEvent(m,'Дуусгалтын суурь өөрчлөгдөв','4.4');
}

export function completionEvidence(m) {
  const files=[];
  for (const versions of Object.values(m.pilotCorrections??{})) for (const row of versions) {
    files.push(row.support.id,...(row.response?[row.response.file.id]:[]),...row.postings.map(p=>p.source));
  }
  for (const row of m.pilotManagement??[]) files.push(row.file.id,row.notes.id,row.authorization.id);
  for (const versions of Object.values(m.pilotFindingFacts??{})) for (const row of versions) files.push(row.evidence.id);
  for (const versions of Object.values(m.pilotConsultations??{})) for (const row of versions) if (row.advice) files.push(row.advice.id);
  return files;
}

function consultationAction(m,role,action,data,files) {
  const versions=typeof data.id==='string'&&Object.hasOwn(m.pilotConsultations??{},data.id)?m.pilotConsultations[data.id]:undefined;
  const prior=versions?.at(-1);
  if (data.id&&!prior) fail('Зөвлөлдөх асуудал олдсонгүй.',404);
  if (action==='completion-consultation-record') {
    if (role!=='reviewer') fail('Ахлах хянагч зөвлөлдөх асуудлыг бүртгэнэ.',403);
    const form=prior?.form??input(data,'form',32), paper=m.work[workKey(m.engagement,form)];
    if (!isCurrentReview(paper)||![2,3].includes(paper.stage)) fail('Төлөвлөлт эсвэл гүйцэтгэлийн одоогийн хянасан ажлыг сонгоно уу.');
    const {restriction}=data;
    if (!['open','prohibited','clear'].includes(restriction)) fail('Мэргэжлийн нөхцөлийн төлөвийг сонгоно уу.',400);
    const advice=data.advice?acceptedFile(m,files,data.advice):undefined;
    if (restriction==='clear'&&!advice) fail('Хүлээн авсан зөвлөгөө эсвэл шийдлийн эх нотолгоо шаардлагатай.');
    const prohibition=versions?.findLast(row=>row.restriction==='prohibited');
    if (restriction==='clear'&&prohibition?.advice&&prohibition.advice.id===advice?.id) fail('Хоригийг шийдсэн шинэ эх нотолгоо шаардлагатай.');
    const title=input(data,'title',200), scope=input(data,'scope'), id=prior?.id??randomUUID();
    const row={id,version:(prior?.version??0)+1,form,paper:paper.version,title,scope,restriction,advice,by:role,at:now()};
    (((m.pilotConsultations??={})[id])??=[]).push(row);
  } else {
    if (role!=='partner') fail('Партнер зөвлөлдөх асуудлыг хараат бусаар хянана.',403);
    if (!prior||String(prior.version)!==data.version||!consultationBasisCurrent(m,prior)) fail('Одоогийн зөвлөлдөх баримт ба эх ажлыг дахин холбоно уу.');
    if (prior.decision) fail('Хяналтын түүхийг хадгалж, шинэ хувилбарыг илгээнэ үү.');
    const {result}=data;
    if (!['returned','resolved'].includes(result)) fail('Хяналтын шийдвэрийг сонгоно уу.',400);
    if (result==='resolved'&&(prior.restriction!=='clear'||!prior.advice)) fail('Шийдэгдээгүй зөрүү эсвэл хоригтой асуудлыг хаах боломжгүй.');
    prior.decision={result,by:role,at:now(),reason:input(data,'reason')};
  }
  recordEvent(m,action,'4.4');
  return true;
}

function correctionAction(m,role,action,data,files) {
  const finding=m.findings.find(f=>f.id===data.id);
  if (!finding) fail('Илрүүлэлт олдсонгүй.',404);
  const prior=latestCorrection(m,finding.id), paper=m.work[workKey(m.engagement,finding.form)];
  if (!isCurrentReview(paper)) fail('Илрүүлэлтийн эх ажлын одоогийн хяналт шаардлагатай.');
  if (action==='correction-propose') {
    if (role!=='reviewer') fail('Залруулгын санал бэлтгэх ахлах хянагч шаардлагатай.',403);
    if (prior?.response?.amount>0&&correctionAmount(m,finding)===0) fail('Баталгаажсан засварыг шинэ саналаар солихгүй.');
    const amount=cents(input(data,'amount',24)), reference=input(data,'reference',150), account=input(data,'account',150), sign=data.sign;
    if (amount===null||amount<=0||amount>actualAmount(finding)||!['debit','credit'].includes(sign)) fail('Хүчинтэй засварын дүн ба тэмдэг сонгоно уу.',400);
    if (Object.entries(m.pilotCorrections??{}).some(([id,versions])=>id!==finding.id&&versions.some(v=>v.account===account&&v.reference===reference))) {
      fail('Бичилтийн лавлагааг өөр илрүүлэлтэд давхар тооцохгүй.');
    }
    const support=acceptedFile(m,files,data.evidence), reason=input(data,'reason');
    if (prior&&!prior.response&&prior.amount===amount&&prior.reference===reference&&prior.account===account&&prior.sign===sign&&
        prior.support.id===support.id&&prior.reason===reason) return false;
    (((m.pilotCorrections??={})[finding.id])??=[]).push({version:(prior?.version??0)+1,amount,reference,account,sign,support,reason,by:role,at:now(),postings:[]});
  } else {
    if (!prior||String(prior.version)!==data.version||!liveFile(m,prior.support)) fail('Одоогийн залруулгын санал шаардлагатай.');
    if (action==='correction-response') {
      if (role==='preparer') fail('Удирдлагын хариуг бүртгэх эрх шаардлагатай.',403);
      if (prior.response) fail('Удирдлагын хариу бүртгэгдсэн. Шинэ санал үүсгэнэ үү.');
      const amount=cents(input(data,'amount',24)), result=data.result;
      if (!(result==='accepted'&&amount===prior.amount||result==='partial'&&amount>0&&amount<prior.amount||result==='declined'&&amount===0)) {
        fail('Хариуны төлөв ба зөвшөөрсөн дүнг шалгана уу.',400);
      }
      const file=acceptedFile(m,files,data.evidence), reason=input(data,'reason');
      prior.response={amount,result,file,reason,by:role,at:now()};
    } else if (action==='correction-verify') {
      if (role!=='partner'||prior.by===role) fail('Бичилтийн хараат бус баталгаажуулалт шаардлагатай.',403);
      const population=approvedPopulation(m);
      if (!population||!prior.response?.amount||!liveFile(m,prior.response.file)) fail('Баталсан эх олонлог ба удирдлагын зөвшөөрөл шаардлагатай.');
      const rows=population.rows.filter(r=>r.state==='accepted'&&r.account===prior.account&&r.reference===prior.reference);
      if (!rows.length) fail('Одоогийн баталсан эх олонлогт таарах бичилт олдсонгүй.');
      const amount=rows.reduce((sum,r)=>sum+r.cents,0)*(prior.sign==='credit'?-1:1);
      if (amount<0||amount>prior.response.amount) fail('Бичилтийн тэмдэг эсвэл баталсан дүн зөрсөн.');
      const reason=input(data,'reason');
      if (prior.postings.at(-1)?.population===population.version&&prior.postings.at(-1)?.amount===amount) return false;
      prior.postings.push({amount,population:population.version,source:population.evidence,sha256:population.sha256,
        rows:rows.map(r=>({id:r.id,row:r.row,cents:r.cents})),by:role,at:now(),reason});
    } else fail('Залруулгын үйлдэл олдсонгүй.',404);
  }
  syncCorrectionStatus(m);
  recordEvent(m,finding.id+' · '+action,finding.form);
  return true;
}

export function completionAction(m,role,action,data,files) {
  if (action.startsWith('correction-')) return correctionAction(m,role,action,data,files);
  if (['completion-consultation-record','completion-consultation-review'].includes(action)) return consultationAction(m,role,action,data,files);
  if (action==='completion-finding-record') {
    if (role!=='reviewer') fail('Илрүүлэлт бүртгэх ахлах хянагч шаардлагатай.',403);
    const existing=data.id&&m.findings.find(f=>f.id===data.id&&f.id.startsWith('MANUAL-'));
    if (data.id&&!existing) fail('Илрүүлэлт олдсонгүй.',404);
    const form=existing?.form??input(data,'form',32), paper=m.work[workKey(m.engagement,form)];
    if (!isCurrentReview(paper)||paper.stage!==3) fail('Хянасан гүйцэтгэлийн ажлыг сонгоно уу.');
    const classification=data.classification, amount=cents(input(data,'amount',24)), title=input(data,'title',200);
    const reference=input(data,'reference',150), evidence=acceptedFile(m,files,data.evidence);
    if (!['factual','projected','qualitative'].includes(classification)||amount===null||amount<0||classification==='qualitative'&&amount!==0) {
      fail('Илрүүлэлтийн ангилал ба дүнг шалгана уу.',400);
    }
    if (m.findings.some(f=>f.id!==existing?.id&&findingFact(m,f.id)?.reference===reference)) fail('Энэ асуудлын лавлагаа бүртгэгдсэн.');
    const prior=existing&&findingFact(m,existing.id);
    if (existing&&latestCorrection(m,existing.id)&&(amount!==actualAmount(existing)||classification!==prior.classification)) {
      fail('Залруулгатай илрүүлэлтийн өмнөх дүн, ангиллыг хадгална.');
    }
    const id=existing?.id??'MANUAL-'+randomUUID(), criterion=input(data,'criterion'), effect=input(data,'effect');
    (((m.pilotFindingFacts??={})[id])??=[]).push({version:(prior?.version??0)+1,form,paper:paper.version,
      reference,classification,evidence,criterion,effect,by:role,at:now()});
    const next={id,form,engagement:m.engagement,title,amount:amount/100,evidence:evidence.id,qualitative:effect,status:'identified'};
    if (existing) { Object.assign(existing,next); delete existing.resolution; }
    else m.findings.push(next);
  } else if (action==='completion-evaluate') {
    if (role!=='reviewer') fail('Үнэлгээ бэлтгэх ахлах хянагч шаардлагатай.',403);
    const inputs=evaluationInputs(m), note=input(data,'note');
    if (!inputs) fail('Хянасан 1.3 ба одоогийн тайлан шаардлагатай.');
    const prior=evaluation(m), stamp=digest(inputs);
    if (prior?.stamp===stamp&&prior.note===note) return false;
    (m.pilotEvaluations??=[]).push({version:(prior?.version??0)+1,inputs,stamp,note,by:role,at:now()});
  } else if (action==='completion-evaluation-approve') {
    if (role!=='partner') fail('Хараат бус партнерын үнэлгээ шаардлагатай.',403);
    const row=evaluation(m), inputs=evaluationInputs(m);
    if (!row||String(row.version)!==data.version||!inputs||row.stamp!==digest(inputs)) fail('Одоогийн материаллаг байдал ба засваруудыг дахин үнэлнэ үү.');
    if (row.approval) return false;
    row.approval={by:role,at:now(),reason:input(data,'reason')};
  } else if (action==='completion-management-submit') {
    if (role!=='reviewer') fail('Эх баримт бэлтгэх ахлах хянагч шаардлагатай.',403);
    const e=m.engagements[0], prior=management(m), date=input(data,'date',10);
    if (!e.statements||!validDate(date)||date<m.bench.periods[m.engagement].end||date>e.reportDate||date>now().slice(0,10)) {
      fail('Удирдлагын бодит баталсан өдөр ба одоогийн тайлан шаардлагатай.');
    }
    const file=acceptedFile(m,files,data.file), notes=acceptedFile(m,files,data.notes), authorization=acceptedFile(m,files,data.authorization);
    const signer=input(data,'signer',150), capacity=input(data,'capacity',150), basis=input(data,'basis');
    const stamp=digest([e.fsVersion,file,notes,authorization,signer,capacity,date,basis]);
    if (prior?.stamp===stamp) return false;
    (m.pilotManagement??=[]).push({version:(prior?.version??0)+1,statement:e.fsVersion,file,notes,authorization,
      signer,capacity,date,basis,stamp,by:role,at:now()});
  } else if (action==='completion-management-approve') {
    if (role!=='partner') fail('Тайлангийн эхийг хараат бус партнер хянана.',403);
    const row=management(m), e=m.engagements[0];
    if (!row||String(row.version)!==data.version||row.statement!==e.fsVersion||row.date>e.reportDate||
        ![row.file,row.notes,row.authorization].every(file=>liveFile(m,file))) fail('Одоогийн тайлангийн баталсан эхийг дахин холбоно уу.');
    if (row.approval) return false;
    row.approval={by:role,at:now(),reason:input(data,'reason')};
  } else fail('Дуусгалтын үйлдэл олдсонгүй.',404);
  recordEvent(m,action,'4.4');
  return true;
}
