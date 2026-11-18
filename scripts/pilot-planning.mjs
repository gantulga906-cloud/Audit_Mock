import {actorKey} from './pilot-identity-context.mjs';
import {createHash,randomUUID} from 'node:crypto';
import {approvedRows,registerRows,pilotProgrammes} from './pilot-registers.mjs';
import {PilotError,input} from './pilot-workflow.mjs';
import {requireSeat,seatFor} from './pilot-staffing.mjs';
import {recordEvent,workKey,isCurrentReview} from '../src/lib/workspace.ts';
import {evidenceCurrent} from './pilot-requests.mjs';
import {validDate} from '../src/lib/feature-workflows.ts';
import {executionControlFailed} from './pilot-execution.mjs';

const bad=message=>{throw new PilotError(409,message);};
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const rows=(m,kind)=>registerRows(m).filter(r=>r.kind===kind);
const current=(m,id,kind)=>approvedRows(m,kind).find(r=>r.id===id);
const required=(v,keys)=>{for(const key of keys)if(!v[key]?.trim())bad('G02 · Дутуу утга · '+key);};
const evidence=(m,id)=>{if(!m.evidence.some(e=>e.id===id&&evidenceCurrent(m,e)))bad('G02 · Хүлээн зөвшөөрсөн одоогийн нотолгоо шаардлагатай.');};
export const managedPlanning=m=>m.pilotPlanning?.profile===1;
const targets=r=>[r.values.programme,...(r.values.programmes??'').split(/\r?\n/)].filter(Boolean);
export const planningRisks=(m,form)=>rows(m,'M06-F09').filter(r=>r.values.type==='overall'||targets(r).includes(form));
const coverage=(m,form)=>hash(planningRisks(m,form).map(r=>[r.id,r.version,r.status,
  ...rows(m,'M06-F11').filter(x=>x.values.risk===r.id).map(x=>[x.id,x.version,x.status])]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));

export function planningRecordStale(m,row){
 if(row.kind==='M06-F03'&&row.values.reliance==='supported'&&executionControlFailed(m,row.id))return true;
 if(row.kind==='M05-F08'&&row.planningBasis?.recipient){
  const recipient=row.planningBasis.recipient;
  if(recipient.revision!==(m.pilotRecipientRevisions?.[recipient.role]??0))return true;
 }
 if(row.kind==='M06-F14'&&row.planningBasis){
  const programme=registerRows(m).find(r=>r.id===row.values.programme);
  if(!programme||row.planningBasis.coverage!==coverage(m,programme.template?.form))return true;
  const now=approvedRows(m,'M04-F06').filter(r=>r.values.result==='suitable').map(r=>[r.id,r.version]).sort();
  if(JSON.stringify(now)!==JSON.stringify((row.planningBasis.assignments??[]).map(r=>[r.id,r.version]).sort()))return true;
 }
 return false;
}

export function responseLinks(m,row,contract,refs){
 let links=[];
 if(row.values.responses){try{links=JSON.parse(row.values.responses);}catch{bad('Эрсдэл–горимын холбоосын өгөгдөл буруу.');}}
 if(!Array.isArray(links)||links.length>40)bad('Нэг шийдвэрт 40 хүртэл холбоос оруулна уу.');
 const primary={risk:row.values.risk,procedure:row.values.procedure,nature:row.values.nature,timing:row.values.timing,extent:row.values.extent,scope:row.values.basis};
 if(primary.procedure&&!links.some(x=>x.risk===primary.risk&&x.procedure===primary.procedure))links.unshift(primary);
 const seen=new Set();
 const result=links.map(link=>{
  if(!link||typeof link!=='object'||Array.isArray(link)||Object.values(link).some(v=>typeof v!=='string'||v.length>4000))bad('Эрсдэл–горимын холбоосыг шалгана уу.');
  required(link,['risk','procedure','nature','timing','extent','scope']);
  const risk=current(m,link.risk,'M06-F09'),procedure=contract.fields.find(f=>f.type==='procedure'&&!f.when&&f.key===link.procedure);
  if(!risk||risk.values.type==='overall'||!targets(risk).includes(row.template.form)||!procedure)bad('Одоогийн эрсдэл, бодит хөтөлбөрийн хүрээ ба яг сонгосон горим шаардлагатай.');
  const key=risk.id+':'+procedure.key;if(seen.has(key))bad('Эрсдэл–горимын холбоос давхардсан.');seen.add(key);
  refs[risk.id]=risk.version;
  let control;
  if(link.control){control=current(m,link.control,'M06-F03');if(!control||control.values.risk!==risk.id)bad('Энэ эрсдэлийн одоогийн хяналтыг холбоно уу.');refs[control.id]=control.version;}
  if(managedPlanning(m)&&row.values.approach==='reliance'&&(!control||control.values.reliance!=='supported'))bad('Хяналтад найдах холбоос бүр бодит сорилоор дэмжигдсэн хяналттай байна.');
  return {...link,riskVersion:risk.version,label:procedure.label,target:risk.values.target,assertion:risk.values.assertion,...(control&&{controlVersion:control.version})};
 });
 if(managedPlanning(m)&&row.values.decision==='adopt'&&!result.length)bad('G02 · Хариу горимын бодит холбоос шаардлагатай.');
 return result;
}

