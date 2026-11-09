import type {Model,WorkItem} from './workspace';

export type Theme='light'|'dark'|'system';
export type Contact={id:string;name:string;role:string;email:string;body:string;signer:boolean};
export type Client={name:string;legalForm:string;registration:string;framework:string;contacts:Contact[];bodies:string[]};
export type Period={start:string;end:string};
export type Field={key:string;label:string;type:string;source:string;section?:string;options?:string[];required?:boolean;instruction?:string;binding?:'name'|'legalForm'|'registration'|'period'|'contacts';when?:{key:string;value:string};columns?:{key:string;label:string;type:string}[]};
export type Template={id:string;title:string;stage:number;fields:Field[];family:string;sheet:string;purpose?:string;clauses?:{text?:string;label?:string;source?:string}[]};
type Revision={number:number;body:Template;by:string;at:string;note:string};
type Draft={body:Template;by:string;submitted:boolean;note:string};
type Access='view'|'prepare'|'review'|'assign';
type Override=Partial<Record<Access,boolean>>;
export type Bench={clients:Record<string,Client>;periods:Record<string,Period>;drafts:Record<string,Draft>;releases:Record<string,Revision[]>;applied:Record<string,Template>;access:Record<string,Record<string,Override>>;theme:Theme};
export const DATE=/^\d{4}-\d{2}-\d{2}$/;
export const today=()=>new Date().toISOString().slice(0,10);
const label=(s:string)=>s.trim();
export function bench(m:Model):Bench {
 return m.bench??={clients:Object.fromEntries(m.engagements.map(e=>[e.id,{name:e.client,legalForm:e.client.endsWith('ХХК')?'ХХК':e.client.endsWith('ХК')?'ХК':'',registration:'',framework:'',bodies:[],contacts:[]}])),periods:Object.fromEntries(m.engagements.filter(e=>/^\d{4}$/.test(e.period)).map(e=>[e.id,{start:e.period+'-01-01',end:e.period+'-12-31'}])),drafts:{},releases:{},applied:{},access:{},theme:'system'};
}
function requireOpen(m:Model,engagement:string){
 const e=m.engagements.find(e=>e.id===engagement);
 if(!e||e.locked)throw Error('Энэ гэрээт ажлыг өөрчлөх боломжгүй.');
 return e;
}
function history(m:Model,w:WorkItem,action:string){
 w.history.unshift({version:w.version,values:{...w.values},evidence:[...w.evidence],by:m.person,at:new Date().toISOString(),action,template:structuredClone(m.bench?.applied[w.id])});
}
function stale(m:Model,w:WorkItem,reason:string){
 history(m,w,reason);w.version++;
 w.status=w.submittedVersion||w.reviewedVersion?'changed':w.status==='not_started'?'not_started':'in_progress';
 w.submittedVersion=undefined;w.completedAt=undefined;
}
export function sharedFields(m:Model,id:string) {
 const c=m.bench?.clients[id],p=m.bench?.periods[id];
 return {name:c?.name??'',legalForm:c?.legalForm??'',registration:c?.registration??'',period:p?`${p.start} — ${p.end}`:'',contacts:c?[...c.bodies,...c.contacts.map(x=>[x.name,x.role,x.body,x.signer?'Гарын үсэг зурах эрхтэй':''].filter(Boolean).join(' · '))].join('; '):''};
}
export function sharedForWork(m:Model,w:WorkItem) {
 const current=sharedFields(m,w.engagement);
 if(!['reviewed','submitted'].includes(w.status))return current;
 return Object.fromEntries(Object.entries(current).map(([key,value])=>[key,w.values['shared.'+key]??value])) as typeof current;
}
export function saveClient(m:Model,id:string,client:Client,period?:Period){
 const e=requireOpen(m,id);
 if(!label(client.name))throw Error('Байгууллагын нэр шаардлагатай.');
 const valid=(v:string)=>DATE.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
 if(period&&(!valid(period.start)||!valid(period.end)||period.start>period.end))throw Error('Тайлант үеийн эхлэх, дуусах өдрийг шалгана уу.');
 if(!period&&e.intake?.active)throw Error('Идэвхтэй гэрээт ажилд тайлант үе шаардлагатай.');
 const b=bench(m),prior=sharedFields(m,id);
 b.clients[id]=structuredClone(client);
 if(period)b.periods[id]={...period};else delete b.periods[id];
 e.client=client.name;e.period=period?.end.slice(0,4)??'';
 if(e.intake)e.intake.period=e.period;
 const next=sharedFields(m,id);
 for(const w of Object.values(m.work)){
  if(w.engagement!==id||!['submitted','reviewed'].includes(w.status))continue;
  const bindings=['1.1.1','1.4.3','4.1.A1'].includes(w.form)?Object.keys(prior):b.applied[w.id]?.fields.flatMap(f=>f.binding?[f.binding]:[])??[];
  if(bindings.some(key=>prior[key as keyof typeof prior]!==next[key as keyof typeof next])){
   for(const [key,value] of Object.entries(prior))w.values['shared.'+key]??=value;
   stale(m,w,'Компанийн эсвэл тайлант үеийн мэдээлэл өөрчлөгдсөн');
  }
 }
}
export function accessOverride(m:Model,w:WorkItem,person:string,action:Access){return m.bench?.access[w.id]?.[person]?.[action];}
export function grant(m:Model,w:WorkItem,actor:{id:string;role:string},person:{id:string;scope:string[];role:string},action:Access,value:boolean|undefined){
 requireOpen(m,w.engagement);
 if(actor.id!==m.person||actor.id===person.id||!person.scope.includes(w.engagement)||person.role==='quality'||!['reviewer','partner'].includes(actor.role))throw Error('Энэ эрхийг өөрчлөх боломжгүй.');
 if(action==='assign'&&actor.role!=='partner')throw Error('Томилгооны эрхийг партнер олгоно.');
 if(value&&action==='prepare'&&(w.reviewer===person.id||accessOverride(m,w,person.id,'review')))throw Error('Хянагч өөрийн ажлыг бэлтгэх эрхгүй.');
 if(value&&action==='review'&&(w.owner===person.id||accessOverride(m,w,person.id,'prepare')))throw Error('Бэлтгэгч өөрийн ажлыг хянах эрхгүй.');
 const roles=bench(m).access[w.id]??={},entry=roles[person.id]??={};
 if(value===undefined)delete entry[action];else entry[action]=value;
 m.activity.unshift({id:crypto.randomUUID(),engagement:w.engagement,form:w.form,at:new Date().toISOString(),by:m.person,text:`${person.id} · ${action} → ${value===undefined?'default':value?'allow':'deny'}`});
}
export function validateTemplate(t:Template){
 if(!t.title.trim()||!t.fields.length)throw Error('Маягтын нэр ба дор хаяж нэг асуулт шаардлагатай.');
 if(new Set(t.fields.map(f=>f.key)).size!==t.fields.length)throw Error('Асуултын ID давхардсан.');
 for(const f of t.fields){
  if(!f.label.trim())throw Error('Асуултын нэр хоосон байна.');
  if(['select','multiselect'].includes(f.type)&&(!f.options?.length||new Set(f.options).size!==f.options.length))throw Error('Сонголтыг хоосон эсвэл давхардсан утгагүй оруулна уу.');
  if(f.when&&!t.fields.some(other=>other.key===f.when?.key&&other.key!==f.key&&!other.when))throw Error('Нөхцөлийн эх асуулт олдсонгүй.');
 }
}
export function saveDraft(m:Model,t:Template,submit:boolean,note:string){
 validateTemplate(t);
 const previous=bench(m).drafts[t.id];
 if(previous&&previous.by!==m.person)throw Error('Өөр зохиогчийн нооргийг өөрчлөх боломжгүй.');
 if(submit&&m.person!=='temuulen')throw Error('Фирмийн маягт боловсруулах эрх шаардлагатай.');
 if(submit&&!note.trim())throw Error('Өөрчлөлтийн тайлбар оруулна уу.');
 bench(m).drafts[t.id]={body:structuredClone(t),by:m.person,submitted:submit,note:note.trim()};
}
export function publish(m:Model,id:string){
 const b=bench(m),d=b.drafts[id];if(m.person!=='bat'||!d?.submitted||d.by===m.person)throw Error('Өөр зохиогчийн хяналтад илгээсэн хувилбар болон нийтлэх эрх шаардлагатай.');
 validateTemplate(d.body);
 const list=b.releases[id]??=[];
 list.push({number:list.length+1,body:structuredClone(d.body),by:m.person,at:new Date().toISOString(),note:d.note});
 delete b.drafts[id];
}
export function applyTemplate(m:Model,engagement:string,t:Template,owner:string,reviewer:string){
 requireOpen(m,engagement);validateTemplate(t);
 if(owner===reviewer)throw Error('Бэлтгэгч ба хянагч өөр байна.');
 const id=engagement+'/'+t.id,b=bench(m),old=m.work[id];
 if(old){if(old.owner!==m.person&&!['temuulen','bat'].includes(m.person))throw Error('Энэ маягтын бэлтгэгч эсвэл ахлах шаардлагатай.');if(JSON.stringify(b.applied[id])===JSON.stringify(t))return id;stale(m,old,'Маягтын бүтцийн шинэ хувилбар');old.title=t.title;old.stage=t.stage;}
 else m.work[id]={id,engagement,form:t.id,title:t.title,stage:t.stage,owner,reviewer,start:'',due:'',baselineStart:'',baselineDue:'',estimate:0,actual:0,status:'not_started',version:1,values:{},evidence:[],notes:[],history:[],required:false};
 b.applied[id]=structuredClone(t);
 return id;
}
export function visibleField(f:Field,values:Record<string,string>){return !f.when||values[f.when.key]===f.when.value;}
export function missingFields(m:Model,w:WorkItem){
 const t=m.bench?.applied[w.id],shared=sharedFields(m,w.engagement);
 return t?.fields.filter(f=>visibleField(f,w.values)).flatMap(f=>{
  const v=f.binding?shared[f.binding]:w.values[f.key];
  if(f.required&&(!v?.trim()||v==='[]'))return [f.label];
  if(v==='Хамаарахгүй'&&!w.values[f.key+'.reason']?.trim())return [f.label+' · Хамаарахгүй үндэслэл'];
  return [];
 })??[];
}

