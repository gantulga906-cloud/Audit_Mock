import type {Role} from './workflow';
import type {Company,EngagementTeam} from './feature-workflows';
import {accessOverride,missingFields,sharedFields,type Bench,type Template} from './workbench.ts';

export type StageStatus='not_started'|'in_progress'|'waiting'|'submitted'|'returned'|'reviewed'|'changed';
export type ViewId='home'|'journey'|'profile'|'engagements'|'progress'|'calendar'|'tasks'|'team'|'forms'|'requests'|'evidence'|'data'|'risks'|'sampling'|'automations'|'review'|'decisions'|'reporting'|'archive'|'library'|'coverage'|'settings';
export type Person={id:string;name:string;initials:string;role:Role;title:string;scope:string[];support:string[]};
export const PERSONS:Person[]=[
 {id:'nomin',name:'Б. Номин',initials:'БН',role:'preparer',title:'Аудитор',scope:['E1','E2'],support:[]},
 {id:'temuulen',name:'Т. Тэмүүлэн',initials:'ТТ',role:'reviewer',title:'Ахлах аудитор',scope:['E1','E2','E3'],support:['methodology-author']},
 {id:'bat',name:'Д. Бат-Эрдэнэ',initials:'ДБ',role:'partner',title:'Гэрээт ажлын партнер',scope:['E1','E2','E3'],support:['methodology-publisher','archive-custodian','access-admin']},
 {id:'saruul',name:'С. Саруул',initials:'СС',role:'quality',title:'Чанарын хянагч',scope:['E1','E3'],support:[]},
];
export const DEMO_DAY='2026-11-06';
export const STATUS:Record<StageStatus,string>={not_started:'Эхлээгүй',in_progress:'Бэлтгэж буй',waiting:'Хүлээгдэж буй',submitted:'Хяналтад ирсэн',returned:'Засварт буцаасан',reviewed:'Хянагдсан',changed:'Дахин хянуулах'};
export const CAPACITY={preparer:'R1 · Бэлтгэсэн',reviewer:'R2 · Хянасан 1',partner:'R3 · Хянасан 2',quality:'R4 · Баталгаажуулсан'};
export type Note={id:string;author:string;text:string;version:number;response:string;cleared:boolean;anchor?:string};
export type Snapshot={version:number;values:Record<string,string>;evidence:string[];at:string;by:string;action:string;template?:Template};
export type Intake={contact:string;origin:'client'|'firm';period:string;facts:string;active:boolean};
export type DecisionRecord={version:number;by:string;at:string;decision:Engagement['acceptance'];assessment:string;independence:string;letter:string};
export type Statements={version:number;statements:string;notes:string};
export type ReportPackage={report:number;fs:number;reportDate?:string;paper:SnapshotContent;statements:Statements;reliedOn:SnapshotContent[];decisions:DecisionRecord[];findings:Finding[];evidence:{id:string;version:number;status:Evidence['status']}[];sample?:{ids:string[];stamp:string;version:number};quality:string};
type SnapshotContent={id:string;version:number;reviewedVersion?:number;values:Record<string,string>;evidence:string[]};
type Authorization={report:number;fs:number;by:string;at:string;package?:ReportPackage};
type Release={report:number;fs:number;authorizedAt:string;issuedAt:string;recipients:{name:string;status:string}[];package?:ReportPackage};
export type WorkItem={id:string;engagement:string;form:string;title:string;stage:number;owner:string;reviewer:string;start:string;due:string;baselineStart:string;baselineDue:string;estimate:number;actual:number;status:StageStatus;version:number;submittedVersion?:number;submittedBy?:string;reviewedVersion?:number;values:Record<string,string>;evidence:string[];notes:Note[];history:Snapshot[];required:boolean;naReason?:string;completedAt?:string;qualityVersion?:number};
export type Engagement={id:string;companyId?:string;team?:EngagementTeam;carriedFrom?:string;client:string;initials:string;industry:string;period:string;kind:string;phase:string;reportDate:string;reportForm?:string;acceptance:'pending'|'accepted'|'declined'|'conditional';termsAgreed:boolean;independence:boolean;formalEqr:boolean;eqrComplete:boolean;fsVersion:number;reportVersion:number;reportFsVersion:number;authorized?:Authorization;issued?:{report:number;fs:number;at:string};recipients:{name:string;status:'pending'|'delivered'|'failed'}[];locked:boolean;custody:'none'|'offered'|'accepted';hold:boolean;followup:boolean;qualityConcerns:{id:string;text:string;resolved:boolean}[];releaseHistory?:Release[];decisionVersion?:number;intake?:Intake;decisions?:DecisionRecord[];statements?:Statements;authorizationHistory?:Authorization[];eqrReview?:{by:string;at:string;basis:string}};
export type Evidence={id:string;engagement:string;name:string;version:number;type:string;obtained:string;status:'received'|'accepted'|'rejected';source:string;anchor:string;text:string;specimen:boolean;dataUrl?:string;original?:boolean;channel?:string;request?:string;replaces?:string;assessment?:string};
export type RequestPart={id:string;title:string;evidence?:string;state:'missing'|'received'|'accepted'|'rejected';reason?:string};
export type RequestItem={id:string;dispatch?:'draft'|'issued'|'cancelled';contactId?:string;contactEmail?:string;issuedAt?:string;followUps?:{at:string;by:string;text:string}[];engagement:string;title:string;form:string;contact:string;owner:string;due:string;status:'open'|'partial'|'ready'|'changes_requested'|'complete';received:number;expected:number;message:string;evidence:string[];history:string[];parts?:RequestPart[]};
export type ManualTask={id:string;engagement:string;title:string;owner:string;due:string;done:boolean;kind:'task'|'decision'|'meeting';form?:string};
export type Event={id:string;engagement:string;title:string;owner:string;start:string;end:string;kind:'meeting'|'fieldwork'|'review'|'focus'};
export type Finding={id:string;engagement:string;form:string;title:string;amount:number;status:'identified'|'agreed'|'posted_verified';evidence:string;qualitative:string;resolution?:string;sampleId?:string};
export type DataRow={id:string;account:string;amount:number|null;rawAmount?:string;period:string;state:'accepted'|'quarantined'|'excluded';reason:string;sourceRow:number};
export type Dataset={version:number;name:string;rows:DataRow[];sourceTotal:number;importedAt:string;controlTotal?:number};
export type Run={id:string;engagement:string;automation:string;inputStamp:string;at:string;by:string;status:'complete'|'failed';summary:string;rows:{label:string;value:string}[];exceptions:string[];dispositions:Record<string,string>};
export type Risk={id:string;engagement:string;title:string;assertion:string;significance:string;response:string;forms:string[];conclusion:string};
export type SampleDesign={size:number;seed:number;designVersion:number;reviewedVersion?:number;reviewedStamp?:string;reviewedBy?:string;selected:string[];selections?:{ids:string[];stamp:string;at:string;by:string;version:number}[]};
export type Model={schema:2;bench?:Bench;companies?:Record<string,Company>;person:string;engagement:string;work:Record<string,WorkItem>;engagements:Engagement[];evidence:Evidence[];requests:RequestItem[];tasks:ManualTask[];events:Event[];findings:Finding[];datasets:Record<string,Dataset>;runs:Run[];risks:Risk[];impacts:{id:string;engagement:string;source:string;targets:string[];reason:string;resolved:boolean;resolution?:string}[];samples:Record<string,SampleDesign>;library:{version:number;draft:string;phase:'published'|'draft'|'in_review';adopted:Record<string,number>;releases:{version:number;text:string}[]};activity:{id:string;engagement:string;text:string;by:string;at:string;form?:string}[]};
export const workKey=(e:string,f:string)=>`${e}/${f}`;
export const personById=(id:string)=>PERSONS.find(p=>p.id===id)!;
export function inScope(m:Model,person:string,id:string){const e=m.engagements.find(x=>x.id===id);return !!e&&(e.team?Object.values(e.team).includes(person):personById(person)?.scope.includes(id));}
export function permitted(m:Model,e:string){return inScope(m,m.person,e)}
export function exportWorkspace(m:Model):Model{
 const result=structuredClone(m),allowed=new Set(m.engagements.filter(e=>permitted(m,e.id)).map(e=>e.id));
 result.engagements=result.engagements.filter(e=>allowed.has(e.id));
 if(result.companies)result.companies=Object.fromEntries(Object.entries(result.companies).filter(([id,c])=>personById(m.person).role!=='quality'&&(c.by===m.person||result.engagements.some(e=>e.companyId===id))));
 if(!allowed.has(result.engagement))result.engagement=result.engagements[0]?.id??'';
 result.work=Object.fromEntries(Object.entries(result.work).filter(([,w])=>canReadWork(m,w)));
 result.datasets=Object.fromEntries(Object.entries(result.datasets).filter(([id])=>allowed.has(id)));
 result.samples=Object.fromEntries(Object.entries(result.samples).filter(([id])=>allowed.has(id)));
 result.library.adopted=Object.fromEntries(Object.entries(result.library.adopted).filter(([id])=>allowed.has(id)));
 for(const key of ['evidence','requests','tasks','events','findings','runs','risks','impacts','activity'] as const){
  (result[key] as {engagement:string}[])=(result[key] as {engagement:string}[]).filter(row=>allowed.has(row.engagement));
 }
 if(result.bench){result.bench.clients=Object.fromEntries(Object.entries(result.bench.clients).filter(([id])=>allowed.has(id)));result.bench.periods=Object.fromEntries(Object.entries(result.bench.periods).filter(([id])=>allowed.has(id)));result.bench.applied=Object.fromEntries(Object.entries(result.bench.applied).filter(([id])=>!!result.work[id]));result.bench.access=Object.fromEntries(Object.entries(result.bench.access).filter(([id])=>!!result.work[id]));result.bench.drafts=Object.fromEntries(Object.entries(result.bench.drafts).filter(([,d])=>d.by===m.person||personById(m.person).support.includes('methodology-publisher')));}
 return result;
}
export function canReadWork(m:Model,w:WorkItem){return permitted(m,w.engagement)&&(personById(m.person).role!=='quality'||w.form==='4.6')&&accessOverride(m,w,m.person,'view')!==false;}
export function canEdit(m:Model,w:WorkItem){return canReadWork(m,w)&&(accessOverride(m,w,m.person,'prepare')??w.owner===m.person)&&!m.engagements.find(e=>e.id===w.engagement)?.locked;}
export function canReviewWork(m:Model,w:WorkItem){return canReadWork(m,w)&&!m.engagements.find(e=>e.id===w.engagement)?.locked&&(accessOverride(m,w,m.person,'review')??w.reviewer===m.person)&&w.owner!==m.person&&!accessOverride(m,w,m.person,'prepare')&&w.submittedBy!==m.person&&w.status==='submitted'&&w.submittedVersion===w.version;}
export function stamp(value:unknown){const s=JSON.stringify(value);let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16)}
export function now(){return new Date().toISOString()}
export function recordEvent(m:Model,text:string,form?:string){m.activity.unshift({id:crypto.randomUUID(),engagement:m.engagement,text,by:m.person,at:now(),form});}
export function snapshot(w:WorkItem,by:string,action:string){w.history.unshift({version:w.version,values:{...w.values},evidence:[...w.evidence],by,action,at:now()});}
export function changeWork(m:Model,id:string,values:Record<string,string>,evidence?:string[]){
 const w=m.work[id];if(!w||!canEdit(m,w))throw Error('Энэ ажлын бэлтгэгчийн томилгоо шаардлагатай.');
 if(stamp([w.values,w.evidence])===stamp([values,evidence??w.evidence]))return;
 snapshot(w,m.person,'Өмнөх агуулгыг хадгалав');w.version++;w.values={...values};w.evidence=[...(evidence??w.evidence)];w.status=w.reviewedVersion||w.submittedVersion?'changed':'in_progress';w.submittedVersion=undefined;w.completedAt=undefined;
 if(w.form==='1.3')m.impacts.unshift({id:crypto.randomUUID(),engagement:w.engagement,source:'1.3',targets:['3.3.1','4.1.1','2.8'],reason:'Материаллаг байдлын шинэ хувилбар. Түүвэр, үнэлгээ, төлөвлөгөөнд үзүүлэх нөлөөг үнэлнэ.',resolved:false});
 recordEvent(m,`${w.form} · v${w.version} агуулга шинэчлэгдэв`,w.form);
}
export function acceptanceGaps(e:Engagement){const gaps:string[]=[];const decision=e.decisions?.at(-1);if(e.acceptance!=='accepted')gaps.push('1.4.1/1.4.2 · Хүлээн авах шийдвэр');if(!e.independence||!decision?.independence)gaps.push('1.4.5 · Хараат бус байдлын шийдвэрийн ишлэл');if(!e.termsAgreed||!decision?.letter)gaps.push('1.4.3 · Тохиролцсон захидлын хувилбар');return gaps;}
export function readiness(m:Model,w:WorkItem){const e=m.engagements.find(x=>x.id===w.engagement)!;const missing=w.form==='1.1.1'?acceptanceGaps(e):[];if(w.stage>1&&e.intake&&!e.intake.active)missing.push('Гэрээт ажлыг идэвхжүүлнэ үү');{const request=m.requests.find(r=>r.engagement===e.id&&r.form===w.form&&(r.dispatch==='issued'||!r.dispatch&&w.form==='3.1.2'&&e.intake)&&r.status!=='complete');if(request)missing.push(`${request.id} · Эх баримтын үнэлгээ дутуу`);}if(e.locked)missing.push('Эцсийн файл түгжээтэй');return missing;}
export function submissionGaps(m:Model,w:WorkItem){
 const gaps=[...readiness(m,w),...missingFields(m,w)];
 if(w.form==='3.1.2'&&w.engagement==='E2'&&m.engagements.find(e=>e.id===w.engagement)?.intake){
  const selection=currentSelection(m,w.engagement);
  if(!selection||selection.ids.some(id=>!w.values[`sample.${selection.stamp}.${id}`]))gaps.push('Сонгосон бүх нэгжийн шалгалтыг бүртгэнэ үү');
 }
 return gaps;
}
export function submitWork(m:Model,id:string){const w=m.work[id];if(!canEdit(m,w))throw Error('Зөвхөн томилсон бэлтгэгч илгээнэ.');const gaps=submissionGaps(m,w);if(gaps.length)throw Error(gaps.join('; '));if(!Object.values(w.values).some(v=>v.trim())&&!w.evidence.length)throw Error('Хийсэн ажил эсвэл баримт оруулна уу.');for(const [key,value] of Object.entries(sharedFields(m,w.engagement)))w.values['shared.'+key]=value;snapshot(w,m.person,'Хяналтад илгээв');w.status='submitted';w.submittedVersion=w.version;w.submittedBy=m.person;recordEvent(m,`${w.form} · v${w.version} хяналтад илгээв`,w.form);}
export function reviewWork(m:Model,id:string){const w=m.work[id];if(!canReviewWork(m,w))throw Error('Яг илгээсэн хувилбарын томилсон хянагч шаардлагатай.');const gaps=submissionGaps(m,w);if(gaps.length)throw Error(gaps.join('; '));if(w.notes.some(n=>!n.cleared))throw Error('Нээлттэй тэмдэглэлээ шийдвэрлэнэ үү.');w.status='reviewed';w.reviewedVersion=w.version;w.completedAt=now();snapshot(w,m.person,'Хянаж батлав');recordEvent(m,`${w.form} · v${w.version} хянагдав`,w.form);}
export function returnWork(m:Model,id:string,text:string,anchor=''){const w=m.work[id];if(!canReviewWork(m,w)||!text.trim())throw Error('Буцаах шалтгаан болон хянагчийн томилгоо шаардлагатай.');w.notes.push({id:crypto.randomUUID(),author:m.person,text:text.trim(),version:w.version,response:'',cleared:false,anchor});w.status='returned';recordEvent(m,`${w.form} · Бэлтгэгчид засварт буцаав`,w.form);}
export function respondNote(m:Model,id:string,note:string,text:string){const w=m.work[id];if(!canEdit(m,w)||!text.trim())throw Error('Бэлтгэгчийн бодит хариу шаардлагатай.');w.notes.find(n=>n.id===note)!.response=text;recordEvent(m,`${w.form} · Хариу тайлбар бүртгэв`,w.form);}
export function clearNote(m:Model,id:string,note:string){const w=m.work[id],n=w.notes.find(n=>n.id===note)!;if(m.person!==n.author||w.owner===m.person||!canReadWork(m,w)||m.engagements.find(e=>e.id===w.engagement)?.locked||!n.response.trim())throw Error('Тэмдэглэлийн хянагч хариуг үзэж шийдвэрлэнэ.');n.cleared=true;recordEvent(m,`${w.form} · Хянагч тэмдэглэл шийдвэрлэв`,w.form);}
export function reschedule(m:Model,id:string,due:string,start?:string){const w=m.work[id];if(!permitted(m,w.engagement)||m.engagements.find(e=>e.id===w.engagement)?.locked||!(w.owner===m.person||['reviewer','partner'].includes(personById(m.person).role)))throw Error('Хугацаа өөрчлөх томилгоо байхгүй.');if(due&&(!/^\d{4}-\d{2}-\d{2}$/.test(due)||due<(start??w.start)))throw Error('Дуусах өдөр эхлэх өдрөөс өмнө байна.');w.due=due;if(start!==undefined)w.start=start;recordEvent(m,`${w.form} · ${due?'Төлөвлөсөн хугацаа '+due:'Товлоогүй'}`,w.form);}
export function reassign(m:Model,id:string,owner:string,reviewer:string){const w=m.work[id];if(!(accessOverride(m,w,m.person,'assign')??['reviewer','partner'].includes(personById(m.person).role))||!canReadWork(m,w)||m.engagements.find(e=>e.id===w.engagement)?.locked)throw Error('Багийн томилгооны эрх шаардлагатай.');if(owner===reviewer)throw Error('Хөндлөнгийн хяналтыг өөртөө томилохгүй.');if(!inScope(m,owner,w.engagement)||!inScope(m,reviewer,w.engagement)||[owner,reviewer].some(id=>personById(id).role==='quality'))throw Error('Бэлтгэх/хянах хүчинтэй томилгоо шаардлагатай.');w.owner=owner;w.reviewer=reviewer;recordEvent(m,`${w.form} · Томилгоо шинэчлэв`,w.form);}
export function metrics(items:WorkItem[]){const applicable=items.filter(x=>x.required&&!x.naReason),n=applicable.length;const prepared=applicable.filter(x=>['submitted','reviewed'].includes(x.status)).length;const reviewed=applicable.filter(x=>x.status==='reviewed'&&x.reviewedVersion===x.version).length;return {total:items.length,applicable:n,prepared,reviewed,preparedPct:n?Math.round(prepared/n*100):null,reviewedPct:n?Math.round(reviewed/n*100):null,overdue:applicable.filter(x=>x.due&&x.due<DEMO_DAY&&x.status!=='reviewed').length,blocked:applicable.filter(x=>x.status==='waiting').length,notes:items.reduce((s,x)=>s+x.notes.filter(n=>!n.cleared).length,0)};}
export function importCsv(text:string,period='2025'):Dataset{
 const lines=text.trim().split(/\r?\n/);if(lines.length<2)throw Error('Толгой мөр болон өгөгдөл шаардлагатай.');const parse=(s:string)=>{const out:string[]=[];let v='',q=false;for(let i=0;i<s.length;i++){if(s[i]==='"'){if(q&&s[i+1]==='"'){v+='"';i++}else q=!q}else if(s[i]===','&&!q){out.push(v);v=''}else v+=s[i]}out.push(v);return out.map(x=>x.trim())};
 const head=parse(lines[0]);
 if(head.join(',')!=='id,account,amount,period')throw Error('CSV баганууд: id,account,amount,period');
 const seen=new Set<string>();
 let sourceTotal=0;
 const rows=lines.slice(1).flatMap((line,i):DataRow[]=>{
  if(!line.trim())return [];
  const [id,account='',rawAmount='',rowPeriod='']=parse(line);
  const numeric=Number(rawAmount);
  const amount=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(rawAmount)&&Number.isFinite(numeric)?numeric:null;
  let reason='';
  if(!id||!account)reason='Таних код/данс дутуу';
  else if(amount===null)reason='Дүн тоон утга биш';
  else if(rowPeriod!==period)reason=`Тайлант үе ${period} биш`;
  else if(seen.has(id))reason='Таних код давхардсан';
  if(!reason)seen.add(id);
  if(amount!==null)sourceTotal+=amount;
  return [{id:id||`row-${i+2}`,account,amount,rawAmount,period:rowPeriod,state:reason?'quarantined':'accepted',reason,sourceRow:i+2}];
 });
 return {version:1,name:'CSV импорт',rows,sourceTotal,importedAt:now()};
}
export const SAMPLE_CSV='id,account,amount,period\nGL-001,1010,25000000,2025\nGL-002,1010,18000000,2025\nGL-003,1220,45000000,2025\nGL-004,1220,32000000,2025\nGL-005,1520,64000000,2025\nGL-006,1520,16000000,2025\nGL-007,3310,12000000,2025\nGL-008,3310,28000000,2025\nGL-009,4410,7000000,2024\nGL-010,4410,3000000,2025';
export function selectSample(ids:string[],size:number,seed:number){if(!Number.isInteger(size)||size<1||size>ids.length)throw Error('Түүврийн хэмжээ эх олонлогоос их эсвэл буруу.');let s=seed>>>0;const pool=[...ids].sort();for(let i=pool.length-1;i>0;i--){s=(Math.imul(s,1664525)+1013904223)>>>0;const j=s%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]]}return pool.slice(0,size);}
export function materiality(m:Model,e:string){const v=m.work[workKey(e,'1.3')].values;const b=Number(v.benchmark),p=Number(v.percentage),perf=Number(v.performance),trivial=Number(v.trivial);if(!v.benchmark?.trim()||!v.percentage?.trim()||!v.performance?.trim()||!v.trivial?.trim()||![b,p,perf,trivial].every(Number.isFinite)||b<=0||p<0||p>100||perf<0||perf>100||trivial<0||trivial>100)return null;const overall=b*p/100;return {overall,performance:overall*perf/100,trivial:overall*trivial/100};}
export function outstanding(m:Model,e:string){return m.findings.filter(f=>f.engagement===e&&f.status!=='posted_verified').reduce((s,f)=>s+f.amount,0);}
export function isCurrentReview(w:WorkItem|undefined){return !!w&&w.status==='reviewed'&&w.reviewedVersion===w.version;}
export const reportForm=(e:Engagement)=>e.reportForm??'4.1.A1';
export function reportGaps(m:Model,eid:string){
 const e=m.engagements.find(x=>x.id===eid)!,w=Object.values(m.work).filter(x=>x.engagement===eid),g=acceptanceGaps(e);
 if(e.intake&&!e.intake.active)g.push('Гэрээт ажил идэвхжээгүй');
 if(e.reportFsVersion!==e.fsVersion)g.push('Тайлангийн холбосон СТ хувилбар зөрүүтэй');
 if(!e.statements?.statements.trim()||!e.statements.notes.trim()||e.statements.version!==e.fsVersion)g.push('Одоогийн СТ ба тодруулгын бүртгэл');
 if(w.some(x=>x.notes.some(n=>!n.cleared)))g.push('Нээлттэй хяналтын тэмдэглэл');
 for(const f of (e.id==='E2'?['3.1.2','4.4',reportForm(e)]:['4.4',reportForm(e)]))if(!isCurrentReview(m.work[workKey(eid,f)]))g.push(`${f} · Одоогийн хувилбарын хяналт`);
 if(e.id==='E2'){const selection=currentSelection(m,eid),work=m.work[workKey(eid,'3.1.2')];if(!selection||selection.ids.some(id=>!work.values[`sample.${selection.stamp}.${id}`]))g.push('3.3.1 / 3.1.2 · Одоогийн түүвэр ба шалгалт');}
 if(m.requests.some(r=>r.engagement===eid&&(r.dispatch==='issued'||e.id==='E2'&&!r.dispatch&&r.form==='3.1.2')&&r.status!=='complete'))g.push('Эх баримтын үнэлгээ дуусаагүй хүсэлт');
 for(const paper of w)if(m.bench?.applied[paper.id]?.fields.some(f=>f.tailoring)&&!isCurrentReview(paper))g.push(paper.form+' · Тохируулсан горимын хяналт');
 if(m.findings.some(f=>f.engagement===eid&&f.status!=='posted_verified'&&!f.resolution))g.push('Залруулагдаагүй илрүүлэлтийн шийдвэр');
 if(e.formalEqr&&e.eqrReview?.basis!==qualityBasis(m,eid))g.push('Шаардлагатай формал EQR · Одоогийн багц');
 if(e.qualityConcerns.some(c=>!c.resolved))g.push('Чанарын шийдэгдээгүй асуудал');
 if(m.impacts.some(x=>x.engagement===eid&&!x.resolved))g.push('Өөрчлөлтийн нөлөөний үнэлгээ');
 return g;
}
export function runInputs(m:Model,e:string,id:string):unknown{switch(id){case'AUTO-003':return m.datasets[e];case'AUTO-028':return m.work[workKey(e,'3.1.2')].values;case'AUTO-046':return m.work[workKey(e,'1.3')].values;case'AUTO-047':return [sampleStamp(m,e),sampleGaps(m,e),m.samples[e].reviewedVersion,m.samples[e].reviewedStamp];case'AUTO-048':return [m.findings.filter(x=>x.engagement===e),materiality(m,e)];default:return [m.engagements.find(x=>x.id===e),Object.values(m.work).filter(x=>x.engagement===e).map(x=>[x.form,x.version,x.status,x.notes]),m.impacts.filter(x=>x.engagement===e)];}}
export const RUNNABLE=['AUTO-003','AUTO-028','AUTO-046','AUTO-047','AUTO-048','AUTO-056','AUTO-058'];
export function executeRun(m:Model,id:string){if(!RUNNABLE.includes(id))throw Error('Энэ арга эхний загварт хэрэгжээгүй.');if(!['preparer','reviewer','partner'].includes(personById(m.person).role))throw Error('Гүйцэтгэх томилгоо шаардлагатай.');if(!permitted(m,m.engagement)||m.engagements.find(e=>e.id===m.engagement)?.locked)throw Error('Одоогийн хүрээнд ажилбар гүйцэтгэх эрхгүй.');const e=m.engagement,rows:{label:string;value:string}[]=[],exceptions:string[]=[];let summary='';
 if(id==='AUTO-003'){
  const d=m.datasets[e],accepted=d.rows.filter(x=>x.state==='accepted'),q=d.rows.filter(x=>x.state==='quarantined'),excluded=d.rows.filter(x=>x.state==='excluded');
  rows.push({label:'Эх мөр',value:String(d.rows.length)},{label:'Хүлээн авсан',value:String(accepted.length)},{label:'Тусгаарласан',value:String(q.length)},{label:'Хассан',value:String(excluded.length)},{label:'Уншсан эх нийлбэр',value:String(d.sourceTotal)});
  if(d.controlTotal===undefined)exceptions.push('Хараат бус эх хяналтын нийлбэр оруулаагүй.');
  else{const difference=d.sourceTotal-d.controlTotal;rows.push({label:'Өгсөн хяналтын нийлбэр',value:String(d.controlTotal)},{label:'Хяналтын нийлбэрээс зөрүү',value:String(difference)});if(Math.abs(difference)>0.000001)exceptions.push('Уншсан нийлбэр нь өгсөн хяналтын нийлбэртэй зөрсөн.');}
  exceptions.push(...q.map(x=>`${x.sourceRow}: ${x.reason}`));summary='Мөрийн ангилал ба өгсөн хараат бус нийлбэрийн тулгалт. Эх файлын бүрэн байдлын баталгаа биш.';
 }
 if(id==='AUTO-028'){const v=m.work[workKey(e,'3.1.2')].values;const cost=Number(v.assetCost),res=Number(v.assetResidual),years=Number(v.assetLife),months=Number(v.assetMonths);if(![v.assetCost,v.assetResidual,v.assetLife,v.assetMonths].every(x=>x?.trim())||![cost,res,years,months].every(Number.isFinite)||cost<res||res<0||years<=0||months<0||months>12)throw Error('Өртөг, үлдэх өртөг, насжилт, сарын оролтыг шалгана уу.');rows.push({label:'Тооцоолсон элэгдэл (MNT)',value:String((cost-res)/years*months/12)});summary='Сонгосон нэг хөрөнгийн шулуун шугамын дахин тооцоо; бодлогын сонголт биш.';}
 if(id==='AUTO-046'){const mat=materiality(m,e);if(!mat)throw Error('Материаллаг байдлын оролт дутуу/буруу.');rows.push(...Object.entries(mat).map(([label,value])=>({label,value:String(value)})));summary='Аудиторын сонгосон суурь ба хувиар тооцов. Сонголтыг автоматаар батлаагүй.';}
 if(id==='AUTO-047'){const s=m.samples[e],gaps=sampleGaps(m,e);if(gaps.length)throw Error(gaps.join('; '));if(s.reviewedVersion!==s.designVersion||s.reviewedStamp!==sampleStamp(m,e))throw Error('Өөрчлөгдсөн оролт эсвэл дизайныг томилсон ахлах дахин хянана.');s.selected=selectSample(m.datasets[e].rows.filter(r=>r.state==='accepted').map(r=>r.id),s.size,s.seed);rows.push(...s.selected.map(x=>({label:'Сонгосон нэгж',value:x})));s.selections=[...(s.selections??[]),{ids:[...s.selected],stamp:sampleStamp(m,e),at:now(),by:m.person,version:s.designVersion}];summary='Дахин давтагдах энгийн санамсаргүй түүвэр. Гүйцэтгэл/дүгнэлт биш.';}
 if(id==='AUTO-048'){if(!materiality(m,e))throw Error('Материаллаг байдлын хүчинтэй оролт шаардлагатай.');exceptions.push(...m.findings.filter(x=>x.engagement===e&&x.status!=='posted_verified'&&x.qualitative).map(x=>`${x.id}: ${x.qualitative}`));rows.push({label:'Залруулагдаагүй нийлбэр (MNT)',value:String(outstanding(m,e))},{label:'Ерөнхий материаллаг байдал',value:String(materiality(m,e)?.overall??'Оролт дутуу')});exceptions.push(...m.findings.filter(x=>x.engagement===e&&x.status==='agreed').map(x=>`${x.id}: Зөвшөөрсөн боловч бичилт баталгаажаагүй`));summary='Бичилтийг бодитоор баталгаажуулсан засварыг л нийлбэрээс хасав.';}
 if(id==='AUTO-056'){exceptions.push(...reportGaps(m,e));rows.push({label:'Нээлттэй шаардлага',value:String(exceptions.length)});summary='Хувилбар ба сонгосон демо шаардлагын хяналт; санал дүгнэлт гаргахгүй.';}
 if(id==='AUTO-058'){const e1=m.engagements.find(x=>x.id===e)!;exceptions.push(...(!e1.issued?['Тайлан бодитоор гаргаагүй']:[]),...(!e1.locked?['Файл түгжээгүй']:[]),...(e1.hold?['Хадгалалтын хориг идэвхтэй']:[]));rows.push({label:'Түгжээ',value:e1.locked?'Тийм':'Үгүй'},{label:'Хүлээн авсан хадгалагч',value:e1.custody==='accepted'?'Тийм':'Үгүй'});summary='Файлын бэлэн байдлын демо хяналт. Устгал эсвэл хууль ёсны хугацаа тогтоохгүй.';}
 const run:Run={id:crypto.randomUUID(),engagement:e,automation:id,inputStamp:stamp(runInputs(m,e,id)),at:now(),by:m.person,status:'complete',summary,rows,exceptions,dispositions:{}};m.runs.unshift(run);recordEvent(m,`${id} · Тооцооллын шинэ ажилбар`);return run;
}
export function initialModel(forms:{id:string;title:string;stage:number}[]):Model{
 const engagements:Engagement[]=[{id:'E1',client:'Хан Алтай Үйлдвэрлэл ХХК',initials:'ХА',industry:'Үйлдвэрлэл',period:'2025',kind:'Үргэлжилсэн аудит',phase:'Гүйцэтгэл',reportDate:'2026-11-27',acceptance:'accepted',termsAgreed:true,independence:true,formalEqr:false,eqrComplete:false,fsVersion:2,reportVersion:1,reportFsVersion:1,recipients:[{name:'Санхүүгийн захирал',status:'pending'},{name:'ТУЗ-ийн нарийн бичиг',status:'pending'}],locked:false,custody:'none',hold:false,followup:false,qualityConcerns:[]},{id:'E2',client:'Оргил Технологи ХХК',initials:'ОТ',industry:'Технологи',period:'2025',kind:'Шинэ үйлчлүүлэгч',phase:'Хүлээн авах',reportDate:'2026-12-04',acceptance:'pending',termsAgreed:false,independence:false,formalEqr:false,eqrComplete:false,fsVersion:1,reportVersion:1,reportFsVersion:1,recipients:[{name:'Удирдлага',status:'pending'}],locked:false,custody:'none',hold:false,followup:false,qualityConcerns:[]},{id:'E3',client:'Тэнгэр Эрчим ХК',initials:'ТЭ',industry:'Эрчим хүч',period:'2025',kind:'Нийтийн ашиг сонирхлын жишээ',phase:'Тайлагнал',reportDate:'2026-11-13',acceptance:'accepted',termsAgreed:true,independence:true,formalEqr:true,eqrComplete:false,fsVersion:3,reportVersion:2,reportFsVersion:3,recipients:[{name:'Аудитын хороо',status:'pending'},{name:'Удирдлага',status:'failed'}],locked:false,custody:'none',hold:true,followup:true,qualityConcerns:[{id:'QC1',text:'Тасралтгүй үйл ажиллагааны таамаглалын дэмжлэг дутуу.',resolved:false}]}];
 const work:Record<string,WorkItem>={};for(const e of engagements)forms.forEach((f,i)=>{const due=`2026-11-${String(Math.min(27,5+Math.floor(i/3))).padStart(2,'0')}`;let status:StageStatus=e.id==='E1'?(i<12?'reviewed':i<22?'in_progress':'not_started'):e.id==='E3'?(f.stage<4?'reviewed':'submitted'):'not_started';if(e.id==='E1'&&['3.1.2','3.1.4','1.3'].includes(f.id))status='in_progress';if(e.id==='E1'&&['3.1.5','2.6','4.6'].includes(f.id))status='submitted';if(e.id==='E1'&&f.id==='3.1.8')status='returned';if(e.id==='E1'&&f.id==='3.1.4')status='waiting';const owner=e.id==='E3'?'bat':f.id==='2.8'?'temuulen':'nomin',reviewer=owner==='temuulen'?'bat':owner==='bat'?'temuulen':'temuulen';const values:Record<string,string>=f.id==='1.3'?{benchmark:'5000000000',percentage:'1.5',performance:'70',trivial:'5',basis:'Орлогын суурийг жишээ нөхцөлд сонгов. Хувь нь демо параметр.'}:f.id==='3.1.2'?{assetCost:'120000000',assetResidual:'20000000',assetLife:'5',assetMonths:'12',conclusion:'Нэмэгдлийг ерөнхий дэвтэртэй тулгаж, эх баримтын дэмжлэгийг шалгаж байна.'}:{};const id=workKey(e.id,f.id);work[id]={id,engagement:e.id,form:f.id,title:f.title,stage:f.stage,owner,reviewer,start:'2026-11-02',due,baselineStart:'2026-11-02',baselineDue:due,estimate:2+(i%5)*2,actual:status==='reviewed'?3:status==='in_progress'?1:0,status,version:1,...(status==='reviewed'?{reviewedVersion:1}:{}),...(status==='submitted'?{submittedVersion:1,submittedBy:owner}:{}),values,evidence:f.id==='3.1.2'&&e.id==='E1'?['EV1']:[],notes:f.id==='3.1.8'&&e.id==='E1'?[{id:'RN1',author:'temuulen',text:'Банкны тулгалтын үлдэгдэл зөрүүний тайлбарыг нэмж холбоно уу.',version:1,response:'',cleared:false,anchor:'conclusion'}]:[],history:[],required:true};});
 return {schema:2,person:'temuulen',engagement:'E1',work,engagements,evidence:[{id:'EV1',engagement:'E1',name:'Хөрөнгийн нэмэгдлийн жагсаалт (жишээ)',version:1,type:'SPECIMEN',obtained:'2026-11-03',status:'accepted',source:'Демо санхүүгийн баг',anchor:'Хуудас 1 / мөр 4',text:'Тоног төхөөрөмж · Өртөг120,000,000 MNT · Үлдэх өртөг20,000,000 MNT · Насжилт5жил. Энэ бол зохиомол баримтын жишээ.',specimen:true}],requests:[{id:'REQ-01',engagement:'E1',title:'Бараа материалын тооллогын акт',form:'3.1.4',contact:'Санхүүгийн менежер',owner:'nomin',due:'2026-11-05',status:'partial',received:1,expected:3,message:'Төв агуулахын акт ирсэн; салбарын хоёр акт хүлээгдэж байна.',evidence:[],history:['2026.11.03 · Хэсэгчилсэн баримт хүлээн авсан']},{id:'REQ-02',engagement:'E1',title:'Үндсэн хөрөнгийн нэмэгдлийн эх баримт',form:'3.1.2',contact:'Нягтлан бодогч',owner:'nomin',due:'2026-11-07',status:'ready',received:1,expected:1,message:'Баримт ирсэн; аудиторын үнэлгээ хүлээгдэж байна.',evidence:['EV1'],history:[]},{id:'REQ-03',engagement:'E2',title:'Хараат бус байдлын мэдэгдэл',form:'1.4.6',contact:'Гэрээт ажлын баг',owner:'nomin',due:'2026-11-09',status:'open',received:0,expected:2,message:'Мэдэгдлийг бодит мэдүүлэгч өөрөө нийлүүлнэ.',evidence:[],history:[]}],tasks:[{id:'T1',engagement:'E1',title:'Үйлчлүүлэгчтэй тооллогын дутуу актыг тодруулах',owner:'nomin',due:'2026-11-06',done:false,kind:'task',form:'3.1.4'},{id:'T2',engagement:'E1',title:'Хяналтын багийн өглөөний уулзалт',owner:'temuulen',due:'2026-11-06',done:false,kind:'meeting'},{id:'T3',engagement:'E2',title:'Хүлээн авах шийдвэрийг гаргах',owner:'bat',due:'2026-11-09',done:false,kind:'decision',form:'1.4.1'}],events:[{id:'C1',engagement:'E1',title:'Багийн төлөвлөлт',owner:'temuulen',start:'2026-11-06',end:'2026-11-06',kind:'meeting'},{id:'C2',engagement:'E1',title:'Тооллогод оролцох',owner:'nomin',start:'2026-11-10',end:'2026-11-11',kind:'fieldwork'},{id:'C3',engagement:'E3',title:'Чанарын хяналтын цонх',owner:'saruul',start:'2026-11-09',end:'2026-11-11',kind:'review'}],findings:[{id:'F1',engagement:'E1',form:'3.1.2',title:'Элэгдлийн зардал дутуу',amount:100000000,status:'agreed',evidence:'',qualitative:'Зөвшөөрсөн боловч бичилт баталгаажаагүй.'},{id:'F2',engagement:'E1',form:'3.1.5',title:'Авлагын ангиллын алдаа',amount:25000000,status:'identified',evidence:'',qualitative:''},{id:'F3',engagement:'E3',form:'3.2.2',title:'Мөнгөн урсгалын таамаглалын дэмжлэг',amount:0,status:'identified',evidence:'',qualitative:'Чанарын шинжтэй чухал асуудал'}],datasets:Object.fromEntries(engagements.map(e=>[e.id,{...importCsv(SAMPLE_CSV),name:`${e.client} · Демо GL.csv`} ])),runs:[],risks:[{id:'R1',engagement:'E1',title:'Орлогын хугацааны зааг',assertion:'Тохиолдол / хугацааны зааг',significance:'Чухал',response:'Жилийн эцсийн баримтын дэлгэрэнгүй сорил',forms:['2.6','2.7.2','3.1.16'],conclusion:'Үнэлгээ хүлээгдэж буй'},{id:'R2',engagement:'E1',title:'Бараа материалын оршин байх',assertion:'Оршин байх / бүрэн байдал',significance:'Өндөр',response:'Тооллогод оролцох, бүртгэлтэй тулгах',forms:['2.6','3.1.4','3.3.1'],conclusion:'Салбарын акт хүлээгдэж байна'}],impacts:[],samples:Object.fromEntries(engagements.map(e=>[e.id,{size:3,seed:2026,designVersion:1,selected:[]} ])),library:{version:1,draft:'',phase:'published',adopted:{E1:1,E2:1,E3:1},releases:[{version:1,text:'Одоогийн батлагдсан эх асуултууд'}]},activity:[{id:'A1',engagement:'E1',text:'3.1.8 · Тулгалтын тайлбарыг засварт буцаав',by:'temuulen',at:'2026-11-05T09:00:00Z',form:'3.1.8'}]};
}

