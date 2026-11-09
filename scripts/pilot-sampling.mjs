import { createHash } from 'node:crypto';
import { canEdit, changeWork, isCurrentReview, recordEvent, selectSample, snapshot, workKey } from '../src/lib/workspace.ts';
import { approvedPopulation, cents } from './pilot-population.mjs';
import { programmeDecision } from './pilot-registers.mjs';
import { accounts, input, PilotError, validMateriality } from './pilot-workflow.mjs';
import { evidenceCurrent } from './pilot-requests.mjs';

const fail = (message,status=409) => { throw new PilotError(status,message); };
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const now = () => new Date().toISOString();
const designs = (m,form) => m.pilotSamples?.[form] ?? [];
const latest = (m,form) => designs(m,form).at(-1);

function inputs(m,form,line) {
  const population=approvedPopulation(m);
  const bridge=population?.bridge.find(r=>r.line===line);
  const paper=m.work[workKey(m.engagement,form)];
  const mat=m.work[workKey(m.engagement,'1.3')], controls=m.work[workKey(m.engagement,'2.6')];
  const amounts=validMateriality(m), level=controls.values.controlsReliance;
  const controlEvidence = [...new Set([controls.values.relianceEvidence,...controls.evidence].filter(Boolean))]
    .flatMap(id=>m.evidence.filter(e=>e.id===id&&evidenceCurrent(m,e)).map(e=>[e.id,e.version]));
  const decision=programmeDecision(m,form);
  if (!bridge || !isCurrentReview(mat) || !amounts || !isCurrentReview(controls) ||
      !['none','partial','full','na'].includes(level) || !controls.values.relianceBasis ||
      ['partial','full'].includes(level)&&!controlEvidence.length ||
      m.extendedPilot&&decision?.values.decision!=='adopt') return undefined;
  const accounts = new Set(bridge.accounts);
  const rows = population.rows.filter(r=>r.state==='accepted'&&accounts.has(r.account));
  const basis={population:population.version,source:population.evidence,sha256:population.sha256,line,
    materiality:mat.version,performance:amounts.performance,controls:controls.version,level,controlEvidence,
    decision:decision&&[decision.id,decision.version],owner:paper.owner,reviewer:paper.reviewer};
  return {rows,basis,stamp:digest(basis)};
}

const currentInputs = (m,form,design) => design && inputs(m,form,design.basis.line);
const currentDesign = (m,form,design) => currentInputs(m,form,design)?.stamp === design.stamp;

export function samplingView(m) {
  return Object.fromEntries(Object.entries(m.pilotSamples??{}).map(([form,entries])=>{
    const design=entries.at(-1);
    return [form,{...design,current:currentDesign(m,form,design),history:entries.slice(0,-1).reverse()}];
  }));
}

export function samplingGap(m,form) {
  const design=latest(m,form);
  if (!design) return undefined;
  if (!currentDesign(m,form,design) || !design.approval || !design.selected) return form+' · Одоогийн түүврийн дизайн, хяналт ба сонголт шаардлагатай.';
  const tested = new Set(design.tests.map(r=>r.unit));
  if (design.selected.some(unit=>!tested.has(unit.id))) return form+' · Сонгосон бүх нэгжийг шалгана уу.';
  const last = new Map(design.tests.map(result=>[result.unit,result]));
  if ([...last.values()].some(result=>!m.evidence.some(e=>e.id===result.evidence&&e.version===result.evidenceVersion&&evidenceCurrent(m,e)))) {
    return form+' · Сонгосон нэгжийн нотлох баримтын үнэлгээ шаардлагатай.';
  }
}

export function syncSamplePapers(m) {
  for (const form of Object.keys(m.pilotSamples??{})) {
    const paper=m.work[workKey(m.engagement,form)];
    if (!['submitted','reviewed'].includes(paper.status) || !samplingGap(m,form)) continue;
    snapshot(paper,m.person,'Түүврийн өмнөх хувилбарыг хадгалав');
    paper.version++;
    paper.status='changed';
    paper.submittedVersion=undefined;
    paper.completedAt=undefined;
    recordEvent(m,form+' · Түүврийн суурь өөрчлөгдөв',form);
  }
}

