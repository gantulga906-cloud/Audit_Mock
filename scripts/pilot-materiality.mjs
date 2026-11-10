import { benchmarkMeasures } from '../src/lib/pilot-materiality.ts';
import { isCurrentReview, materiality, recordEvent, snapshot, workKey } from '../src/lib/workspace.ts';
import { evidenceCurrent } from './pilot-requests.mjs';
import { input, PilotError } from './pilot-workflow.mjs';

const basisKey='pilot.materiality.basis';
const fail=message=>{throw new PilotError(400,message);};
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const option=(value,options,message)=>options.includes(value)?value:fail(message);
const amount=(value,name)=>{
  if (!['number','string'].includes(typeof value)||!/^-?\d+(?:\.\d{1,2})?$/.test(String(value))||
      !Number.isSafeInteger(Math.round(Number(value)*100))) fail('Хүчинтэй дүн оруулна уу · '+name);
  return Number(value);
};

export function materialityBasis(values) {
  if (!values[basisKey]) return undefined;
  try {
    const parsed=JSON.parse(values[basisKey]);
    return object(parsed)&&Array.isArray(parsed.specific)?parsed:null;
  } catch {
    return null;
  }
}

export const materialityTargets=m=>Object.values(m.work)
  .filter(paper=>paper.engagement===m.engagement&&paper.stage===3&&paper.form.startsWith('3.'))
  .map(({form,title})=>({form,title}));

export function materialityEvidenceCurrent(m,basis) {
  return !!basis?.evidence&&m.evidence.some(file=>file.id===basis.evidence.id&&file.engagement===m.engagement&&
    file.version===basis.evidence.version&&evidenceCurrent(m,file));
}

export function syncMateriality(m) {
  const paper=m.work[workKey(m.engagement,'1.3')];
  if (!paper||!['submitted','reviewed'].includes(paper.status)) return;
  const basis=materialityBasis(paper.values);
  if (basis===undefined||materialityEvidenceCurrent(m,basis)) return;
  snapshot(paper,m.person,'Материаллаг байдлын өмнөх хяналтыг хадгалав');
  paper.version++;
  paper.status='changed';
  paper.submittedVersion=undefined;
  paper.completedAt=undefined;
  recordEvent(m,'Материаллаг байдлын эх нотолгоо өөрчлөгдөв','1.3');
}

export function materialityValues(m) {
  const paper=m.work[workKey(m.engagement,'1.3')], totals=paper&&materiality(m,m.engagement);
  if (!totals||!Number.isFinite(totals.overall)||totals.performance>=totals.overall||totals.trivial>totals.performance) return null;
  const basis=materialityBasis(paper.values);
  if (basis===undefined) return totals;
  if (!materialityEvidenceCurrent(m,basis)||totals.performance<=0||basis.specific.some(row=>
    !(row.amount<totals.overall&&row.performance<row.amount&&totals.trivial<=row.performance))) return null;
  return {...totals,specific:basis.specific};
}

export function materialityGap(m) {
  const paper=m.work[workKey(m.engagement,'1.3')];
  return paper&&materialityBasis(paper.values)!==undefined&&(!isCurrentReview(paper)||!materialityValues(m))?
    '1.3 · Суурь, босго ба нотолгооны одоогийн хяналт шаардлагатай.':undefined;
}

export function updateMaterialityBasis(m,paper,data,values,files) {
  const previous=materialityBasis(paper.values);
  if (data.materialityBasis===undefined) {
    if (previous!==undefined) fail('Материаллаг байдлын үндэслэлийг одоогийн хувилбартай нь хадгална уу.');
    return undefined;
  }
  let row;
  try { row=JSON.parse(input(data,'materialityBasis',60_000)); } catch { fail('Материаллаг байдлын үндэслэлийн бүтэц буруу.'); }
  if (!object(row)) fail('Материаллаг байдлын үндэслэлийн бүтэц буруу.');
  const benchmarkMeasure=option(row.benchmarkMeasure,benchmarkMeasures.map(([key])=>key),'Суурь үзүүлэлтийг сонгоно уу.');
  const comparison=option(row.comparison,['prior-period','unavailable'],'Харьцуулах мэдээллийн төлөвийг сонгоно уу.');
  const stability=option(row.stability,['stable','adjusted','alternative'],'Суурийн тогтвортой байдлыг үнэлнэ үү.');
  const specificDecision=option(row.specificDecision,['required','not-required'],'Тусгай босго хэрэглэх эсэхийг шийднэ үү.');
  const source=input(row,'evidence',80), evidence=m.evidence.find(file=>file.id===source&&file.engagement===m.engagement&&evidenceCurrent(m,file)), stored=evidence&&files.get(source);
  if (!stored?.sha256) fail('Суурь дүнг дэмжсэн одоогийн зөвшөөрсөн нотлох баримтыг сонгоно уу.');
  values.benchmarkSource=input(data,'benchmarkSource');

  const targets=new Set(materialityTargets(m).map(target=>target.form)), used=new Set();
  if (!Array.isArray(row.specific)||row.specific.length>20||(specificDecision==='required')!==!!row.specific.length) {
    fail('Тусгай босгын шийдвэр ба мөрүүд хоорондоо тохирох ёстой.');
  }
  const specific=row.specific.map(item=>{
    if (!object(item)||!targets.has(item.form)||used.has(item.form)) fail('Тусгай босго бүрт давхардаагүй гүйцэтгэлийн ажил сонгоно уу.');
    const selected=amount(item.amount,'amount'), performance=amount(item.performance,'performance');
    if (selected<=0||performance<=0||performance>=selected) fail('Тусгай гүйцэтгэлийн босго нь тухайн тусгай босгоос бага эерэг дүн байна.');
    used.add(item.form);
    return {form:item.form,scope:input(item,'scope',160),amount:selected,performance,rationale:input(item,'rationale')};
  });
  const basis={
    users:input(row,'users'),benchmarkMeasure,benchmarkOther:benchmarkMeasure==='other'?input(row,'benchmarkOther',120):'',
    alternatives:input(row,'alternatives'),benchmarkRationale:input(row,'benchmarkRationale'),comparison,
    ...(comparison==='prior-period'&&{priorAmount:amount(row.priorAmount,'priorAmount')}),
    priorReference:comparison==='prior-period'?input(row,'priorReference',250):'',
    comparisonRationale:input(row,'comparisonRationale'),unusualResults:input(row,'unusualResults'),
    stability,stabilityRationale:input(row,'stabilityRationale'),
    evidence:{id:evidence.id,version:evidence.version,name:evidence.name,sha256:stored.sha256},
    specificDecision,specificReason:input(row,'specificReason'),specific,
  };
  const {revisionReason:_,...priorBasis}=previous??{};
  const changed=JSON.stringify(basis)!==JSON.stringify(priorBasis)||
    ['benchmark','percentage','performance','trivial','benchmarkSource'].some(key=>values[key]!==paper.values[key]);
  const reason=row.revisionReason?input(row,'revisionReason'):'';
  if (paper.status==='reviewed'&&changed&&!reason) fail('Хянасан материаллаг байдлыг өөрчлөх шалтгаан шаардлагатай.');
  values[basisKey]=JSON.stringify({...basis,revisionReason:reason||previous?.revisionReason||''});
  return evidence.id;
}