export function checkPlanningRecord(m,row,refs,files){
 const v=row.values,strict=managedPlanning(m);
 switch(row.kind){
 case 'M05-F02':
  if(approvedRows(m,row.kind).some(r=>r.id!==row.id))bad('Одоогийн хүрээ ба арга зүйн бүртгэлийг шинэ хувилбараар засна уу.');
  if(v.group==='yes'&&!v.components)bad('Бодит бүрэлдэхүүн ба хариуцлагыг тодорхойлно уу.');
  if(!v.assertions.split(/\r?\n/).filter(x=>x.trim()).length)bad('Фирмийн хэрэглэх батламжийн нэршлийг оруулна уу.');
  break;
 case 'M05-F04':
  if(v.start>v.due)bad('Эхлэх өдөр дуусах өдрөөс хойш байна.');
  if(v.type==='statutory')evidence(m,v.authority);
  // The independent partner approves acceptance of a documented conflict; no audit work is waived.
  break;
 case 'M05-F05':
  if(v.start>v.end||Number(v.hours)<=0)bad('Төсвийн хугацаа ба эерэг цагийг шалгана уу.');break;
 case 'M06-F02':
  if(strict)required(v,['systems','transactions','openFacts']);break;
 case 'M06-F09':{
  if(v.type==='overall'){
   if(v.target||v.assertion||v.programme||v.programmes)bad('Нийт түвшний эрсдэлд зохиомол данс, батламж эсвэл горим холбохгүй.');
  }else{
   required(v,['target','assertion','programme']);
   if(targets(row).some(form=>!pilotProgrammes.some(p=>p.id===form)))bad('Бодит хамрах хөтөлбөрийн дугаарыг сонгоно уу.');
   if(strict){const profile=approvedRows(m,'M05-F02')[0];if(!profile||!profile.values.assertions.split(/\r?\n/).map(x=>x.trim()).includes(v.assertion))bad('Баталсан арга зүйн батламжийн нэршлийг ашиглана уу.');refs[profile.id]=profile.version;}
  }
  if(strict)required(v,['entity','assessment','contradictions']);break;
 }
 case 'M06-F03':
  if(v.implementation==='observed')evidence(m,v.walkthrough);
  if(v.operating!=='not-tested'){
   required(v,['from','through','population','sample','performance','deviations']);evidence(m,v.performance);
   if(v.from>v.through||v.through>new Date().toISOString().slice(0,10))bad('Бодит сорилын хамрах хугацааг шалгана уу.');
  }
  if(v.reliance==='supported'&&(v.design!=='adequate'||v.implementation!=='observed'||v.operating!=='effective'))bad('Лавлагаа, загвар эсвэл хэрэгжилт дангаараа үр нөлөөний нотолгоо болохгүй.');
  if(v.reliance==='supported'){
   const period=m.bench?.periods[m.engagement];
   if(period&&(v.from>period.start||v.through<period.end)){required(v,['coverageBasis']);evidence(m,v.coverageEvidence);}
  }
  if((v.design==='deficient'||v.operating==='failed')&&!v.followup)bad('Доголдол ба бүтэлгүй сорилын нэмэлт ажил / мэдээллийн арга хэмжээг тодорхойлно уу.');
  break;
 case 'M06-F05':
  if(strict||v.type){
   required(v,['type','partyName','suitability','evaluation','result']);
   if(v.result==='sufficient')evidence(m,v.evidence);
   if(v.result!=='sufficient')required(v,['followup']);
   if(v.type==='direct-assistance'){required(v,['permission']);evidence(m,v.permissionEvidence);}
   if(v.type==='component'&&approvedRows(m,'M05-F02')[0]?.values.group!=='yes')bad('Бүрэлдэхүүний ажилд баталсан группийн хүрээ шаардлагатай.');
   if(v.type==='opening')required(v,['comparatives']);
  }break;
 case 'M06-F11':
  if(current(m,v.risk,'M06-F09')?.values.type!=='overall')bad('Нийт түвшний бодит эрсдэлийг сонгоно уу.');break;
 case 'M06-F13':
  if(v.type==='held'){evidence(m,v.evidence);if(v.date>new Date().toISOString().slice(0,10))bad('Ирээдүйн урилга бодитоор хэлэлцсэнд тооцогдохгүй.');}break;
 case 'M06-F14':{
  const programme=current(m,v.programme,'M07-F01'),discussion=current(m,v.discussion,'M06-F13'),milestone=current(m,v.milestone,'M05-F04');
  if(programme?.values.decision!=='adopt'||discussion?.values.type!=='held'||milestone?.values.conflict==='open')bad('Бодит хэлэлцүүлэг, хэрэгжүүлэх хөтөлбөр ба шийдсэн хугацааны зөрчил шаардлагатай.');
  const covered=new Set(programme.programmeBasis?.responses?.map(r=>r.risk)??[programme.values.risk]);
  for(const risk of planningRisks(m,programme.template.form)){
   if(!current(m,risk.id,'M06-F09'))bad('Шинэ / өөрчлөгдсөн эрсдэлийг хараат бусаар хянана уу.');
   refs[risk.id]=risk.version;
   if(risk.values.type==='overall'){
    const response=approvedRows(m,'M06-F11').find(r=>r.values.risk===risk.id);if(!response)bad('Нийт түвшний эрсдэлийн нөөц / хяналтын хариу дутуу.');refs[response.id]=response.version;
   }else if(!covered.has(risk.id))bad('Хөтөлбөрийн хүрээний эрсдэлд бодит хариу горим дутуу · '+risk.values.risk);
  }
  const assignments=approvedRows(m,'M04-F06').filter(r=>r.values.result==='suitable');
  for(const capacity of ['preparer','reviewer','partner'])if(!assignments.some(r=>r.values.capacity===capacity))bad('Одоогийн багийн томилгоо дутуу.');
  assignments.forEach(r=>{refs[r.id]=r.version;});
  row.planningBasis={coverage:coverage(m,programme.template.form),assignments:assignments.map(r=>({id:r.id,version:r.version})),programme:{id:programme.id,version:programme.version}};
  break;
 }
 case 'M05-F08':{
  const strategy=current(m,v.strategy,'M06-F14'),programme=strategy&&current(m,strategy.values.programme,'M07-F01');
  if(!programme)bad('Хүлээлгэн өгөх стратегийн одоогийн хувилбар шаардлагатай.');
  if(!files.member(v.nextOwner)||!seatFor(m,v.nextOwner))bad('Хүлээн авах хариуцагчид бодит хандах эрх ба одоогийн томилгоо шаардлагатай.');
  const paper=m.work[workKey(m.engagement,programme.template.form)];
  row.planningBasis={programme:{id:programme.id,version:programme.version},recipient:{role:v.nextOwner,revision:m.pilotRecipientRevisions?.[v.nextOwner]??0},openWork:paper?[{form:paper.form,version:paper.version,status:paper.status}]:[]};
  break;
 }
 }
}

