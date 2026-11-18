import { benchmarkMeasures,materialityBasisKey,moneyRound,selectedMateriality,materialitySourceAnswers } from '../src/lib/pilot-materiality.ts';
import { isCurrentReview, materiality, recordEvent, snapshot, workKey } from '../src/lib/workspace.ts';
import { evidenceCurrent } from './pilot-requests.mjs';
import { input, PilotError } from './pilot-workflow.mjs';

const basisKey=materialityBasisKey;
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
  const legacy=()=>{for(const key of ['benchmark','percentage','performance','trivial'])values[key]=input(data,key,32);};
  if (data.materialityBasis===undefined) {
    if (previous!==undefined) fail('Материаллаг байдлын үндэслэлийг одоогийн хувилбартай нь хадгална уу.');
    legacy();
    return undefined;
  }
  let row;
  try { row=JSON.parse(input(data,'materialityBasis',60_000)); } catch { fail('Материаллаг байдлын үндэслэлийн бүтэц буруу.'); }
  if (!object(row)) fail('Материаллаг байдлын үндэслэлийн бүтэц буруу.');
  if(previous?.selection&&!row.selection)fail('Баталсан сонголт ба өөрчилсөн босгын түүхийг хадгална уу.');
  const selection=row.selection===undefined?undefined:readSelection(row.selection);
  if(selection){
    const candidate=selection.candidates.find(c=>c.measure===selection.selected);
    Object.assign(values,{benchmark:String(candidate.amount),percentage:String(candidate.percentage),performance:String(selection.performance.percentage),trivial:String(selection.trivial.percentage)});
  }else legacy();
  const chosen=selection?.candidates.find(c=>c.measure===selection.selected);
  const benchmarkMeasure=selection?.selected??option(row.benchmarkMeasure,benchmarkMeasures.map(([key])=>key),'Суурь үзүүлэлтийг сонгоно уу.');
  const comparison=chosen?(chosen.priorAmount!==undefined?'prior-period':'unavailable'):option(row.comparison,['prior-period','unavailable'],'Харьцуулах мэдээллийн төлөвийг сонгоно уу.');
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
    const decision=item.selection===undefined?undefined:readSpecificSelection(item.selection);
    if(decision&&!selection)fail('Тусгай босгын тооцоонд нийт материаллагийн сонголт шаардлагатай.');
    const candidate=decision&&moneyRound(selectedMateriality(selection).overall*decision.percentage/100);
    const selected=decision?.amountMode==='calculated'?candidate:amount(item.amount,'amount');
    const performance=decision?.performanceMode==='calculated'?moneyRound(selected*decision.performancePercentage/100):amount(item.performance,'performance');
    if (selected<=0||performance<=0||performance>=selected) fail('Тусгай гүйцэтгэлийн босго нь тухайн тусгай босгоос бага эерэг дүн байна.');
    used.add(item.form);
    return {form:item.form,scope:input(item,'scope',160),amount:selected,performance,rationale:input(item,'rationale'),...(decision&&{selection:decision})};
  });
  const basis={
    users:input(row,'users'),benchmarkMeasure,benchmarkOther:benchmarkMeasure==='other'?(chosen?.name??input(row,'benchmarkOther',120)):'',
    alternatives:input(row,'alternatives'),benchmarkRationale:input(row,'benchmarkRationale'),comparison,
    ...(comparison==='prior-period'&&{priorAmount:chosen?.priorAmount??amount(row.priorAmount,'priorAmount')}),
    priorReference:comparison==='prior-period'?input(row,'priorReference',250):'',
    comparisonRationale:input(row,'comparisonRationale'),unusualResults:input(row,'unusualResults'),
    stability,stabilityRationale:input(row,'stabilityRationale'),
    evidence:{id:evidence.id,version:evidence.version,name:evidence.name,sha256:stored.sha256},
    specificDecision,specificReason:input(row,'specificReason'),specific,...(selection&&{selection}),
  };
  const {revisionReason:_,...priorBasis}=previous??{};
  const changed=JSON.stringify(basis)!==JSON.stringify(priorBasis)||
    ['benchmark','percentage','performance','trivial','benchmarkSource'].some(key=>values[key]!==paper.values[key]);
  const reason=row.revisionReason?input(row,'revisionReason'):'';
  if (paper.status==='reviewed'&&changed&&!reason) fail('Хянасан материаллаг байдлыг өөрчлөх шалтгаан шаардлагатай.');
  values[basisKey]=JSON.stringify({...basis,revisionReason:reason||previous?.revisionReason||''});
  if(selection){
    const template=m.pilotForms?.['1.3']&&files.template(m.pilotForms['1.3'].digest);
    for(const [key,value] of Object.entries(materialitySourceAnswers(JSON.parse(values[basisKey]),paper.values)))if(!template||template.fields.some(f=>f.key===key&&f.type==='textarea'))values['field.'+key]=value;
  }
  return evidence.id;
}

