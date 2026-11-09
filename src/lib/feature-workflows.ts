import {
 canEdit,canReadWork,inScope,now,personById,PERSONS,recordEvent,workKey,
 type Engagement,type Model,type RequestItem,type WorkItem,
} from './workspace.ts';
import {applyTemplate,bench,DATE,type Client,type Period,type Template} from './workbench.ts';

export type Company={id:string;profile:Client;industry:string;status:'prospect'|'active'|'suspended'|'former';by:string};
export type EngagementTeam={preparer:string;reviewer:string;partner:string;quality?:string};
export const validDate=(v:string)=>DATE.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const manager=(m:Model)=>['reviewer','partner'].includes(personById(m.person).role);

export function initCompanies(m:Model){
 const b=bench(m),companies=m.companies??={};
 for(const e of m.engagements){
  e.companyId??='client-'+e.id;
  companies[e.companyId]??={id:e.companyId,profile:structuredClone(b.clients[e.id]),industry:e.industry,status:e.acceptance==='accepted'?'active':'prospect',by:'seed'};
 }
 return companies;
}

export function canSeeCompany(m:Model,c:Company){
 return personById(m.person).role!=='quality'&&(c.by===m.person||
  (manager(m)&&!m.engagements.some(e=>e.companyId===c.id))||
  m.engagements.some(e=>e.companyId===c.id&&inScope(m,m.person,e.id)));
}

export function createCompany(m:Model,profile:Client,industry:string){
 if(!manager(m))throw Error('Компани бүртгэхэд ахлах аудитор эсвэл партнерын эрх шаардлагатай.');
 if(!profile.name.trim()||!profile.legalForm.trim()||!profile.registration.trim())throw Error('Компанийн нэр, хуулийн хэлбэр, бүртгэлийн дугаар шаардлагатай.');
 if(!profile.contacts.some(c=>c.name.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())))throw Error('Нэр, имэйлтэй холбоо барих хүн бүртгэнэ үү.');
 const companies=initCompanies(m),registration=profile.registration.replace(/\s/g,'').toLowerCase();
 if(Object.values(companies).some(c=>c.profile.registration.replace(/\s/g,'').toLowerCase()===registration))throw Error('Энэ бүртгэлийн дугаартай компани байна.');
 const id=crypto.randomUUID();
 companies[id]={id,profile:structuredClone(profile),industry:industry.trim(),status:'prospect',by:m.person};
 return id;
}

export function setCompanyStatus(m:Model,id:string,status:Company['status']){
 const c=initCompanies(m)[id];
 if(!c||!manager(m)||!canSeeCompany(m,c))throw Error('Компанийн төлөв өөрчлөх эрхгүй.');
 c.status=status;
}

export function createEngagement(m:Model,companyId:string,period:Period,reportDate:string,team:EngagementTeam,forms:{id:string;title:string;stage:number}[],carriedFrom?:string){
 const c=initCompanies(m)[companyId],b=bench(m);
 if(!manager(m)||!c||!canSeeCompany(m,c))throw Error('Гэрээт ажил үүсгэхэд эрх шаардлагатай.');
 if(['suspended','former'].includes(c.status))throw Error('Компанийн төлөв шинэ ажил эхлүүлэх боломжгүй.');
 if(!validDate(period.start)||!validDate(period.end)||period.start>period.end||!validDate(reportDate)||reportDate<period.end)throw Error('Тайлант үе болон зорилтот гаргалтын өдрийг шалгана уу.');
 if(!(['preparer','reviewer','partner','quality'] as const).every(role=>role==='quality'&&!team[role]||PERSONS.some(p=>p.id===team[role]&&p.role===role))||!Object.values(team).includes(m.person))throw Error('Багийн хүчинтэй, тусдаа томилгоо шаардлагатай.');
 const earlier=m.engagements.filter(e=>e.companyId===c.id);
 if(earlier.some(e=>{const p=b.periods[e.id];return p&&p.start<=period.end&&p.end>=period.start;}))throw Error('Энэ компанийн тайлант үетэй давхцаж байна.');
 if(carriedFrom&&!earlier.some(e=>e.id===carriedFrom&&inScope(m,m.person,e.id)&&b.periods[e.id]?.end<period.start))throw Error('Хандах эрхтэй өмнөх тайлант үе сонгоно уу.');
 const contact=c.profile.contacts.find(x=>x.signer&&x.name.trim())??c.profile.contacts.find(x=>x.name.trim());
 const id='E-'+crypto.randomUUID(),year=period.end.slice(0,4);
 const e:Engagement={
  id,companyId,team:{...team},carriedFrom,client:c.profile.name,industry:c.industry,
  initials:c.profile.name.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase(),
  period:year,kind:earlier.length?'Үргэлжилсэн аудит':'Шинэ үйлчлүүлэгч',phase:'Хүлээн авах',reportDate,
  acceptance:'pending',termsAgreed:false,independence:false,formalEqr:!!team.quality,eqrComplete:false,
  fsVersion:1,reportVersion:1,reportFsVersion:1,recipients:contact?[{name:contact.name,status:'pending'}]:[],
  locked:false,custody:'none',hold:false,followup:false,qualityConcerns:[],
  intake:{contact:contact?.name??'',origin:'firm',period:year,facts:'',active:false},
 };
 m.engagements.push(e);
 b.clients[id]=structuredClone(c.profile);
 b.periods[id]={...period};
 m.datasets[id]={name:'Өгөгдөл импортлоогүй',version:0,rows:[],sourceTotal:0,importedAt:''};
 m.samples[id]={size:1,seed:2026,designVersion:1,selected:[]};
 m.library.adopted[id]=m.library.version;
 for(const f of forms){
  const key=workKey(id,f.id),partnerPaper=['4.4','4.1.A1'].includes(f.id);
  m.work[key]={id:key,engagement:id,form:f.id,title:f.title,stage:f.stage,
   owner:partnerPaper?team.reviewer:team.preparer,reviewer:partnerPaper?team.partner:team.reviewer,
   start:'',due:'',baselineStart:'',baselineDue:'',estimate:0,actual:0,status:'not_started',version:1,
   values:{},evidence:[],notes:[],history:[],required:true};
 }
 m.engagement=id;
 recordEvent(m,'Шинэ гэрээт ажил бүртгэв','1.1.1');
 return id;
}