export function samplingAction(m,role,action,data,forms) {
  const form=input(data,'form',32);
  if (!forms.includes(form)) fail('Хэрэгжүүлсэн хөтөлбөр сонгоно уу.');
  const paper=m.work[workKey(m.engagement,form)], previous=latest(m,form);
  const owner=canEdit(m,paper), reviewer=paper.reviewer===accounts[role]&&paper.owner!==accounts[role]&&role!=='preparer';
  if (action==='sample-design') {
    if (!owner) fail('Хөтөлбөрийн бэлтгэгч шаардлагатай.',403);
    const line=input(data,'line',150), scope=inputs(m,form,line);
    if (!scope) fail('Баталсан эх олонлог, 1.3 ба 2.6 хяналт шаардлагатай.');
    const count=input(data,'size',5), sourceSeed=input(data,'seed',10);
    const size=Number(count), seed=Number(sourceSeed);
    if (!/^\d+$/.test(count) || !/^\d+$/.test(sourceSeed) || size<1 || size>Math.min(scope.rows.length,500) || seed>0xffffffff) {
      fail('Сонголтын тоо, seed ба хамрах хүрээг шалгана уу.',400);
    }
    const purpose=input(data,'purpose',4000);
    if (previous?.stamp===scope.stamp&&previous.size===size&&previous.seed===seed&&previous.purpose===purpose) return;
    (((m.pilotSamples??={})[form])??=[]).push({version:(previous?.version??0)+1,form,size,seed,purpose,
      method:'deterministic-row-selection-v1',basis:scope.basis,stamp:scope.stamp,preparedBy:role,at:now(),tests:[]});
  } else {
    if (!previous || data.version!==String(previous.version) || !currentDesign(m,form,previous)) fail('Түүврийн одоогийн суурийг дахин хянана уу.');
    if (action==='sample-approve') {
      if (!reviewer || previous.preparedBy===role) fail('Хараат бус томилсон хянагч шаардлагатай.',403);
      if (previous.approval) return;
      previous.approval={by:role,at:now(),reason:input(data,'reason')};
    } else if (action==='sample-select') {
      if (!owner && !reviewer) fail('Хөтөлбөрийн томилгоо шаардлагатай.',403);
      if (!previous.approval) fail('Түүврийн дизайныг эхлээд хянана уу.');
      if (previous.selected) return;
      const rows = new Map(currentInputs(m,form,previous).rows.map(r=>[r.id,r]));
      previous.selected=selectSample([...rows.keys()],previous.size,previous.seed).map(id=>{
        const r=rows.get(id);
        return {id,row:r.row,account:r.account,date:r.date,cents:r.cents};
      });
    } else if (action==='sample-test') {
      if (!owner || paper.status==='submitted') fail('Засварлах эрхтэй бэлтгэгч шаардлагатай.',403);
      const unit=previous.selected?.find(r=>r.id===data.unit), evidence=m.evidence.find(e=>e.id===data.evidence&&evidenceCurrent(m,e)&&!e.population);
      if (!unit || !evidence) fail('Сонгосон нэгж ба хүлээн авсан нотолгоо шаардлагатай.');
      const amount=cents(input(data,'amount',24)), result=data.result, detail=input(data,'detail');
      if (!['pass','exception'].includes(result) || amount===null || amount<0 || result==='pass'&&amount!==0) fail('Үр дүн ба зөрүүний дүнг шалгана уу.',400);
      const findingId='SAMPLE-'+digest([m.engagement,form,previous.version,unit.id]).slice(0,32);
      const finding=m.findings.find(f=>f.id===findingId);
      if (finding && (finding.resolution || finding.status!=='identified' || result==='pass')) fail('Бүртгэсэн илрүүлэлтийг тусдаа шийдвэрлэнэ үү.');
      const last=previous.tests.findLast(r=>r.unit===unit.id);
      if (last?.result===result&&last.detail===detail&&last.cents===amount&&last.evidence===evidence.id) return;
      previous.tests.push({unit:unit.id,row:unit.row,result,detail,cents:amount,evidence:evidence.id,
        evidenceVersion:evidence.version,by:role,at:now(),...(result==='exception'&&{finding:findingId})});
      const key='pilot.sample.'+previous.version+'.'+digest(unit.id).slice(0,24);
      changeWork(m,paper.id,{...paper.values,[key]:JSON.stringify(previous.tests.at(-1))},[...new Set([...paper.evidence,evidence.id])]);
      if (result==='exception') {
        const next={id:findingId,engagement:m.engagement,form,title:unit.id+' · '+detail,amount:amount/100,
          status:'identified',evidence:evidence.id,qualitative:'Түүврийн шалгалтын зөрүү',sampleId:unit.id};
        if (finding) Object.assign(finding,next); else m.findings.push(next);
      }
    } else fail('Түүврийн үйлдэл олдсонгүй.',404);
  }
  recordEvent(m,form+' · '+action,form);
  return true;
}
