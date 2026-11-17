import { createHash } from 'node:crypto';
import { canEdit, changeWork, recordEvent, snapshot, workKey } from '../src/lib/workspace.ts';
import { approvedPopulation, cents } from './pilot-population.mjs';
import { programmeDecision } from './pilot-registers.mjs';
import { evidenceCurrent } from './pilot-requests.mjs';
import { accounts, input, PilotError } from './pilot-workflow.mjs';

const fail = (message,status=409) => { throw new PilotError(status,message); };
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const now = () => new Date().toISOString();
const method='journal-posting-filters-v1';
const latest = (m,form) => m.pilotJournals?.[form]?.at(-1);

function basis(m,form,threshold,days,parameters) {
  const population=approvedPopulation(m), decision=programmeDecision(m,form), paper=m.work[workKey(m.engagement,form)];
  if (!population || m.extendedPilot && decision?.values.decision!=='adopt') return undefined;
  const end=m.bench.periods[m.engagement].end;
  if(parameters&&!m.evidence.some(e=>e.id===parameters.coverageEvidence&&e.version===parameters.coverageVersion&&evidenceCurrent(m,e)))return;
  const stamp=digest([parameters?'journal-whole-multiset-v2':method,population.version,population.sha256,end,threshold,days,form,decision?.id,decision?.version,paper.owner,paper.reviewer,...(parameters?[parameters]:[])]);
  return {population,end,stamp};
}

const current = (m,run) => !!run && basis(m,run.form,run.threshold,run.days,run.parameters)?.stamp===run.stamp;
const resolved = (m,entry) => {
  const review=entry.investigations.at(-1);
  return !!review&&review.result!=='incomplete'&&
    m.evidence.some(e=>e.id===review.evidence&&e.version===review.evidenceVersion&&evidenceCurrent(m,e));
};
export const journalView = m => Object.fromEntries(Object.keys(m.pilotJournals??{}).map(form=>{
  const run=latest(m,form);
  const history=m.pilotJournals[form].slice(0,-1).reverse().map(({cases,...r})=>({...r,count:cases.length}));
  return [form,{...run,current:current(m,run),history}];
}));
export function journalGap(m,form) {
  const run=latest(m,form);
  if (run && (!current(m,run)||!run.approval||run.cases.some(entry=>!resolved(m,entry)))) {
    return form+' · Журналын сонголт, шийдвэрлээгүй тохиолдол эсвэл хяналт';
  }
}

export function syncJournalPapers(m) {
  for (const form of Object.keys(m.pilotJournals??{})) {
    const paper=m.work[workKey(m.engagement,form)];
    if (!['submitted','reviewed'].includes(paper.status)||!journalGap(m,form)) continue;
    snapshot(paper,m.person,'Журналын өмнөх хяналтыг хадгалав');
    paper.version++;
    paper.status='changed';
    paper.submittedVersion=undefined;
    paper.completedAt=undefined;
    recordEvent(m,form+' · Журналын шалгалтын суурь өөрчлөгдөв',form);
  }
}

export function selectJournals(population,end,threshold,days,parameters) {
  const groups=new Map(), close=Date.parse(end);
  const rows=population.rows.filter(row=>row.state==='accepted');
  if (rows.some(row=>!row.journal||!['manual','system'].includes(row.entryType))) {
    fail('Баталсан мөр бүр journal ба entry_type (manual/system) баганатай байна.');
  }
  for (const row of rows) {
    const entry=groups.get(row.journal)??{id:row.journal,criteria:new Set(),postings:[],investigations:[]};
    if (row.entryType==='manual') entry.criteria.add('manual');
    if (Math.abs(row.cents)>=threshold) entry.criteria.add('amount');
    if (close-Date.parse(row.date)<=days*86_400_000) entry.criteria.add('cutoff');
    if(parameters?.roundUnit&&row.cents!==0&&row.cents%parameters.roundUnit===0)entry.criteria.add('round-unit');
    entry.postings.push({id:row.id,row:row.row,account:row.account,date:row.date,cents:row.cents,...(parameters&&{entity:row.entity,currency:row.currency,entryType:row.entryType,reference:row.reference})});
    groups.set(row.journal,entry);
  }
  if(parameters){
    const fingerprints=new Map();
    for(const entry of groups.values()){
      const fingerprint=digest(entry.postings.map(r=>[r.account,r.date,r.cents,r.entity??null,r.currency??null,r.entryType??null,r.reference??null]).map(r=>JSON.stringify(r)).sort());
      const group=fingerprints.get(fingerprint)??[];group.push(entry);fingerprints.set(fingerprint,group);entry.fingerprint=fingerprint;
    }
    for(const entries of fingerprints.values())if(entries.length>1)for(const entry of entries){entry.criteria.add('duplicate-multiset');entry.duplicates=entries.filter(e=>e.id!==entry.id).map(e=>e.id);}
  }
  const selected=[...groups.values()].filter(e=>e.criteria.size);
  const selectedIds=new Set(selected.map(e=>e.id)), acceptedById=new Map(rows.map(row=>[row.id,row]));
  if (population.rows.some(row=>{
    if (row.state==='accepted'||!selectedIds.has(row.journal)) return false;
    if(parameters)return true;
    const kept=acceptedById.get(row.id);
    return !kept||['journal','account','date','entity','currency','cents','entryType'].some(key=>row[key]!==kept[key]);
  })) fail('Сонгосон журналд хассан эсвэл дутуу бичилт байна. Бүрэн эхийг тулгана уу.');
  return selected.map(e=>({...e,criteria:[...e.criteria].sort(),...(parameters&&{grossDebit:e.postings.filter(r=>r.cents>0).reduce((n,r)=>n+r.cents,0),grossCredit:e.postings.filter(r=>r.cents<0).reduce((n,r)=>n-r.cents,0),net:e.postings.reduce((n,r)=>n+r.cents,0)})}));
}