export const issuedRequest=(r:RequestItem)=>!r.dispatch||r.dispatch==='issued';

function requestContext(m:Model,form:string){
 const e=m.engagements.find(x=>x.id===m.engagement),w=m.work[workKey(m.engagement,form)];
 if(!e||!w||e.locked||e.intake&&!e.intake.active||!canReadWork(m,w)||personById(m.person).role==='quality')throw Error('Идэвхтэй гэрээт ажил болон ажилд хандах эрх шаардлагатай.');
 return w;
}

export function createRequest(m:Model,input:{title:string;form:string;contactId:string;owner:string;due:string;message:string;parts:string[]}){
 const w=requestContext(m,input.form),contact=bench(m).clients[m.engagement]?.contacts.find(x=>x.id===input.contactId);
 if(!manager(m)&&!canEdit(m,w))throw Error('Хүсэлт үүсгэх томилгоо шаардлагатай.');
 if(!inScope(m,input.owner,m.engagement)||personById(input.owner).role==='quality'||(!manager(m)&&input.owner!==m.person))throw Error('Багийн хүчинтэй хариуцагч сонгоно уу.');
 if(!contact?.name.trim()||!contact.email.trim())throw Error('Нэр, имэйлтэй холбоо барих хүн сонгоно уу.');
 const titles=input.parts.map(x=>x.trim()).filter(Boolean);
 if(!input.title.trim()||!validDate(input.due)||!titles.length||new Set(titles).size!==titles.length)throw Error('Нэр, хугацаа болон давхардалгүй баримтын жагсаалт шаардлагатай.');
 const id='REQ-'+crypto.randomUUID().slice(0,8).toUpperCase(),parts=titles.map(title=>({id:crypto.randomUUID(),title,state:'missing' as const}));
 m.requests.unshift({id,dispatch:'draft',engagement:m.engagement,title:input.title.trim(),form:w.form,
  contactId:contact.id,contact:contact.name,contactEmail:contact.email,owner:input.owner,due:input.due,message:input.message.trim(),
  parts,status:'open',received:0,expected:parts.length,evidence:[],history:[now()+' · Ноорог үүсгэв']});
 recordEvent(m,id+' · Хүсэлтийн ноорог',w.form);
}