export function sampleGaps(m:Model,e:string){
 const mat=m.work[workKey(e,'1.3')],controls=m.work[workKey(e,'2.6')],s=m.samples[e],gaps:string[]=[];
 if(!isCurrentReview(mat)||!materiality(m,e))gaps.push('1.3 · Хянагдсан гүйцэтгэлийн материаллаг байдал');
 if(!isCurrentReview(controls)||!['none','partial','full','na'].includes(controls.values.controlsReliance)||!controls.values.relianceBasis?.trim())gaps.push('2.6 · Хянагдсан найдах түвшин ба үндэслэл');
 else if(['partial','full'].includes(controls.values.controlsReliance)&&!controls.evidence.some(id=>m.evidence.some(ev=>ev.id===id&&ev.engagement===e&&ev.status==='accepted')))gaps.push('2.6 · Үнэлсэн хяналтын нотлох баримт');
 if(!Number.isInteger(s.size)||s.size<1||s.size>m.datasets[e].rows.filter(r=>r.state==='accepted').length||!Number.isSafeInteger(s.seed)||s.seed<0||s.seed>0xffffffff)gaps.push('3.3.1 · Түүврийн хэмжээ ба seed');
 const eng=m.engagements.find(x=>x.id===e)!;
 if(!eng.period||m.datasets[e].rows.some(r=>r.state==='accepted'&&r.period!==eng.period))gaps.push('Эх олонлогийн тайлант жил тохирохгүй');
 return gaps;
}
export function sampleStamp(m:Model,e:string){const s=m.samples[e],mat=m.work[workKey(e,'1.3')],controls=m.work[workKey(e,'2.6')];return stamp([m.datasets[e],s.size,s.seed,s.designVersion,mat.version,mat.reviewedVersion,materiality(m,e),controls.version,controls.reviewedVersion,controls.values.controlsReliance,controls.values.relianceBasis,controls.evidence.map(id=>m.evidence.find(ev=>ev.id===id)?.status)]);}
export function currentSelection(m:Model,e:string){const selection=m.samples[e].selections?.at(-1);return !sampleGaps(m,e).length&&selection?.stamp===sampleStamp(m,e)?selection:undefined;}
export function approveSample(m:Model){const id=m.engagement,w=m.work[workKey(id,'3.3.1')];if(!permitted(m,id)||w.reviewer!==m.person||w.owner===m.person||m.engagements.find(e=>e.id===id)?.locked)throw Error('Томилсон ахлахын хяналт шаардлагатай.');const gaps=sampleGaps(m,id);if(gaps.length)throw Error(gaps.join('; '));const s=m.samples[id];s.reviewedVersion=s.designVersion;s.reviewedStamp=sampleStamp(m,id);s.reviewedBy=m.person;recordEvent(m,'Түүврийн дизайн, эх олонлог, 1.3 ба 2.6-г хянав','3.3.1');}
export function attemptRun(m:Model,id:string){if(!permitted(m,m.engagement)||!RUNNABLE.includes(id)||personById(m.person).role==='quality'||m.engagements.find(e=>e.id===m.engagement)?.locked)throw Error('Ажилбарын эрх эсвэл хэрэгжсэн арга шаардлагатай.');try{return executeRun(m,id)}catch(error){const run:Run={id:crypto.randomUUID(),engagement:m.engagement,automation:id,inputStamp:stamp(runInputs(m,m.engagement,id)),at:now(),by:m.person,status:'failed',summary:(error as Error).message,rows:[],exceptions:[],dispositions:{}};m.runs.unshift(run);return run;}}

