import {actorKey} from './pilot-identity-context.mjs';
import {createHash,createHmac,randomBytes} from 'node:crypto';
import {changeWork,workKey} from '../src/lib/workspace.ts';
import {evidenceCurrent} from './pilot-requests.mjs';
import {cents} from './pilot-population.mjs';
import {input,PilotError} from './pilot-workflow.mjs';
export const sampleMethod='hmac-sha256-rejection-fy-v1';
const fail=(text,status=409)=>{throw new PilotError(status,text);};
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const now=()=>new Date().toISOString();
const file=(m,id,version)=>m.evidence.find(e=>e.id===id&&(version===undefined||e.version===version)&&!e.population&&evidenceCurrent(m,e));
const number=value=>{const n=cents(String(value));if(n===null)fail('Мөнгөн дүнг хоёр орны нарийвчлалтай оруулна уу.',400);return n;};
export function boundedDraw(next,bound){
 if(!Number.isInteger(bound)||bound<1||bound>0x100000000)throw Error('Invalid draw bound');
 const limit=Math.floor(0x100000000/bound)*bound;let n;do{n=next();if(!Number.isInteger(n)||n<0||n>0xffffffff)throw Error('Invalid random word');}while(n>=limit);return n%bound;
}
// The stored entropy, ordered keys, seed and method reproduce the draw. Rejection removes modulo bias.
export function unbiasedUnits(ids,size,entropy,seed){
 if(!/^[0-9a-f]{64}$/.test(entropy)||new Set(ids).size!==ids.length||size<0||size>ids.length)throw Error('Invalid draw input');
 let counter=0;const next=()=>createHmac('sha256',Buffer.from(entropy,'hex')).update('audit-sample-v1/'+seed+'/'+counter++).digest().readUInt32BE(0);
 const ordered=[...ids];for(let i=0;i<size;i++){const j=i+boundedDraw(next,ordered.length-i);[ordered[i],ordered[j]]=[ordered[j],ordered[i]];}return ordered.slice(0,size);
}
const parseList=value=>String(value??'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
export function newSample(scope,data,previous){
 const all=scope.rows,ids=all.map(r=>r.id);if(new Set(ids).size!==ids.length)fail('Түүврийн нэгжийн түлхүүр давхардсан.');
 const specific=parseList(data.specific),excluded=parseList(data.excluded),used=[...specific,...excluded];
 if(used.length>500||new Set(used).size!==used.length||used.some(id=>!ids.includes(id)))fail('Тусгай ба хассан нэгжүүд давхардалгүй, эх олонлогт байна.');
 if(excluded.length&&!data.exclusionBasis?.trim()||specific.length&&!data.specificBasis?.trim())fail('Тусгай болон хассан бүлгийн бодит үндэслэл шаардлагатай.');
 const residual=all.filter(r=>!used.includes(r.id)),size=Number(data.size);
 if(size>residual.length)fail('Үлдсэн олонлогоос хэт олон нэгж сонгохгүй.');
 if(previous?.selected&&!data.revisionReason?.trim())fail('Өмнөх сонголт ба сорилыг хадгалж, шинэ дизайны шалтгааныг бичнэ үү.');
 const unit=input(data,'unitDefinition',500),objective=input(data,'objective',500),assumptions=input(data,'assumptions'),revisionReason=String(data.revisionReason??'').trim();
 const groups={specific,excluded,residual:residual.map(r=>r.id),exclusionBasis:String(data.exclusionBasis??''),specificBasis:String(data.specificBasis??'')};
 const signature=hash({groups,size,seed:Number(data.seed),purpose:data.purpose,unit,objective,assumptions,revisionReason});
 const sums=keys=>all.filter(r=>keys.includes(r.id)).reduce((n,r)=>n+r.cents,0);
 return {method:sampleMethod,groups,unit,objective,assumptions,revisionReason,signature,entropy:randomBytes(32).toString('hex'),orderedKeys:groups.residual,orderedKeysHash:hash(groups.residual),populationCents:sums(groups.residual),groupTotals:{all:sums(ids),specific:sums(specific),excluded:sums(excluded),residual:sums(groups.residual)},evaluations:[],events:[]};
}
export function selectV2(design,rows){
 const map=new Map(rows.map(r=>[r.id,r]));
 if(hash(design.orderedKeys)!==design.orderedKeysHash||design.orderedKeys.some(id=>!map.has(id)))fail('Хадгалсан сонголтын яг эхийг шалгана уу.');
 const prefix=design.expansion?.selected??[],available=design.orderedKeys.filter(id=>!prefix.includes(id));
 return [...prefix,...unbiasedUnits(available,design.size-prefix.length,design.entropy,design.seed),...design.groups.specific].map(id=>{
  const r=map.get(id);return {id,row:r.row,account:r.account,date:r.date,cents:r.cents,group:design.groups.specific.includes(id)?'specific':'sample'};
 });
}
export function testV2(m,role,design,unit,data,paper){
 const result=data.result,detail=input(data,'detail'),allowed=['pass','exception','unavailable','alternative'];
 if(!allowed.includes(result))fail('Гүйцэтгэлийн бодит төлөвийг сонгоно уу.',400);
 const support=file(m,data.evidence);if(result!=='unavailable'&&!support)fail('Бодитоор шалгасан одоогийн эх нотолгоо шаардлагатай.');
 const complete=['pass','exception','alternative'].includes(result),book=unit.cents,audited=complete?number(data.audited):null,difference=complete?book-audited:null;
 if(!Number.isSafeInteger(difference??0))fail('Зөрүүний дүн хэтэрсэн.');
 if(result==='pass'&&difference!==0||result==='exception'&&difference===0)fail('Бүртгэлийн дүн − шалгасан дүн нь үр дүнтэй тохирно.');
 const cause=complete&&difference!==0?input(data,'cause'):String(data.cause??'');
 const followup=!complete?input(data,'followup'):String(data.followup??'');
 if(!complete&&!['preparer','reviewer','partner'].includes(data.nextOwner))fail('Шалгаж чадаагүй нэгжийн дараагийн хариуцагч шаардлагатай.');
 const record={unit:unit.id,row:unit.row,result,detail,book,audited,signedDifference:difference,cents:Math.abs(difference??0),cause,followup,nextOwner:data.nextOwner??'',evidence:support?.id??'',evidenceVersion:support?.version??0,by:actorKey(role),at:now(),group:unit.group};
 const findingId='SAMPLE-'+hash([m.engagement,design.form,design.basis.source,unit.id]).slice(0,32),finding=m.findings.find(f=>f.id===findingId);
 if(finding&&(finding.resolution||finding.status!=='identified'||difference===0||difference===null))fail('Илрүүлэлтийг тусдаа шийдвэрлэнэ үү; сорилоор арилгахгүй.');
 const last=design.tests.findLast(r=>r.unit===unit.id);if(last&&hash({...last,at:''})===hash({...record,at:''}))return false;
 if(difference!==null&&difference!==0){record.finding=findingId;const next={id:findingId,engagement:m.engagement,form:design.form,title:unit.id+' · '+detail,amount:Math.abs(difference)/100,signedDifference:difference/100,status:'identified',evidence:support.id,qualitative:cause,sampleId:unit.id,sampleBasis:{source:design.basis.source,version:design.version,group:unit.group}};if(finding)Object.assign(finding,next);else m.findings.push(next);}
 design.tests.push(record);delete design.resultReview;
 changeWork(m,paper.id,{...paper.values,['pilot.sample.'+design.version+'.'+hash(unit.id).slice(0,24)]:JSON.stringify(record)},[...new Set([...paper.evidence,...(support?[support.id]:[])])]);return true;
}
const testState=(m,design)=>design.selected?.map(unit=>{const t=design.tests.findLast(t=>t.unit===unit.id);return {unit:unit.id,test:t??null,current:!!t&&!!file(m,t.evidence,t.evidenceVersion)};})??[];
const evaluationBasis=(m,design)=>hash([design.stamp,design.signature,design.selected,design.convention,testState(m,design)]);
export const resultCurrent=(m,design)=>!!design.resultReview&&design.resultReview.stamp===evaluationBasis(m,design)&&(!design.convention||!!file(m,design.convention.evidence,design.convention.evidenceVersion));
export function projectionV2(m,design){
 const tested=testState(m,design),sample=tested.filter(t=>design.selected.find(u=>u.id===t.unit).group==='sample'),reasons=[];
 if(!design.selected)reasons.push('Selection has not been performed');
 if(tested.some(t=>!t.test||!t.current||t.test.result==='unavailable'))reasons.push('Every selected item needs actual current testing or suitable alternatives; inability remains outstanding');
 if(design.objective!=='tests-of-details')reasons.push('Ratio projection is limited to tests of details');
 const rows=design.selected?.filter(u=>u.group==='sample')??[];
 if(design.populationCents<=0||rows.some(u=>u.cents<=0)||design.eligibleNonPositive)reasons.push('Ratio projection requires positive book amounts in a single-sign residual population');
 if(!design.convention||!file(m,design.convention.evidence,design.convention.evidenceVersion))reasons.push('HB-D02: current explicit signed-difference and gross-exposure convention approval is required');
 const errors=sample.map(t=>t.test?.signedDifference??0),signs=new Set(errors.filter(Boolean).map(Math.sign));if(signs.size>1)reasons.push('Mixed-direction errors require a separately approved aggregation method; no silent netting');
 const denominator=rows.reduce((n,u)=>n+u.cents,0),factual=errors.reduce((n,e)=>n+e,0);
 if(denominator<=0)reasons.push('Sample book denominator must be positive');
 if(!Number.isSafeInteger(factual)||!Number.isSafeInteger(denominator))reasons.push('Numeric range exceeded');
 if(reasons.length)return {status:'not-evaluable',reasons,denominator,factual,stamp:evaluationBasis(m,design)};
 // Exact integer cents; round a rational result half away from zero, without floating point products.
 const product=BigInt(factual)*BigInt(design.populationCents),negative=product<0n,abs=negative?-product:product,den=BigInt(denominator),rounded=(abs*2n+den)/(den*2n),total=Number(negative?-rounded:rounded),incremental=total-factual;
 if(!Number.isSafeInteger(total)||!Number.isSafeInteger(incremental))return {status:'not-evaluable',reasons:['Projected result exceeds the safe monetary range'],stamp:evaluationBasis(m,design)};
 return {status:'calculated',denominator,population:design.populationCents,factual,total,incremental,ratio:factual/denominator,specific:tested.filter(t=>design.selected.find(u=>u.id===t.unit).group==='specific').reduce((n,t)=>n+Math.abs(t.test?.signedDifference??0),0),rounding:'integer cents; half away from zero',aggregation:'Factual findings plus incremental projection; no factual amount added twice. Specific items remain separate.',samplingRisk:'No confidence bound or sampling-risk allowance is calculated',stamp:evaluationBasis(m,design)};
}
export function sampleV2Action(m,role,action,data,design,{owner,reviewer,paper}){
 if(action==='sample-convention'){
  if(role!=='partner'||design.preparedBy===role)fail('Партнерын тусдаа арга зүйн шийдвэр шаардлагатай.',403);
  if(data.convention!=='book-minus-audited-gross-incremental-v1')fail('Тэмдэг, нэгж, нэгтгэлийн ил тод хувилбарыг сонгоно уу.');
  const support=file(m,data.evidence);if(!support)fail('Арга зүйн шийдвэрийн бодит баталсан эх шаардлагатай.');
  const convention={method:data.convention,evidence:support.id,evidenceVersion:support.version,by:actorKey(role),reason:input(data,'reason'),at:now()};
  (design.conventionHistory??=[]).push(convention);design.convention=convention;delete design.resultReview;
 }else if(action==='sample-evaluate'){
  if(!owner||paper.status==='submitted')fail('Томилсон бэлтгэгч шаардлагатай.',403);
  const output=projectionV2(m,design);design.evaluations.push({...output,version:design.evaluations.length+1,nature:input(data,'nature'),qualitative:input(data,'qualitative'),additionalWork:input(data,'additionalWork'),by:actorKey(role),at:now()});delete design.resultReview;
 }else if(action==='sample-results-review'){
  if(!reviewer)fail('Хараат бус томилсон хянагч шаардлагатай.',403);
  const evaluation=design.evaluations.at(-1);if(!evaluation||String(evaluation.version)!==data.evaluation||evaluation.stamp!==evaluationBasis(m,design))fail('Одоогийн сорилын үнэлгээг дахин бэлтгэнэ үү.');
  const disposition=data.disposition;if(!['usable','limited'].includes(disposition))fail('Хэрэглээний шийдвэрийг сонгоно уу.');
  if(disposition==='usable'&&(evaluation.status!=='calculated'||testState(m,design).some(t=>!t.current||t.test.result==='unavailable')))fail('Дутуу эсвэл тооцох боломжгүй үнэлгээг цэвэр хэрэглээнд батлахгүй.');
  const review={evaluation:evaluation.version,stamp:evaluation.stamp,by:actorKey(role),at:now(),disposition,reason:input(data,'reason'),...(disposition==='limited'&&{nextOwner:input(data,'nextOwner',20),followup:input(data,'followup')})};
  if(disposition==='limited'&&!['preparer','reviewer','partner'].includes(review.nextOwner))fail('Хязгаарлалтын дараагийн хариуцагч шаардлагатай.');
  if(disposition==='usable'&&evaluation.incremental!==0){
   if(m.findings.some(f=>f.id.startsWith('PROJECTION-')&&f.form===design.form&&f.projection?.source!==design.basis.source&&f.status!=='posted_verified'))fail('Өмнөх ба шинэ эхийн давхцах төсөөллийн асуудлыг G05-д тусдаа үнэлнэ үү; давхар өртөлт нэмж батлахгүй.');
   const id='PROJECTION-'+hash([m.engagement,design.form,design.basis.source,design.basis.line]).slice(0,32),finding=m.findings.find(f=>f.id===id);
   if(finding&&(finding.resolution||finding.status!=='identified'))fail('Өмнөх төсөөллийн залруулгыг тусдаа шийдвэрлэнэ үү.');
   const next={id,engagement:m.engagement,form:design.form,title:'Residual sample incremental projection',amount:Math.abs(evaluation.incremental)/100,signedDifference:evaluation.incremental/100,status:'identified',evidence:design.basis.source,qualitative:evaluation.qualitative,projection:{source:design.basis.source,design:design.version,evaluation:evaluation.version,total:evaluation.total,factual:evaluation.factual,incremental:evaluation.incremental,unit:'cents'}};
   if(finding)Object.assign(finding,next);else m.findings.push(next);
  }else if(disposition==='usable'&&m.findings.some(f=>f.id.startsWith('PROJECTION-')&&f.form===design.form&&f.projection?.source===design.basis.source))fail('Өмнөх төсөөллийн илрүүлэлтийг тэгээр дарж арилгахгүй.');
  design.resultReview=review;(design.resultReviews??=[]).push(review);
 }else return false;
 design.events.push({action,by:actorKey(role),at:now()});return true;
}
export function sampleEvidence(m){return Object.values(m.pilotSamples??{}).flatMap(versions=>versions.flatMap(d=>[d.basis.source,...d.tests.map(t=>t.evidence),...(d.conventionHistory??[]).map(c=>c.evidence)]));}