export function updateRequest(m:Model,id:string,action:'issue'|'cancel'|'followup',text=''){
 const r=m.requests.find(x=>x.engagement===m.engagement&&x.id===id);
 if(!r)throw Error('Хүсэлт олдсонгүй.');
 const paper=requestContext(m,r.form);
 if(r.owner!==m.person&&!manager(m))throw Error('Хүсэлтийн эзэн эсвэл ахлах шаардлагатай.');
 const note=text.trim(),at=now();
 if(action==='issue'){
  if(r.dispatch!=='draft')throw Error('Зөвхөн ноорог гаргана.');
  r.dispatch='issued';r.issuedAt=at;
  if(['submitted','reviewed'].includes(paper.status)){
   paper.history.unshift({version:paper.version,values:{...paper.values},evidence:[...paper.evidence],template:structuredClone(m.bench?.applied[paper.id]),by:m.person,at,action:'Нэмэлт нотлох баримт хүсэв'});
   paper.version++;paper.status='changed';paper.submittedVersion=undefined;paper.completedAt=undefined;
  }
 }else if(action==='cancel'){
  if(r.dispatch==='cancelled'||r.status==='complete'||!note)throw Error('Хаах шалтгаан болон нээлттэй хүсэлт шаардлагатай.');
  r.dispatch='cancelled';
 }else{
  if(!issuedRequest(r)||r.status==='complete'||!note)throw Error('Нээлттэй, гаргасан хүсэлт ба тэмдэглэл шаардлагатай.');
  (r.followUps??=[]).push({at,by:m.person,text:note});
 }
 const label={issue:'Гаргасан гэж тэмдэглэв',cancel:'Хаав',followup:'Дагаж тодруулав'}[action];
 r.history.push([at,personById(m.person).name,label,note].filter(Boolean).join(' · '));
 recordEvent(m,r.id+' · '+label,r.form);
}

export function canTailor(m:Model,w:WorkItem){
 const e=m.engagements.find(e=>e.id===w.engagement);
 return !!e&&!e.locked&&(!e.intake||e.intake.active)&&canReadWork(m,w)&&(canEdit(m,w)||manager(m));
}

export function registerRisk(m:Model,w:WorkItem,title:string,assertion:string,response:string,significance:string){
 if(!canTailor(m,w)||![title,assertion,response,significance].every(s=>s.trim()))throw Error('Эрсдэл, батламж, ач холбогдол, хариу арга хэмжээ шаардлагатай.');
 const id='R-'+crypto.randomUUID().slice(0,8);
 m.risks.push({id,engagement:w.engagement,title:title.trim(),assertion:assertion.trim(),significance,response:response.trim(),forms:[w.form],conclusion:'Үнэлгээ хүлээгдэж буй'});
 recordEvent(m,id+' · Эрсдэл бүртгэв',w.form);
}

export function tailorProgram(m:Model,id:string,base:Template,input:{mode:'add'|'adapt'|'na';key?:string;label:string;reason:string;risk?:string;assertion?:string}){
 const w=m.work[id],b=bench(m);
 if(!w||base.id!==w.form||!canTailor(m,w))throw Error('Хөтөлбөр өөрчлөх томилгоо шаардлагатай.');
 const prior=b.applied[id]??base;
 if(prior.family!=='programme')throw Error('Аудитын хөтөлбөрийн маягт сонгоно уу.');
 if(input.mode==='na'&&!manager(m))throw Error('Хамаарахгүй горимыг ахлах эсвэл партнер тэмдэглэнэ.');
 const reason=input.reason.trim(),label=input.label.trim(),risk=m.risks.find(r=>r.id===input.risk&&r.engagement===w.engagement);
 if(!reason||input.mode!=='na'&&!label||input.risk&&!risk)throw Error('Горим, өөрчлөлтийн үндэслэл болон эрсдэлийн холбоосыг шалгана уу.');
 const updated=structuredClone(prior),field=updated.fields.find(f=>f.key===input.key&&f.type==='procedure');
 const info={reason,risk:risk?.id,assertion:input.assertion?.trim()||risk?.assertion,by:m.person,at:now()};
 if(input.mode==='add'){
  updated.fields.push({key:'step-'+crypto.randomUUID(),label,type:'procedure',source:'Гэрээт ажилд нэмсэн',section:'Нэмсэн горим',required:true,tailoring:{...info,state:'added'}});
 }else if(field){
  if(input.mode==='adapt')field.label=label;
  field.tailoring={...info,state:input.mode==='na'?'na':'adapted'};
 }else throw Error('Өөрчлөх горим сонгоно уу.');
 b.applied[id]??=structuredClone(prior);
 applyTemplate(m,w.engagement,updated,w.owner,w.reviewer);
 if(field&&input.mode==='adapt')for(const key of Object.keys(w.values)){
  if(key===field.key||key.startsWith(field.key+'.'))delete w.values[key];
 }
 if(risk&&!risk.forms.includes(w.form))risk.forms.push(w.form);
 recordEvent(m,w.form+' · Горимын бүтэц шинэчлэв',w.form);
}