export function journalAction(m,role,action,data,forms) {
  const form=input(data,'form',32);
  if (!forms.includes(form)) fail('Хэрэгжүүлсэн хөтөлбөр сонгоно уу.');
  const paper=m.work[workKey(m.engagement,form)], prior=latest(m,form);
  const owner=canEdit(m,paper)&&paper.status!=='submitted';
  if (action==='journal-run') {
    if (!owner) fail('Хөтөлбөрийн бэлтгэгч шаардлагатай.',403);
    const threshold=cents(input(data,'threshold',24)), cut=input(data,'days',2), days=Number(cut);
    if (threshold===null||threshold<=0||!/^\d+$/.test(cut)||days>31) fail('Эерэг дүн ба 0–31 хоног оруулна уу.',400);
    let parameters;
    if(data.method==='journal-whole-multiset-v2'){
      const evidence=m.evidence.find(e=>e.id===data.coverageEvidence&&!e.population&&evidenceCurrent(m,e)),roundUnit=data.roundUnit?cents(data.roundUnit):undefined;
      if(!evidence||roundUnit!==undefined&&(roundUnit===null||roundUnit<=0))fail('Нийт журнал, энгийн бус бичилтийн бодит хамрах хүрээ ба эерэг дугуй нэгж шаардлагатай.');
      parameters={coverage:input(data,'coverage'),coverageEvidence:evidence.id,coverageVersion:evidence.version,...(roundUnit&&{roundUnit})};
    }else if(data.method&&data.method!==method)fail('Дэмжигдээгүй журналын арга.');
    const scope=basis(m,form,threshold,days,parameters);
    if (!scope) fail('Баталсан журналын эх олонлог шаардлагатай.');
    if (prior?.stamp===scope.stamp) return false;
    if (prior?.population===scope.population.version && current(m,prior) && (!prior.approval||prior.cases.some(entry=>!resolved(m,entry)))) {
      fail('Өмнөх ажиллуулалтын тохиолдлыг хянасны дараа шалгуурыг өөрчилнө.');
    }
    const {population,end,stamp}=scope;
    const cases=selectJournals(population,end,threshold,days,parameters);
    (((m.pilotJournals??={})[form])??=[]).push({form,version:(prior?.version??0)+1,population:population.version,
      source:population.evidence,sha256:population.sha256,threshold,days,method:parameters?'journal-whole-multiset-v2':method,parameters,stamp,cases,by:role,at:now()});
  } else {
    if (!prior || data.version!==String(prior.version)||!current(m,prior)) fail('Журналын одоогийн ажиллуулалтыг сонгоно уу.');
    if (action==='journal-review') {
      if (paper.reviewer!==accounts[role]||paper.owner===accounts[role]) fail('Хараат бус хянагч шаардлагатай.',403);
      if (prior.cases.some(entry=>!resolved(m,entry))) fail('Шийдвэрлээгүй журналын тохиолдлыг үнэлнэ үү.');
      if (prior.approval) return false;
      prior.approval={by:role,at:now(),reason:input(data,'reason'),
        investigationStamp:digest(prior.cases.map(entry=>entry.investigations.at(-1)))};
      (prior.approvals??=[]).push(prior.approval);
    } else if (action==='journal-investigate') {
      if (!owner) fail('Хөтөлбөрийн бэлтгэгч шаардлагатай.',403);
      const entry=prior.cases.find(e=>e.id===data.entry), evidence=m.evidence.find(e=>e.id===data.evidence&&!e.population&&evidenceCurrent(m,e));
      const result=data.result, amount=cents(input(data,'amount',24));
      if (!entry||!evidence||!['explained','finding','incomplete'].includes(result)||amount===null||amount<0||
          result!=='finding'&&amount!==0) fail('Тохиолдол, нотлох баримт ба үр дүнг шалгана уу.');
      const purpose=input(data,'purpose'), authority=input(data,'authority'), accounting=input(data,'accounting');
      const findingId='JOURNAL-'+digest([m.engagement,form,prior.version,entry.id]).slice(0,32);
      const finding=m.findings.find(f=>f.id===findingId);
      if (finding&&(finding.resolution||finding.status!=='identified'||result!=='finding')) fail('Илрүүлэлтийг тусдаа шийдвэрлэнэ үү.');
      const review={result,purpose,authority,accounting,evidence:evidence.id,evidenceVersion:evidence.version,cents:amount,
        by:role,at:now(),...(result==='finding'&&{finding:findingId})};
      delete prior.approval;
      entry.investigations.push(review);
      const key='pilot.journal.'+prior.version+'.'+digest(entry.id).slice(0,24);
      changeWork(m,paper.id,{...paper.values,[key]:JSON.stringify(review)},[...new Set([...paper.evidence,evidence.id])]);
      if (result==='finding') {
        const next={id:findingId,engagement:m.engagement,form,title:entry.id+' · '+accounting,amount:amount/100,
          status:'identified',evidence:evidence.id,qualitative:'Журналын бичилтийн илрүүлэлт'};
        if (finding) Object.assign(finding,next); else m.findings.push(next);
      }
    } else fail('Журналын үйлдэл олдсонгүй.',404);
  }
  recordEvent(m,form+' · '+action,form);
  return true;
}