function partnerEngagement(m:Model){const e=m.engagements.find(e=>e.id===m.engagement)!;if(!permitted(m,e.id)||personById(m.person).role!=='partner')throw Error('Партнерын томилгоо шаардлагатай.');return e;}
export function saveIntake(m:Model,intake:Omit<Intake,'active'>){
 const e=m.engagements.find(e=>e.id===m.engagement)!;
 if(!e.intake||e.intake.active||e.locked||!permitted(m,e.id)||personById(m.person).role==='quality')throw Error('Урьдчилсан бүртгэл засах боломжгүй.');
 if(intake.period&&!/^\d{4}$/.test(intake.period))throw Error('Тайлант жилийг дөрвөн оронтой бичнэ үү.');
 e.intake={...intake,period:e.team?m.bench?.periods[e.id]?.end.slice(0,4)??'':intake.period,active:false};recordEvent(m,'Урьдчилсан хүсэлт хадгалав','1.1.1');
}
export function activateEngagement(m:Model){
 const e=partnerEngagement(m);if(!e.intake||e.intake.active||e.locked)throw Error('Идэвхжүүлэх урьдчилсан бүртгэл алга.');
 const gaps=acceptanceGaps(e);if(!e.intake.period||!e.intake.contact.trim())gaps.push('Тайлант жил ба холбоо барих хүн');if(gaps.length)throw Error(gaps.join('; '));
 e.intake.active=true;if(e.companyId&&m.companies?.[e.companyId]?.status==='prospect')m.companies[e.companyId].status='active';e.period=e.intake.period;e.phase='Төлөвлөлт';recordEvent(m,'Тохиролцсон ажлыг идэвхжүүлэв','1.1.1');
}
export function setEngagementDecision(m:Model,field:'acceptance'|'termsAgreed'|'independence',value:Engagement['acceptance']|boolean,reference=''){
 const e=partnerEngagement(m);if(e.locked)throw Error('Файл түгжээтэй.');
 const previous=e.decisions?.at(-1);
 if(value===true&&!reference.trim())throw Error('Эх баримтын ишлэл шаардлагатай.');
 if(field==='acceptance'&&value!=='pending'&&!reference.trim())throw Error('Шийдвэрийн үндэслэл, хувилбарын ишлэл шаардлагатай.');
 if(field==='acceptance'&&value==='accepted'&&(!e.independence||!e.termsAgreed||!previous?.letter||!previous.independence))throw Error('Хараат бус байдал ба тохиролцсон захидлыг эхлээд бүртгэнэ үү.');
 if(field==='acceptance'&&e.acceptance===value&&previous?.assessment===reference.trim())return;
 if(field!=='acceptance'&&e[field]===value&&(field==='termsAgreed'?previous?.letter:previous?.independence)===reference.trim())return;
 const hadApproval=e.acceptance==='accepted';
 if(field==='acceptance')e.acceptance=value as Engagement['acceptance'];else{e[field]=Boolean(value);if(hadApproval)e.acceptance='pending';}e.decisionVersion=(e.decisionVersion??0)+1;
 e.decisions=[...(e.decisions??[]),{version:e.decisionVersion,by:m.person,at:now(),decision:e.acceptance,assessment:field==='acceptance'?reference.trim():previous?.assessment??'',letter:field==='termsAgreed'?(value?reference.trim():''):previous?.letter??'',independence:field==='independence'?(value?reference.trim():''):previous?.independence??''}];
 if(e.intake&&acceptanceGaps(e).length)e.intake.active=false;
 const w=m.work[workKey(e.id,'1.1.1')];if(w.status==='reviewed'||w.status==='submitted'){snapshot(w,m.person,'Холбогдсон шийдвэр өөрчлөгдөхийн өмнөх агуулга');w.version++;w.submittedVersion=undefined;w.status='changed';}
 if(hadApproval)m.impacts.push({id:crypto.randomUUID(),engagement:e.id,source:`Шийдвэр v${e.decisionVersion}`,targets:['1.1.1','2.8'],reason:'Хүлээн авах/нөхцөл/хараат бус байдлын эх шийдвэр өөрчлөгдсөн. Нөлөөлсөн ажлыг үнэлнэ.',resolved:false});
 recordEvent(m,`Шийдвэрийн эх бүртгэл v${e.decisionVersion} шинэчлэв`,'1.4.1');
}
function content(w:WorkItem):SnapshotContent{return {id:w.id,version:w.version,reviewedVersion:w.reviewedVersion,values:{...w.values},evidence:[...w.evidence]};}
export function currentPackage(m:Model,eid:string):ReportPackage{
 const e=m.engagements.find(e=>e.id===eid)!;
 const paper=content(m.work[workKey(eid,reportForm(e))]);
 const forms=new Set(['1.1.1','1.3','2.6','3.1.2','4.4']);
 for(const w of Object.values(m.work))if(w.engagement===eid&&m.bench?.applied[w.id]?.fields.some(f=>f.tailoring))forms.add(w.form);
 const reliedOn=[...forms].flatMap(f=>{const w=m.work[workKey(eid,f)];return w?[content(w)]:[];});
 const ids=new Set([paper,...reliedOn].flatMap(w=>w.evidence));
 const sample=e.intake?currentSelection(m,eid):undefined;
 return {report:e.reportVersion,fs:e.fsVersion,...(e.reportForm&&{reportDate:e.reportDate}),paper,statements:e.statements?{...e.statements}:{version:e.fsVersion,statements:'',notes:''},reliedOn,decisions:structuredClone(e.decisions??[]),findings:m.findings.filter(f=>f.engagement===eid).map(f=>({...f})),evidence:m.evidence.filter(ev=>ev.engagement===eid&&ids.has(ev.id)).map(({id,version,status})=>({id,version,status})),sample:sample?{ids:[...sample.ids],stamp:sample.stamp,version:sample.version}:undefined,quality:e.formalEqr?e.eqrReview?.at??'pending':'not_required'};
}
function qualityBasis(m:Model,eid:string){const {quality:_,...p}=currentPackage(m,eid);return JSON.stringify(p);}
export function completeEqr(m:Model){
 const e=m.engagements.find(e=>e.id===m.engagement)!;
 if(!permitted(m,e.id)||m.person!==(e.team?.quality??'saruul')||!e.formalEqr||e.locked||e.qualityConcerns.some(c=>!c.resolved))throw Error('Томилсон чанарын хянагч ба шийдвэрлэсэн асуудал шаардлагатай.');
 if(!isCurrentReview(m.work[workKey(e.id,reportForm(e))])||!isCurrentReview(m.work[workKey(e.id,'4.4')])||e.reportFsVersion!==e.fsVersion)throw Error('Тайлан ба дуусгалтын одоогийн хяналт шаардлагатай.');
 e.eqrReview={by:m.person,at:now(),basis:qualityBasis(m,e.id)};e.eqrComplete=true;recordEvent(m,'Томилсон чанарын хянагч багцын демо EQR бүртгэв','4.6');
}
export function saveStatements(m:Model,statements:string,notes:string){
 const e=partnerEngagement(m);if(e.locked||!statements.trim()||!notes.trim())throw Error('СТ ба тодруулгын агуулгыг хоёуланг бүртгэнэ үү.');
 if(e.statements?.statements===statements.trim()&&e.statements.notes===notes.trim())return;
 e.fsVersion++;e.statements={version:e.fsVersion,statements:statements.trim(),notes:notes.trim()};recordEvent(m,`СТ/тодруулгын v${e.fsVersion} хадгалав`);
}
export function bindStatements(m:Model){const e=partnerEngagement(m);if(e.locked||!e.statements)throw Error('Холбох СТ багц алга.');if(e.reportFsVersion!==e.fsVersion){e.reportFsVersion=e.fsVersion;e.reportVersion++;recordEvent(m,'Тайланг одоогийн СТ багцтай холбов',reportForm(e));}}
function samePackage(a:ReportPackage|undefined,b:ReportPackage){return !!a&&JSON.stringify(a)===JSON.stringify(b);}
export function authorizationCurrent(m:Model,e:Engagement){return samePackage(e.authorized?.package,currentPackage(m,e.id));}
export function currentRelease(m:Model,e:Engagement){const p=currentPackage(m,e.id);return e.releaseHistory?.find(r=>samePackage(r.package,p));}
export function authorizeReport(m:Model){
 const e=partnerEngagement(m);const gaps=reportGaps(m,e.id);if(e.locked||gaps.length)throw Error(gaps.join('; ')||'Эцсийн файл түгжээтэй.');
 if(authorizationCurrent(m,e))return;
 e.authorized={report:e.reportVersion,fs:e.fsVersion,by:m.person,at:now(),package:currentPackage(m,e.id)};
 e.authorizationHistory=[...(e.authorizationHistory??[]),e.authorized];recordEvent(m,'Яг энэ тайлан, СТ ба тодруулгын багцыг зөвшөөрөв',reportForm(e));
}
export function issueReport(m:Model){
 const e=partnerEngagement(m);if(currentRelease(m,e))return;
 const gaps=reportGaps(m,e.id);if(e.locked||gaps.length||!e.authorized||!authorizationCurrent(m,e))throw Error(gaps.join('; ')||'Багц өөрчлөгдсөн эсвэл зөвшөөрөл дутуу. Одоогийн багцыг дахин зөвшөөрнө үү.');
 e.issued={report:e.reportVersion,fs:e.fsVersion,at:now()};e.recipients=e.recipients.map(r=>({...r,status:'pending'}));e.custody='none';
 e.releaseHistory=[...(e.releaseHistory??[]),{report:e.reportVersion,fs:e.fsVersion,authorizedAt:e.authorized.at,issuedAt:e.issued.at,recipients:e.recipients.map(r=>({...r})),package:structuredClone(e.authorized.package)}];recordEvent(m,'Яг зөвшөөрсөн багцын гаргалт бүртгэв',reportForm(e));
}
export function recordDistribution(m:Model,index:number,status:'failed'|'delivered'){const e=partnerEngagement(m),release=currentRelease(m,e);if(!release||!e.recipients[index])throw Error('Одоогийн гаргасан багцын эрх шаардлагатай.');e.recipients[index].status=status;release.recipients[index].status=status;recordEvent(m,'Хүлээн авагчийн демо хүргэлтийн оролдлого бүртгэв');}
export function advanceCustody(m:Model,action:'lock'|'offer'|'accept'){
 const e=partnerEngagement(m),release=currentRelease(m,e);if(!personById(m.person).support.includes('archive-custodian')||!release)throw Error('Одоогийн гаргасан багц ба хадгалалтын томилгоо шаардлагатай.');
 if(action==='lock'){if(reportGaps(m,e.id).length)throw Error('Бүрдүүлэлтийн асуудлыг шийдвэрлэнэ үү.');e.locked=true;}
 if(action==='offer'){if(!e.locked||e.custody!=='none')throw Error('Түгжээтэй, шилжүүлээгүй багц шаардлагатай.');e.custody='offered';}
 if(action==='accept'){if(e.custody!=='offered')throw Error('Санал болгосон багц шаардлагатай.');e.custody='accepted';}
 recordEvent(m,`5.1 · ${{lock:'Багцыг түгжив',offer:'Хадгалалтад санал болгов',accept:'Хадгалалтад хүлээн авав'}[action]}`,'5.1');
}
export function prepareDemo(m:Model):Model{
 for(const e of m.engagements){
  e.statements={version:e.fsVersion,statements:`Демо СТ · ${e.client} · ${e.period}`,notes:'Зохиомол тодруулга · Үндсэн хөрөнгийн нэмэгдэл ба элэгдэл.'};
  if(e.acceptance==='accepted'){
   e.decisionVersion=1;e.decisions=[{version:1,by:'bat',at:'2026-11-04T09:00:00Z',decision:'accepted',assessment:'Демо 1.4.2 v1',independence:'Демо 1.4.5 v1',letter:'Демо 1.4.3 v1'}];
  }
 }
 const e=m.engagements.find(e=>e.id==='E2')!;
 e.intake={origin:'client',contact:'',period:'',facts:'Үндсэн хөрөнгийн нэмэгдэлтэй шинэ аудитын хүсэлт (зохиомол).',active:false};e.period='';
 m.requests.push({id:'REQ-04',engagement:e.id,title:'Үндсэн хөрөнгийн нэмэгдлийн баримт',form:'3.1.2',contact:'Демо нягтлан бодогч',owner:'nomin',due:'2026-11-10',status:'open',received:0,expected:2,message:'Бүртгэл болон нэхэмжлэлийг тус бүр шалгана.',evidence:[],history:[],parts:[{id:'register',title:'Хөрөнгийн нэмэгдлийн бүртгэл',state:'missing'},{id:'invoice',title:'Нэхэмжлэл ба хүлээн авалтын акт',state:'missing'}]});
 m.evidence.push(...['Бүртгэл','Нэхэмжлэл ба акт','Зассан нэхэмжлэл ба акт'].map((name,i):Evidence=>({id:`E2-ASSET-${i+1}`,engagement:'E2',name:`${name} · Демо`,type:'SPECIMEN',obtained:DEMO_DAY,version:1,status:'received',source:'Зохиомол санхүүгийн баг',anchor:'Үндсэн хөрөнгө / мөр 4',text:'Зөвхөн сургалтын жишээ.',specimen:true})));
 const d=importCsv('id,account,amount,period\nFA-001,1520,120000000,2025\nFA-002,1520,40000000,2025\nFA-003,1520,18000000,2025\nFA-004,1520,30000000,2025\nFA-005,1520,16000000,2025');
 m.datasets.E2={...d,name:'Үндсэн хөрөнгийн нэмэгдэл · Демо CSV'};
 m.work[workKey('E2','3.1.2')].due='';m.work[workKey('E2','3.1.2')].baselineDue='';
 return m;
}
export function recordRequestPart(m:Model,id:string,partId:string,action:'receive'|'accept'|'reject',value=''){
 const r=m.requests.find(r=>r.id===id&&r.engagement===m.engagement),e=m.engagements.find(x=>x.id===m.engagement)!;
 const p=r?.parts?.find(p=>p.id===partId);
 if(!r||!p||!permitted(m,e.id)||e.locked||(e.intake&&!e.intake.active)||r.owner!==m.person||(r.dispatch&&r.dispatch!=='issued'))throw Error('Энэ хүсэлтийн томилсон эзэн шаардлагатай.');
 if(action==='receive'){
  const ev=m.evidence.find(x=>x.id===value&&x.engagement===e.id);
  if(!ev||r.dispatch&&(ev.status!=='received'||!['missing','rejected'].includes(p.state))||ev.status==='rejected'||ev.request&&ev.request!==r.id||r.parts?.some(x=>x.id!==p.id&&x.evidence===ev.id))throw Error('Тус хэсэгт тохирох эх баримт сонгоно уу.');
  if(r.dispatch){ev.request=r.id;if(p.evidence)ev.replaces??=p.evidence;}
  p.evidence=ev.id;p.state='received';p.reason=undefined;
 }else{
  if(p.state!=='received'||!p.evidence)throw Error('Эхлээд баримт бүртгэнэ үү.');
  if(action==='reject'&&!value.trim())throw Error('Буцаах шалтгаан бичнэ үү.');
  p.state=action==='accept'?'accepted':'rejected';p.reason=action==='reject'?value.trim():undefined;
  const ev=m.evidence.find(x=>x.id===p.evidence)!;ev.status=p.state;if(r.dispatch)ev.assessment=p.reason??'Хүсэлтийн баримтыг үнэлж хүлээн авсан';
 }
 const parts=r.parts!;
 r.received=parts.filter(p=>p.state!=='missing').length;r.evidence=parts.flatMap(p=>p.evidence?[p.evidence]:[]);
 r.status=parts.every(p=>p.state==='accepted')?'complete':parts.some(p=>p.state==='rejected')?'changes_requested':r.received===r.expected?'ready':r.received?'partial':'open';
 r.history.push(`${now()} · ${p.title} · ${p.state} · ${p.evidence??''} ${p.reason??''}`);
 const w=m.work[workKey(e.id,r.form)];
 if(r.status==='complete'&&w&&canEdit(m,w)){const accepted=parts.flatMap(x=>x.state==='accepted'&&x.evidence?[x.evidence]:[]);changeWork(m,w.id,w.values,[...new Set([...w.evidence.filter(id=>m.evidence.some(ev=>ev.id===id&&ev.status==='accepted')),...accepted])]);}
 recordEvent(m,`${r.id} · ${p.title}: ${p.state}`,r.form);
}
export function recordSampleTest(m:Model,unit:string,result:'pass'|'exception',detail:string,amount:number){
 const e=m.engagements.find(e=>e.id===m.engagement)!,w=m.work[workKey(e.id,'3.1.2')],selection=currentSelection(m,e.id);
 if(!selection?.ids.includes(unit)||!canEdit(m,w)||readiness(m,w).length||!detail.trim()||!Number.isFinite(amount)||amount<0)throw Error('Одоогийн сонголт, үнэлсэн баримт, тайлбар болон хүчинтэй дүн шаардлагатай.');
 const id=`${w.id}/${unit}`,key=`sample.${selection.stamp}.${unit}`;
 const finding=m.findings.find(f=>f.id===id);
 if(finding?.resolution||finding?.status==='posted_verified')throw Error('Шийдвэрлэсэн илрүүлэлтийг хадгална; тусдаа нөлөөллийн үнэлгээ шаардлагатай.');
 if(finding&&result==='pass')throw Error('Бүртгэсэн илрүүлэлтийг тайлагналын хэсэгт тусад нь шийдвэрлэнэ.');
 changeWork(m,w.id,{...w.values,[key]:`${result}: ${detail.trim()}`});
 if(result==='exception'){
  const data:Finding={id,engagement:e.id,form:w.form,title:`${unit} · ${detail.trim()}`,amount,status:'identified',evidence:'',qualitative:'Түүврийн шалгалтын зөрүү',sampleId:unit};
  if(finding)Object.assign(finding,data);else m.findings.push(data);
 }
 recordEvent(m,`3.1.2 · ${unit} шалгалтын үр дүнг бүртгэв`,w.form);
}
export function resolveFinding(m:Model,id:string,note:string){
 const e=partnerEngagement(m),f=m.findings.find(f=>f.id===id&&f.engagement===e.id);
 if(e.locked||!f||!note.trim()||!isCurrentReview(m.work[workKey(e.id,f.form)]))throw Error('Одоогийн ажлын хяналт болон шийдвэрийн үндэслэл шаардлагатай.');
 f.resolution=note.trim();recordEvent(m,`${f.id} · Партнерын шийдвэр бүртгэв`,f.form);
}
export function verifyPosting(m:Model,id:string,reference:string){
 const e=partnerEngagement(m),f=m.findings.find(f=>f.id===id&&f.engagement===e.id);
 if(e.locked||!f||!reference.trim()||!isCurrentReview(m.work[workKey(e.id,f.form)]))throw Error('Хянагдсан ажил ба бичилтийн эх баримтын ишлэл шаардлагатай.');
 f.evidence=reference.trim();f.status='posted_verified';recordEvent(m,`${f.id} · Бичилтийн тулгалтыг демод бүртгэв`,f.form);
}
export function resolveQualityConcern(m:Model,id:string,note:string){
 const e=m.engagements.find(e=>e.id===m.engagement)!,concern=e.qualityConcerns.find(c=>c.id===id);
 if(!permitted(m,e.id)||m.person!=='saruul'||e.locked||!concern||concern.resolved||!note.trim())throw Error('Томилсон хянагчийн шийдвэрийн үндэслэл шаардлагатай.');
 concern.resolved=true;e.eqrReview=undefined;e.eqrComplete=false;recordEvent(m,`${id} · ${note.trim()}`,'4.6');
}