export function planningGap(m,form){
 if(!managedPlanning(m))return '';
 const programme=approvedRows(m,'M07-F01').find(r=>r.template?.form===form&&r.values.decision==='adopt');
 if(!programme)return 'G02 · Хөтөлбөрийн одоогийн шийдвэр шаардлагатай.';
 const strategy=approvedRows(m,'M06-F14').find(r=>r.values.programme===programme.id);
 if(!strategy)return 'G02 · Эрсдэлийн бүрэн хариу ба стратегийн одоогийн баталсан суурь шаардлагатай.';
 if(!approvedRows(m,'M05-F08').some(r=>r.values.strategy===strategy.id&&r.values.readiness==='ready'))return 'G02 · Бодит хувилбар, дараагийн хариуцагчтай бэлэн хүлээлцэх бүртгэл шаардлагатай.';
 return '';
}

export function planningAction(m,role,action,data,files){
 if(files.archive.isSealed(m))bad('Архив түгжээтэй.');
 if(action==='planning-enable'){
  if(role!=='partner')throw new PilotError(403,'Партнерын эрх шаардлагатай.');
  if(!m.engagements[0]?.intake.active)bad('Идэвхтэй гэрээт ажил шаардлагатай.');
  if(!managedPlanning(m)){m.pilotPlanning={profile:1,by:actorKey(role),at:new Date().toISOString(),reason:input(data,'reason')};recordEvent(m,'G02 · Өмнөх ажлыг хадгалж, төлөвлөлтийн хяналт идэвхжүүлэв');}return;
 }
 if(!managedPlanning(m)||!m.engagements[0]?.intake.active)bad('G02 · Төлөвлөлтийн горимыг идэвхжүүлнэ үү.');
 const from=input(data,'from',40),through=input(data,'through',40);
 const timestamp=/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{3})?)?(?:Z|[+-]\d\d:\d\d)$/;
 if(!timestamp.test(from)||!timestamp.test(through)||!validDate(from.slice(0,10))||!validDate(through.slice(0,10)))bad('Цагийн бүс бүхий бодит эхлэх / дуусах цаг оруулна уу.');
 const start=Date.parse(from),end=Date.parse(through),minutes=(end-start)/60000;
 if(!Number.isInteger(minutes)||minutes<=0||minutes>24*60||end>Date.now())bad('Нэг бүртгэлд өнгөрсөн бодит 24 цаг хүртэл хугацаа оруулна уу.');
 requireSeat(m,files,role,from.slice(0,10),through.slice(0,10));
 const seat=seatFor(m,role,from.slice(0,10),through.slice(0,10)),person=seat?.person;
 if(!person)bad('Нэртэй этгээдийн томилгоо шаардлагатай.');
 const entries=m.pilotEffort??=[],old=data.supersedes&&entries.find(e=>e.id===data.supersedes);
 if(data.supersedes&&(!old||old.by!==actorKey(role)||old.person!==person||entries.some(e=>e.supersedes===old.id)))bad('Зөвхөн өөрийн одоогийн бодит цагийг шалтгаантай залруулна.');
 const work=input(data,'work',32);if(!m.work[workKey(m.engagement,work)])bad('Энэ гэрээт ажлын бодит ажлын баримтыг сонгоно уу.');
 for(const model of files.staffingModels(m)){
  const all=model.pilotEffort??[],replaced=new Set(all.map(e=>e.supersedes));
  if(all.some(e=>e.person===person&&!replaced.has(e.id)&&!(model.engagement===m.engagement&&e.id===old?.id)&&Date.parse(e.from)<end&&Date.parse(e.through)>start))bad('Тухайн этгээдийн бодит цаг өөр бүртгэлтэй давхцаж байна.');
 }
 entries.push({id:randomUUID(),person,by:actorKey(role),assignment:seat&&{id:seat.id,version:seat.version},from,through,minutes,work,purpose:input(data,'purpose'),
  ...(old&&{supersedes:old.id,correction:input(data,'reason')}),at:new Date().toISOString()});
 recordEvent(m,'G02 · Бодит цаг '+minutes+' минут · '+work,work);
}

export function planningView(m,role){
 const all=m.pilotEffort??[],replaced=new Set(all.map(e=>e.supersedes));
 return {managed:managedPlanning(m),effort:all.filter(e=>role!=='preparer'||e.by===actorKey(role)).map(e=>({...e,current:!replaced.has(e.id)})),
  programmes:approvedRows(m,'M07-F01').filter(r=>r.values.decision==='adopt').map(r=>({form:r.template.form,gap:planningGap(m,r.template.form),
   risks:planningRisks(m,r.template.form).map(risk=>({id:risk.id,name:risk.values.risk,version:risk.version,status:risk.status,type:risk.values.type})),
   responses:r.programmeBasis?.responses??[]}))};
}
