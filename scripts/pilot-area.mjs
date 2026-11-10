import { createHash } from 'node:crypto';
import { validDate } from '../src/lib/feature-workflows.ts';
import { canEdit, changeWork, recordEvent, snapshot, workKey } from '../src/lib/workspace.ts';
import { areaMethods, areaProfiles } from '../src/lib/pilot-area.ts';
import { parseAreaFile, runAreaChecks } from './pilot-area-checks.mjs';
import { approvedPopulation, cents } from './pilot-population.mjs';
import { programmeDecision } from './pilot-registers.mjs';
import { evidenceCurrent } from './pilot-requests.mjs';
import { accounts, input, PilotError } from './pilot-workflow.mjs';

const fail = (message,status=409) => { throw new PilotError(status,message); };
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const now = () => new Date().toISOString();
const latest = (m,form) => m.pilotAreaRuns?.[form]?.at(-1);
const stamp = (m,form,population,params,sources) => {
  const paper=m.work[workKey(m.engagement,form)], decision=programmeDecision(m,form);
  const period=m.bench.periods[m.engagement];
  return digest(['area-v1',form,population.version,population.sha256,params,sources,period.start,period.end,
    decision?.id,decision?.version,paper.owner,paper.reviewer]);
};

function liveEvidence(m, id) {
  return m.evidence.find(e=>e.id===id&&!e.population&&evidenceCurrent(m,e));
}

function current(m, run) {
  const population=approvedPopulation(m);
  return !!population&&(!m.extendedPilot||programmeDecision(m,run.form)?.values.decision==='adopt')&&
    Object.values(run.files).every(source=>liveEvidence(m,source.id)?.version===source.version)&&
    run.stamp===stamp(m,run.form,population,run.params,run.files);
}

function resolved(m, item) {
  const result=item.reviews?.at(-1);
  return !!result&&result.result!=='open'&&liveEvidence(m,result.evidence)?.version===result.evidenceVersion;
}

export function areaGap(m,form) {
  const run=latest(m,form);
  if (run&&(!current(m,run)||!run.approval||run.cases.some(item=>!resolved(m,item)))) {
    return form+' · Салбарын горимын одоогийн өгөгдөл, зөрүүний шийдвэр ба хяналт шаардлагатай.';
  }
}

export function syncAreaPapers(m) {
  for (const form of Object.keys(m.pilotAreaRuns??{})) {
    const paper=m.work[workKey(m.engagement,form)];
    if (!['submitted','reviewed'].includes(paper.status)||!areaGap(m,form)) continue;
    snapshot(paper,m.person,'Салбарын горимын өмнөх хяналтыг хадгалав');
    paper.version++;
    paper.status='changed';
    paper.submittedVersion=undefined;
    paper.completedAt=undefined;
    recordEvent(m,form+' · Горимын эх өгөгдөл өөрчлөгдөв',form);
  }
}

export function areaView(m) {
  return Object.fromEntries(Object.entries(m.pilotAreaRuns??{}).map(([form,versions])=>{
    const run=versions.at(-1);
    return [form,{...run,current:current(m,run),history:versions.slice(0,-1).reverse().map(({version,population,approval,at,source,files})=>
      ({version,population,approval,at,source,files}))}];
  }));
}

function runChecks(m,role,form,data,files,prior) {
  const population=approvedPopulation(m), bridge=population?.bridge.find(line=>line.line===data.line);
  if (!bridge?.accounts.length) fail('Баталсан олонлогийн тайлангийн мөрийг сонгоно уу.');
  const profile=areaProfiles[form], period=m.bench.periods[m.engagement], through=input(data,'through',10);
  const method=areaMethods[profile.method];
  const edition=method?.edition ? input(data,'edition',100) : undefined;
  const sign=profile.method==='bank'?'debit':data.sign;
  if (!validDate(through)||through<period.end||!['debit','credit'].includes(sign)) fail('Хамрах огноо болон дүнгийн тэмдгийг шалгана уу.',400);
  const scope={...period,through,edition,entity:m.bench.clients[m.engagement].registration,currency:population.currency};
  const sources={}, records={};
  const optional=['payrollHistory','payrollVariance'];
  const analytics=profile.method==='payroll'&&optional.some(kind=>data[kind]);
  const kinds=analytics?[...profile.inputs,...optional]:profile.inputs;
  for (const kind of kinds) {
    const file=liveEvidence(m,data[kind]), original=file&&files.read(file.id);
    if (!file||!original||! /\.csv$/i.test(file.name)||original.bytes.length>750_000) fail(kind+' · Хүлээн зөвшөөрсөн UTF-8 CSV шаардлагатай.');
    sources[kind]={id:file.id,name:file.name,version:file.version,sha256:original.sha256};
    records[kind]=original.bytes;
  }
  if (new Set(Object.values(sources).map(source=>source.sha256)).size!==kinds.length) fail('Эх баримт бүр тусдаа өгөгдлийн файл байна.');
  const extraBridges=Object.fromEntries((method?.lines??[]).map(([kind,label])=>{
    const selected=population.bridge.find(b=>b.line===data[kind]);
    if (!selected?.accounts.length) fail(label+' · Дэвтрийн баталсан мөр шаардлагатай.');
    return [kind,selected];
  }));
  if (new Set([bridge.line,...Object.values(extraBridges).map(b=>b.line)]).size!==1+Object.keys(extraBridges).length) {
    fail('Дэвтрийн зураглалын мөрүүд тусдаа байна.');
  }
  const params={line:bridge.line,through,sign,...(edition&&{edition}),
    ...(method?.lines&&{lines:Object.fromEntries(Object.entries(extraBridges).map(([kind,b])=>[kind,b.line]))})};
  const identity=stamp(m,form,population,params,sources);
  if (identity===prior?.stamp) return false;
  if (prior&&current(m,prior)&&digest(prior.files)===digest(sources)&&(!prior.approval||prior.cases.some(item=>!resolved(m,item)))) {
    fail('Ижил эхийн өмнөх зөрүүг хянасны дараа шалгуурыг өөрчилнө.');
  }
  function postings(line,polarity) {
    const accounts=new Set(line.accounts);
    return population.rows.filter(row=>row.state==='accepted'&&accounts.has(row.account)).map(row=>({...row,
      source:'ledger',amount:row.cents*polarity}));
  }
  const ledger=postings(bridge,sign==='credit'?-1:1);
  const additional=Object.fromEntries((method?.lines??[]).map(([kind,,polarity])=>[kind,postings(extraBridges[kind],polarity==='debit'?1:-1)]));
  const inputs=Object.fromEntries(kinds.map(kind=>[kind,parseAreaFile(kind,records[kind])]));
  const output=runAreaChecks(profile.method,scope,inputs,ledger,additional);
  (((m.pilotAreaRuns??={})[form])??=[]).push({version:(prior?.version??0)+1,form,population:population.version,
    source:population.evidence,line:bridge.line,through,currency:scope.currency,files:sources,params,stamp:identity,
    by:role,at:now(),...output});
  return true;
}