export type Grid={name:string;rows:string[][];notes?:string[]};
export function templateFromGrid(grid:Grid):Template{
 const normalize=(s:string)=>s.trim().toLowerCase();
 const head=grid.rows[0]?.map(normalize)??[];
 const column=(...names:string[])=>head.findIndex(x=>names.includes(x));
 const q=column('question','асуулт'),type=column('type','answer type','төрөл'),choices=column('choices','options','сонголт'),section=column('section','бүлэг'),required=column('required','заавал');
 if(q<0)throw Error('Excel-ийн эхний мөрөнд Question багана шаардлагатай. Section, Type, Choices, Required нэмэлт багана ашиглаж болно.');
 const types:Record<string,string>={text:'text',long:'textarea',textarea:'textarea',yesno:'yesno','yes/no':'yesno',single:'select',select:'select',multiple:'multiselect',multiselect:'multiselect',date:'date',number:'number',amount:'number',evidence:'evidence',table:'table'};
 const fields=grid.rows.slice(1).flatMap((row,i)=>{
  const name=row[q]?.trim();if(!name)return [];
  const kind=normalize(row[type]??'text'),mapped=types[kind];if(!mapped)throw Error(`Мөр ${i+2}: төрөл танигдсангүй (${kind}).`);
  return [{key:'q'+crypto.randomUUID(),label:name,type:mapped,source:`${grid.name}! row ${i+2}`,section:row[section]?.trim()||undefined,options:row[choices]?.split(';').map(label).filter(Boolean),required:['yes','true','1','тийм'].includes(normalize(row[required]??''))}];
 });
 const t={id:'F-'+crypto.randomUUID().slice(0,8).toUpperCase(),title:grid.name,stage:1,fields,family:'questionnaire',sheet:grid.name};
 validateTemplate(t);return t;
}