const percentage=(value,name)=>{if(!['number','string'].includes(typeof value)||!/^\d+(?:\.\d{1,4})?$/.test(String(value))||Number(value)>100)fail('0–100 хооронд дөрвөн орны нарийвчлалтай хувь оруулна уу · '+name);return Number(value);};
const mode=value=>option(value,['calculated','override'],'Тооцоолсон эсвэл өөрчилсөн босго сонгоно уу.');
function readDecision(row){
 if(!object(row))fail('Босгын шийдвэр шаардлагатай.');
 const selected=mode(row.mode);
 return {mode:selected,...(selected==='override'&&{amount:amount(row.amount,'override')}),rationale:input(row,'rationale')};
}
export function readSelection(row){
 if(!object(row)||row.version!==1||!Array.isArray(row.candidates)||!row.candidates.length||row.candidates.length>5)fail('Материаллаг байдлын сонголтын хувилбар ба жишиг мөрүүдийг шалгана уу.');
 const used=new Set(),candidates=row.candidates.map(candidate=>{
  if(!object(candidate))fail('Жишиг мөрийн бүтэц буруу.');
  const measure=option(candidate.measure,benchmarkMeasures.map(([id])=>id),'Жишиг үзүүлэлт сонгоно уу.');
  if(used.has(measure))fail('Жишиг үзүүлэлт давхардсан.');used.add(measure);
  return {measure,name:measure==='other'?input(candidate,'name',120):benchmarkMeasures.find(([id])=>id===measure)[1],amount:amount(candidate.amount,'candidate'),
   ...(candidate.priorAmount!==undefined&&candidate.priorAmount!==''&&{priorAmount:amount(candidate.priorAmount,'priorAmount')}),percentage:percentage(candidate.percentage,'candidate'),rationale:input(candidate,'rationale')};
 });
 if(!used.has(row.selected)||!object(row.qualitative))fail('Сонгосон жишиг ба чанарын үнэлгээ шаардлагатай.');
 if(row.priorOverall!==undefined&&(!object(row.priorOverall)||amount(row.priorOverall.amount,'priorOverall')<=0))fail('Өмнөх баталсан нийт босго эерэг дүн байна.');
 const result={version:1,selected:row.selected,stage:option(row.stage,['planning','final'],'Төлөвлөлтийн эсвэл эцсийн үнэлгээ сонгоно уу.'),candidates,
  overall:readDecision(row.overall),performance:{...readDecision(row.performance),percentage:percentage(row.performance.percentage,'performance')},trivial:{...readDecision(row.trivial),percentage:percentage(row.trivial.percentage,'trivial')},
  ...(row.priorOverall&&{priorOverall:{amount:amount(row.priorOverall.amount,'priorOverall'),reference:input(row.priorOverall,'reference',250)}}),
  qualitative:{circumstances:input(row.qualitative,'circumstances'),reporting:input(row.qualitative,'reporting'),disclosures:input(row.qualitative,'disclosures')},
 };
 if(!selectedMateriality(result))fail('Нийт ба гүйцэтгэлийн босго эерэг, гүйцэтгэл нь нийтээс бага, илт бага босго 0-ээс гүйцэтгэлийн босгын хооронд байна.');
 return result;
}
function readSpecificSelection(row){
 if(!object(row))fail('Тусгай босгын сонголтын бүтэц буруу.');
 return {percentage:percentage(row.percentage,'specific'),performancePercentage:percentage(row.performancePercentage,'specific performance'),amountMode:mode(row.amountMode),performanceMode:mode(row.performanceMode),amountRationale:input(row,'amountRationale'),performanceRationale:input(row,'performanceRationale')};
}