export function areaAction(m,role,action,data,files,forms) {
  const form=input(data,'form',32), paper=m.work[workKey(m.engagement,form)];
  if (!Object.hasOwn(areaProfiles,form)||!forms.includes(form)) fail('Энэ горимд баталсан хөтөлбөр шаардлагатай.');
  const prior=latest(m,form), owner=canEdit(m,paper)&&paper.status!=='submitted';
  if (action==='area-run') {
    if (!owner) fail('Хөтөлбөрийн бэлтгэгч шаардлагатай.',403);
    if (!runChecks(m,role,form,data,files,prior)) return false;
  } else {
    if (!prior||String(prior.version)!==data.version||!current(m,prior)) fail('Одоогийн ажиллуулалтыг сонгоно уу.');
    if (action==='area-review') {
      if (paper.reviewer!==accounts[role]||paper.owner===accounts[role]) fail('Хараат бус томилсон хянагч шаардлагатай.',403);
      if (prior.cases.some(item=>!resolved(m,item))) fail('Бүх тохиолдлын үндэслэл ба нотлох баримтыг шалгана уу.');
      if (prior.approval) return false;
      prior.approval={by:role,at:now(),conclusion:input(data,'conclusion'),reviewStamp:digest(prior.cases.map(c=>c.reviews?.at(-1)))};
      (prior.approvals??=[]).push(prior.approval);
    } else if (action==='area-dispose') {
      if (!owner) fail('Хөтөлбөрийн бэлтгэгч шаардлагатай.',403);
      const item=prior.cases.find(c=>c.id===data.case), evidence=liveEvidence(m,data.evidence), result=data.result;
      const amount=cents(input(data,'amount',24)), note=input(data,'note');
      if (!item||!evidence||!['explained','finding','open'].includes(result)||amount===null||amount<0||result!=='finding'&&amount!==0) {
        fail('Тохиолдол, үр дүн ба нотлох баримтыг шалгана уу.');
      }
      const id='AREA-'+digest([m.engagement,form,prior.version,item.id]).slice(0,32);
      const finding=m.findings.find(f=>f.id===id);
      if (finding&&(finding.resolution||finding.status!=='identified'||result!=='finding')) fail('Илрүүлэлтийн өмнөх шийдвэрийг хадгална.');
      const previous=item.reviews?.at(-1);
      if (previous?.result===result&&previous.evidence===evidence.id&&previous.amount===amount&&previous.note===note) return false;
      const disposition={result,note,evidence:evidence.id,evidenceVersion:evidence.version,by:role,at:now(),amount,
        ...(result==='finding'&&{finding:id})};
      (item.reviews??=[]).push(disposition);
      delete prior.approval;
      const workKey='pilot.area.'+prior.version+'.'+digest(item.id).slice(0,24);
      changeWork(m,paper.id,{...paper.values,[workKey]:JSON.stringify(disposition)},[...new Set([...paper.evidence,evidence.id])]);
      if (result==='finding') {
        const next={id,engagement:m.engagement,form,title:item.label+' · '+note,amount:amount/100,status:'identified',
          evidence:evidence.id,qualitative:'Горимын хяналтаар баталгаажуулсан илрүүлэлт'};
        if (finding) Object.assign(finding,next); else m.findings.push(next);
      }
    } else fail('Салбарын горимын үйлдэл олдсонгүй.',404);
  }
  recordEvent(m,form+' · '+action,form);
  return true;
}

export const areaWorkpaperRef = (m,form) => {
  const run=latest(m,form);
  return run?.approval&&JSON.stringify({version:run.version,stamp:run.stamp,review:run.approval.reviewStamp});
};

export const areaEvidence = (m,forms) => forms.flatMap(form=>{
  const run=latest(m,form);
  return run?Object.values(run.files).map(source=>source.id):[];
});
